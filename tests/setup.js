const { setDefaultOptions } = require('expect-puppeteer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './tests/.env' });

// Configure longer timeouts for stability
jest.setTimeout(120000); // Increase to 2 minutes
setDefaultOptions({ timeout: 60000 }); // Increase to 1 minute

// Set test environment
process.env.NODE_ENV = 'test';

// Configure Jest environment
const jestConfig = {
  maxConcurrency: 1, // Run tests sequentially
  maxWorkers: 1,
  testTimeout: 120000,
  setupFilesAfterEnv: ['expect-puppeteer']
};

// Add environment validation
beforeAll(async () => {
  // Verify required environment variables
  const requiredVars = ['CPQ_USERNAME', 'CPQ_PASSWORD', 'BASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
});

// Handle test failures
afterEach(async () => {
  if (global.__LAST_TEST_FAILED__) {
    // Take screenshot on failure if we have an active page
    const page = global.page;
    if (page) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({
          path: `test-failures/failure-${timestamp}.png`,
          fullPage: true
        });
      } catch (err) {
        console.error('Failed to take failure screenshot:', err);
      }
    }
  }
});

// Handle cleanup
afterAll(async () => {
  if (global.page) {
    await global.page.close().catch(() => {});
  }
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock Chrome API for unit tests
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `chrome-extension://fake-id/${path}`),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  scripting: {
    executeScript: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
};

// Add custom error matchers
expect.extend({
  toBeValidationError(received, type) {
    const pass = received && received.type === type;
    return {
      message: () =>
        `expected ${received} to be validation error of type ${type}`,
      pass
    };
  }
});

// Export configuration
module.exports = {
  jestConfig
};
