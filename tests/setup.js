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
  setDefaultOptions({ timeout: timeout / 2 });

  beforeAll(async () => {
    const requiredVars = ['CPQ_USERNAME', 'CPQ_PASSWORD', 'BASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
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
