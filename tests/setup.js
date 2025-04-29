require('dotenv').config({ path: './tests/.env' });
const puppeteer = require('puppeteer');
const { setDefaultOptions } = require('expect-puppeteer');
const dotenv = require('dotenv');

dotenv.config();

jest.setTimeout(60000);

setDefaultOptions({ timeout: 30000 });

// Set test environment
process.env.NODE_ENV = 'test';

// Load dotenv for test credentials
require('dotenv').config({ path: './tests/.env' });

// Mock Chrome API
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `chrome-extension://fake-extension-id/${path}`),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  scripting: {
    executeScript: jest.fn().mockResolvedValue([{ result: undefined }])
  }
};

// Mock CustomEvent if not provided by jsdom
if (typeof CustomEvent !== 'function') {
  global.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options?.detail;
    }
  };
}

beforeAll(async () => {
  // Ensure required env vars are set
  if (!process.env.CPQ_USERNAME || !process.env.CPQ_PASSWORD) {
    console.error('Missing required environment variables');
    process.exit(1);
  }
  // Add any global setup needed
});

afterAll(async () => {
  // Cleanup after all tests
});
