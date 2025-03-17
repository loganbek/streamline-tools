/**
 * Unit tests for injected.js
 */

describe('Injected Script', () => {
  let originalInjected;
  
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock frame_bm_script
    global.frame_bm_script = {
      editArea: {
        textarea: {
          value: 'Initial code'
        },
        textareaFocused: false
      }
    };
    
    // Mock document methods
    document.getElementsByClassName = jest.fn().mockImplementation(className => {
      if (className === 'bmx-spellcheck') {
        return [{ click: jest.fn() }];
      }
      if (className === 'bmx-debug') {
        return [{}, { click: jest.fn() }];
      }
      return [];
    });
    
    document.getElementById = jest.fn().mockImplementation(id => {
      if (id === 'ext-comp-1040') {
        return { value: 'Test util script' };
      }
      if (id === 'ext-comp-1080') {
        return { value: 'Test commerce script' };
      }
      if (id === 'ext-comp-1095') {
        return { value: 'Test commerce script 2' };
      }
      if (id === 'useScript') {
        return { checked: true };
      }
      return null;
    });
    
    // Load the injected script module (mock import)
    jest.isolateModules(() => {
      originalInjected = require('../../../src/injected');
    });
  });
  
  test('should initialize debug flag', () => {
    expect(originalInjected.INJECTED_DEBUG).toBeDefined();
  });
  
  test('should implement jsonPath function', () => {
    expect(typeof originalInjected.jsonPath).toBe('function');
  });
  
  test('should set up event listeners', () => {
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unloadCode', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('loadCode', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('loadTestCode', expect.any(Function), false);
    expect(window.addEventListener).toHaveBeenCalledWith('unloadTestCode', expect.any(Function), false);
  });
  
  // Add more specific tests for event handlers
});
