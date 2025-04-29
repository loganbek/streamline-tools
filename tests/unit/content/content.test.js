/**
 * Unit tests for content.js
 * @jest-environment jsdom
 */

jest.mock('../../../src/content/domOperations');

describe('Content Script', () => {
  let originalContent;
  let domOps;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    domOps = require('../../../src/content/domOperations').default;

    // Basic mock setup
    global.chrome = {
      runtime: {
        getURL: jest.fn(path => `chrome-extension://fake-id/${path}`),
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn()
      }
    };
    
    jest.isolateModules(() => {
      originalContent = require('../../../src/content/content');
    });
  });
  
  test('should initialize and set up event listeners', () => {
    expect(originalContent.CONTENT_DEBUG).toBeDefined();
    expect(window.addEventListener).toHaveBeenCalled();
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  test('should handle load operations', async () => {
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();

    await messageListener({ greeting: 'load', code: 'test code' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ 
      success: expect.any(Boolean)
    }));
  });

  test('should handle unload operations', async () => {
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();

    await messageListener({ greeting: 'unload' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({
      success: expect.any(Boolean)
    }));
  });

  test('should handle errors gracefully', async () => {
    const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
    const sendResponse = jest.fn();
    
    await messageListener({ greeting: 'invalid' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ 
      error: expect.any(String)
    }));
  });
});
