/**
 * Unit tests for injected.js
 */

describe('Injected Script', () => {
  let originalInjected;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock basic DOM elements
    document.getElementById = jest.fn().mockImplementation(id => {
      if (id === 'useScript') {
        return { checked: true };
      }
      return {
        value: 'Test content',
        click: jest.fn()
      };
    });

    document.getElementsByClassName = jest.fn().mockImplementation(className => {
      return [{ click: jest.fn() }];
    });
    
    // Load the injected script module
    jest.isolateModules(() => {
      originalInjected = require('../../../src/injected');
    });
  });
  
  test('should initialize core functionality', () => {
    expect(originalInjected.INJECTED_DEBUG).toBeDefined();
    expect(typeof originalInjected.jsonPath).toBe('function');
  });
  
  test('should set up required event listeners', () => {
    const expectedEvents = ['load', 'unloadCode', 'loadCode', 'loadTestCode', 'unloadTestCode'];
    
    expectedEvents.forEach(event => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        expect.any(Boolean)
      );
    });
  });

  test('should handle basic code operations', () => {
    // Trigger code event
    window.dispatchEvent(new CustomEvent('loadCode', { 
      detail: 'test code'
    }));

    // Verify event was handled
    expect(document.getElementById).toHaveBeenCalled();
  });

  test('should handle test code operations', () => {
    // Trigger test code event
    window.dispatchEvent(new CustomEvent('loadTestCode', { 
      detail: 'test code'
    }));

    // Verify event was handled
    expect(document.getElementById).toHaveBeenCalled();
  });
});
