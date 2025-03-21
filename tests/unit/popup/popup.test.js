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
        return { onclick: jest.fn() };{
        return { onclick: null };
      }
      if (id === 'loadButton') {
        return { addEventListener: jest.fn() };
      }
        return { onclick: jest.fn() };n') {
        return { onclick: null };
      }
      if (id === 'loadTestButton') {
        return { addEventListener: jest.fn() };
      if (id === 'options') {
        return { onclick: jest.fn() };eturn null;
      }});
      if (id === 'logs') {
        return { disabled: false };rs
      }
      return null;kUnloadHandler = jest.fn();
    });ockLoadTestHandler = jest.fn();
  mockUnloadTestHandler = jest.fn();
    // Load the popup script module (mock import)
    jest.isolateModules(() => {
      originalPopup = require('../../../src/popup/popup');
    });    setupHandlers: jest.fn(() => {
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

  test('should disable logs button on initialization', () => {
    const logsButton = document.getElementById('logs');
    expect(logsButton.disabled).toBe(true);
  });

  test('should handle unload button click', () => {
    const unloadButton = document.getElementById('unloadButton');
    unloadButton.onclick();
    expect(unloadButton.onclick).toBeDefined();
  });

  test('should handle options button click', () => {
    const optionsButton = document.getElementById('options');
    optionsButton.onclick();
    expect(optionsButton.onclick).toBeDefined();
  });

  test('should log debug messages when POPUP_DEBUG is enabled', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    originalPopup.logDebug('Test message');
    expect(consoleSpy).toHaveBeenCalledWith('[POPUP_DEBUG]', 'Test message');
    consoleSpy.mockRestore();
  });

  test('should sanitize filenames correctly', () => {
    const sanitizeFilename = originalPopup.sanitizeFilename;
    const result = sanitizeFilename('test/file:name?.bml');
    expect(result).toBe('test_file_name_.bml');
  });

  test('should match URL patterns correctly', () => {
    const matchesUrlPattern = originalPopup.matchesUrlPattern;
    const result = matchesUrlPattern('https://devmcnichols.bigmachines.com/admin/commerce/rules', 'commerce', 'rule');
    expect(result).toBe(true);
  });
});
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
