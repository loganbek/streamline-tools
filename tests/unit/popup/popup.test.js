/**
 * Unit tests for popup.js
 */

describe('Popup Script', () => {
  let originalPopup;
  let mockLoadHandler, mockUnloadHandler, mockLoadTestHandler, mockUnloadTestHandler;

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

    // Mock button click handlers
    mockLoadHandler = jest.fn();
    mockUnloadHandler = jest.fn();
    mockLoadTestHandler = jest.fn();
    mockUnloadTestHandler = jest.fn();

    jest.isolateModules(() => {
      jest.mock('../../../src/popup/popup', () => ({
        setupHandlers: jest.fn(() => {
          document.getElementById('loadButton').addEventListener('click', mockLoadHandler);
          document.getElementById('unloadButton').onclick = mockUnloadHandler;
          document.getElementById('loadTestButton').addEventListener('click', mockLoadTestHandler);
          document.getElementById('unloadTestButton').onclick = mockUnloadTestHandler;
        }),
      }));
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

  test('should call the correct handler when loadButton is clicked', () => {
    const loadButton = document.getElementById('loadButton');
    loadButton.addEventListener.mock.calls[0][1](); // Simulate click
    expect(mockLoadHandler).toHaveBeenCalled();
  });

  test('should call the correct handler when unloadButton is clicked', () => {
    const unloadButton = document.getElementById('unloadButton');
    unloadButton.onclick(); // Simulate click
    expect(mockUnloadHandler).toHaveBeenCalled();
  });

  test('should call the correct handler when loadTestButton is clicked', () => {
    const loadTestButton = document.getElementById('loadTestButton');
    loadTestButton.addEventListener.mock.calls[0][1](); // Simulate click
    expect(mockLoadTestHandler).toHaveBeenCalled();
  });

  test('should call the correct handler when unloadTestButton is clicked', () => {
    const unloadTestButton = document.getElementById('unloadTestButton');
    unloadTestButton.onclick(); // Simulate click
    expect(mockUnloadTestHandler).toHaveBeenCalled();
  });

  test('should handle missing DOM elements gracefully', () => {
    document.getElementById = jest.fn().mockReturnValue(null);

    expect(() => {
      originalPopup.setupHandlers();
    }).not.toThrow();
  });

  test('should not call handlers if buttons are not present', () => {
    document.getElementById = jest.fn().mockReturnValue(null);

    originalPopup.setupHandlers();

    expect(mockLoadHandler).not.toHaveBeenCalled();
    expect(mockUnloadHandler).not.toHaveBeenCalled();
    expect(mockLoadTestHandler).not.toHaveBeenCalled();
    expect(mockUnloadTestHandler).not.toHaveBeenCalled();
  });

  test('should log errors if event handlers throw exceptions', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLoadHandler.mockImplementation(() => {
      throw new Error('Test error');
    });

    const loadButton = document.getElementById('loadButton');
    loadButton.addEventListener.mock.calls[0][1](); // Simulate click

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    consoleErrorSpy.mockRestore();
  });
});
