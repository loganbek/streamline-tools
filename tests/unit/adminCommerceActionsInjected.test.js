/**
 * Unit tests for adminCommerceActionsInjected.js
 */

describe('Admin Commerce Actions Injected Script', () => {
  let originalScript;
  
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock document methods
    document.getElementsByTagName = jest.fn().mockImplementation(tag => {
      if (tag === 'iframe') {
        return [{
          contentDocument: {
            querySelector: jest.fn().mockImplementation(selector => {
              if (selector === '#textarea') {
                return { value: 'Test commerce code' };
              }
              return null;
            })
          }
        }];
      }
      return [];
    });
    
    // Load the script module (mock import)
    jest.isolateModules(() => {
      originalScript = require('../../src/admin/adminCommerceActionsInjected');
    });
  });
  
  test('should initialize debug flag', () => {
    expect(originalScript.ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG).toBe(true);
  });
  
  test('should set up event listeners', () => {
    expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unloadCode', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('loadCode', expect.any(Function));
  });
  
  test('unloadCode event should dispatch PassCodeToBackground', () => {
    // Get the unloadCode event listener
    const unloadListener = window.addEventListener.mock.calls.find(
      call => call[0] === 'unloadCode'
    )[1];
    
    // Create a mock event
    const mockEvent = { detail: 'some code' };
    
    // Call the listener
    unloadListener(mockEvent);
    
    // Verify the dispatch
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ 
        event: 'PassCodeToBackground',
        detail: expect.any(String)
      })
    );
  });
});
