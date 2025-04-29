/**
 * Unit tests for content.js
 * @jest-environment jsdom
 */

// Mock the domOperations module
jest.mock('../../../src/content/domOperations');

describe('Content Script', () => {
  let originalContent;
  let domOps;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set test environment
    process.env.NODE_ENV = 'test';

    // Import the mocked domOperations module
    domOps = require('../../../src/content/domOperations').default;

    // Mock fetchRulesList response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            RuleName: "Test Rule",
            URL: "test.com",
            fileNameSelector: "#test-file-element",
            codeSelector: "#test-code-element",
            hasTest: "TRUE"
          },
          {
            RuleName: "Header & Footer",
            URL: "header-footer.com",
            codeSelector1: "#header-element",
            codeSelector2: "#footer-element",
            hasTest: "FALSE"
          }
        ])
      })
    );

    // Mock chrome.runtime
    global.chrome = {
      runtime: {
        getURL: jest.fn(path => `chrome-extension://fake-extension-id/${path}`),
        onMessage: {
          addListener: jest.fn()
        }
      }
    };
    
    // Load the content script module
    jest.isolateModules(() => {
      originalContent = require('../../../src/content/content');
    });
  });
  
  test('should initialize debug flag', () => {
    expect(originalContent.CONTENT_DEBUG).toBeDefined();
  });
  
  test('should set up event listeners', () => {
    const expectedEvents = [
      'PassToBackground',
      'PassCommentHeader',
      'PassCodeToBackground',
      'PassTestCodeToBackground',
      'unloadCode'
    ];

    expectedEvents.forEach(event => {
      expect(domOps.addEventListener).toHaveBeenCalledWith(
        window,
        event, 
        expect.any(Function),
        false
      );
    });
  });
  
  test('should not inject script in test environment', () => {
    expect(domOps.createElement).not.toHaveBeenCalled();
    expect(domOps.appendChild).not.toHaveBeenCalled();
  });
  
  test('should register message listener', () => {
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });
  
  describe('Message Handler', () => {
    let messageListener;
    let sendResponse;

    beforeEach(() => {
      messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      sendResponse = jest.fn();
      global.location = { href: 'test.com' };
    });

    test('should handle unload request with matching rule', async () => {
      const request = { greeting: 'unload' };
      await messageListener(request, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({
        filename: 'test.js',
        code: expect.stringContaining('test code content'),
        rule: expect.objectContaining({ RuleName: 'Test Rule' })
      });
    });

    test('should handle load request with matching rule', async () => {
      const request = { greeting: 'load', code: 'new code' };
      await messageListener(request, {}, sendResponse);
      
      expect(domOps.querySelector).toHaveBeenCalledWith('#test-code-element');
      expect(sendResponse).toHaveBeenCalledWith({ status: 'Code loaded successfully' });
    });

    test('should handle rule-specific request', async () => {
      const request = { 
        greeting: 'unload',
        rule: { RuleName: 'Header & Footer' },
        headerType: 'header'
      };
      await messageListener(request, {}, sendResponse);
      
      expect(domOps.querySelector).toHaveBeenCalledWith('#header-element');
    });

    test('should handle test operations based on rule config', async () => {
      const request = { greeting: 'unloadTest' };
      await messageListener(request, {}, sendResponse);
      
      expect(domOps.dispatchEvent).toHaveBeenCalledWith(
        window,
        expect.objectContaining({ 
          type: 'unloadTestCode'
        })
      );
    });

    test('should handle HTML/CSS/XML special cases', async () => {
      const request = { greeting: 'unloadHeaderHTML' };
      await messageListener(request, {}, sendResponse);
      
      expect(domOps.querySelector).toHaveBeenCalledWith('textarea[name="header"]');
      expect(sendResponse).toHaveBeenCalledWith({ code: 'header content' });
    });

    test('should handle errors gracefully', async () => {
      domOps.querySelector.mockImplementation(() => { throw new Error('Test error'); });
      const request = { greeting: 'load' };
      await messageListener(request, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    test('should handle missing rules gracefully', async () => {
      global.location.href = 'unknown.com';
      const request = { greeting: 'load' };
      await messageListener(request, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No matching rule found for this page' })
      );
    });

    test('should handle missing code selector gracefully', async () => {
      const request = { greeting: 'load' };
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            RuleName: "Test Rule",
            URL: "test.com",
            fileNameSelector: "#test-file-element",
            hasTest: "TRUE"
          }])
        })
      );
      
      await messageListener(request, {}, sendResponse);
      expect(sendResponse).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No code selector found for this rule' })
      );
    });
  });
});
