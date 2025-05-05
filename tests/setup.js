const { setDefaultOptions } = require('expect-puppeteer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

// Configure timeouts based on env vars
const timeout = parseInt(process.env.JEST_TIMEOUT) || 30000;
jest.setTimeout(timeout);

// Configure test environment
process.env.NODE_ENV = 'test';

// Use a fixed extension ID for unit tests
const EXTENSION_ID = 'test-extension-id';
global.__EXTENSION_ID__ = EXTENSION_ID;

// Set up a global emergency timeout to kill tests that run too long
let globalEmergencyTimeout;
const GLOBAL_EMERGENCY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// Handle proper test shutdown
const setupProperShutdown = () => {
  // Store active resources for cleanup
  const activeResources = {
    browser: null,
    page: null,
    videos: [],
    screenshots: []
  };

  // Set up emergency timeout to kill tests if they run too long
  const startEmergencyTimeout = () => {
    if (globalEmergencyTimeout) {
      clearTimeout(globalEmergencyTimeout);
    }
    console.log(`Setting emergency timeout (${GLOBAL_EMERGENCY_TIMEOUT_MS}ms)`);
    
    globalEmergencyTimeout = setTimeout(() => {
      console.error('EMERGENCY TIMEOUT: Tests have been running too long, forcing exit');
      process.exit(1); // Force exit with error code
    }, GLOBAL_EMERGENCY_TIMEOUT_MS);
    
    // Make sure timeout is cleared when process exits
    globalEmergencyTimeout.unref();
  };

  // Signal handlers for graceful shutdown
  const handleSignal = async (signal) => {
    console.log(`Received ${signal}, cleaning up...`);
    
    try {
      // Clear emergency timeout
      if (globalEmergencyTimeout) {
        clearTimeout(globalEmergencyTimeout);
      }
      
      // Clean up browser resources
      if (global.__BROWSER__) {
        try {
          console.log('Closing browser...');
          await global.__BROWSER__.close();
        } catch (err) {
          console.error('Error closing browser:', err.message);
        }
      }
      
      // Clean up page resources
      if (global.page) {
        try {
          console.log('Closing page...');
          await global.page.close();
        } catch (err) {
          console.error('Error closing page:', err.message);
        }
      }
      
      console.log('Cleanup complete, exiting...');
      process.exit(signal === 'SIGTERM' ? 0 : 1);
    } catch (err) {
      console.error('Error during cleanup:', err);
      process.exit(1);
    }
  };

  // Register signal handlers
  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    handleSignal('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    handleSignal('unhandledRejection');
  });

  // Start the emergency timeout
  startEmergencyTimeout();

  return {
    startEmergencyTimeout,
    handleSignal
  };
};

// Mock Chrome API for unit tests
if (!global.__BROWSER__) {
  // Set up storage mock
  const createStorageMock = () => {
    const storage = {};
    return {
      sync: {
        get: jest.fn((keys, callback) => {
          const result = {};
          keys.forEach(key => result[key] = storage[key]);
          callback(result);
        }),
        set: jest.fn((items, callback) => {
          Object.assign(storage, items);
          if (callback) callback();
        }),
        remove: jest.fn((keys, callback) => {
          keys.forEach(key => delete storage[key]);
          if (callback) callback();
        })
      }
    };
  };

  global.chrome = {
    runtime: {
      getURL: jest.fn(path => `chrome-extension://${EXTENSION_ID}/${path}`),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      sendMessage: jest.fn(),
      getManifest: jest.fn(() => require('./__mocks__/manifest.json'))
    },
    scripting: {
      executeScript: jest.fn()
    },
    tabs: {
      query: jest.fn(),
      sendMessage: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    storage: createStorageMock()
  };

  // Mock window methods commonly used in tests
  Object.defineProperty(global, 'window', {
    value: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      location: new URL('https://test.com'),
      document: global.document,
      fetch: global.fetch,
      chrome: global.chrome
    },
    writable: true
  });

  // Set up document object
  if (!global.document) {
    global.document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      getElementById: jest.fn(),
      getElementsByTagName: jest.fn(),
      getElementsByClassName: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(),
      createElement: jest.fn(tag => ({
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        style: {},
        tagName: tag.toUpperCase()
      }))
    };
  }

  // Add missing fetch mock
  if (!global.fetch) {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );
  }
}

// Configure Puppeteer environment
if (global.__BROWSER__) {
  // Initialize proper shutdown handling
  const { startEmergencyTimeout } = setupProperShutdown();
  
  // Set shorter timeouts for Puppeteer operations
  setDefaultOptions({ timeout: timeout / 2 });

  beforeAll(async () => {
    // Start emergency timeout for each test suite
    startEmergencyTimeout();
    
    const requiredVars = ['CPQ_USERNAME', 'CPQ_PASSWORD', 'BASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Configure browser to prevent hanging
    if (global.__BROWSER__) {
      const defaultBrowserContext = global.__BROWSER__.defaultBrowserContext();
      await defaultBrowserContext.overridePermissions(process.env.BASE_URL || 'http://localhost', [
        'notifications',
        'background-sync'
      ]);
      
      // Set default navigation timeout
      if (global.page) {
        global.page.setDefaultNavigationTimeout(timeout / 2);
        global.page.setDefaultTimeout(timeout / 2);
      }
    }
  });

  beforeEach(async () => {
    // Reset emergency timeout for each test
    startEmergencyTimeout();
  });

  afterEach(async () => {
    if (global.__LAST_TEST_FAILED__ && global.page) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      try {
        await global.page.screenshot({
          path: `test-failures/failure-${timestamp}.png`,
          fullPage: true
        });
      } catch (err) {
        console.error('Failed to take failure screenshot:', err);
      }
    }
  });
  
  afterAll(async () => {
    // Clean up any hanging resources
    try {
      if (global.__BROWSER__) {
        const pages = await global.__BROWSER__.pages();
        for (const p of pages) {
          if (p !== global.page) {
            try {
              await p.close();
            } catch (err) {
              // Ignore errors closing pages
            }
          }
        }
      }
    } catch (err) {
      console.error('Error cleaning up after tests:', err);
    }
  });
}

// Add custom matchers
expect.extend({
  toBeValidationError(received, type) {
    const pass = received && received.type === type;
    return {
      message: () => `expected ${received} to be validation error of type ${type}`,
      pass
    };
  }
});

// Export configuration
module.exports = {
  jestConfig: {
    maxConcurrency: 1, // Run tests sequentially
    maxWorkers: 1,
    testTimeout: 120000,
    setupFilesAfterEnv: ['expect-puppeteer']
  }
};
