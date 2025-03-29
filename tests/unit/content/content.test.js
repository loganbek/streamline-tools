/**
 * Unit tests for content.js
 */

describe('Content Script', () => {
  let originalContent;
  
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    
    // Mock DOM elements
    document.getElementById = jest.fn().mockImplementation(id => {
      if (id === 'variableName') {
        return { value: 'testVariable' };
      }
      return null;
    });
    
    document.querySelector = jest.fn().mockImplementation(selector => {
      if (selector === 'span[id^="ext-gen"]') {
        return { 
          innerHTML: selector.includes('Util') ? 'Util Function' : 'Commerce Function' 
        };
      }
      return null;
    });
    
    // Load the content script module (mock import)
    jest.isolateModules(() => {
      originalContent = require('../../../src/content/content');
    });
  });
  
  test('should initialize debug flag', () => {
    expect(originalContent.CONTENT_DEBUG).toBeDefined();
  });
  
  test('should set up event listeners', () => {
    expect(window.addEventListener).toHaveBeenCalledWith('PassToBackground', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('PassCommentHeader', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('PassCodeToBackground', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('PassTestCodeToBackground', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('unloadCode', expect.any(Function), false);
  });
  
  test('should inject script into the page', () => {
    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(chrome.runtime.getURL).toHaveBeenCalledWith('injected.js');
  });
  
  test('message listener should be added', () => {
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });
  
  // Add more tests for message handling logic
});
