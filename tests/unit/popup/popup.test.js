/**
 * Unit tests for popup.js
 */

describe('Popup Script', () => {
  let originalPopup;
  
  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock DOM elements
    document.getElementById = jest.fn().mockImplementation(id => {
      if (id === 'unloadButton') {
        return { onclick: null };
      }
      if (id === 'loadButton') {
        return { addEventListener: jest.fn() };
      }
      if (id === 'unloadTestButton') {
        return { onclick: null };
      }
      if (id === 'loadTestButton') {
        return { addEventListener: jest.fn() };
      }
      return null;
    });
    
    // Load the popup script module (mock import)
    jest.isolateModules(() => {
      originalPopup = require('../../../src/popup/popup');
    });
  });
  
  test('should set up button event handlers', () => {
    const loadButton = document.getElementById('loadButton');
    const loadTestButton = document.getElementById('loadTestButton');
    
    expect(loadButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(loadTestButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    
    // The unload buttons use onclick instead of addEventListener
    expect(document.getElementById).toHaveBeenCalledWith('unloadButton');
    expect(document.getElementById).toHaveBeenCalledWith('unloadTestButton');
  });
  
  // Add more tests for button click handlers
});
