/**
 * Unit tests for content.js
 * @jest-environment jsdom
 */

// Mock must be at top level
jest.mock('../../../src/content/domOperations');

const mockRules = require('../../__mocks__/rulesList.json');

describe('Content Script', () => {
  let originalContent;
  let originalFetch;
  
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';

    // Mock window event listeners and location
    window.addEventListener = jest.fn((event, handler) => {
      if (event === 'load') {
        handler();
      }
    });
    window.removeEventListener = jest.fn();
    window.location = new URL('https://test.com');

    // Mock fetch API
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRules)
      })
    );

    // Basic mock setup
    global.chrome = {
      runtime: {
        getURL: jest.fn(path => `chrome-extension://${global.__EXTENSION_ID__}/${path}`),
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn()
      }
    };

    // Load the module under test
    jest.isolateModules(() => {
      originalContent = require('../../../src/content/content');
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });
  
  test('should initialize and set up event listeners', async () => {
    expect(originalContent.CONTENT_DEBUG).toBeDefined();
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(window.addEventListener).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(`chrome-extension://${global.__EXTENSION_ID__}/rulesList.json`);
  });

  test('should handle load operations', async () => {
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();

    await messageListener({ 
      greeting: 'load', 
      code: 'test code',
      rule: mockRules[0]
    }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ 
      status: 'Code loaded successfully'
    }));
  });

  test('should handle unload operations', async () => {
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();

    await messageListener({ 
      greeting: 'unload',
      rule: mockRules[0]
    }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({
      code: expect.any(String),
      filename: expect.any(String),
      rule: expect.any(Object)
    }));
  });

  test('should handle errors gracefully', async () => {
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();
    
    await messageListener({ greeting: 'invalid' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ 
      error: expect.any(String)
    }));
  });
});
