/**
 * Unit tests for popup.js
 */

// Import necessary modules and functions



describe('Popup Script', () => {
  let originalPopup;
  let mockLoadHandler, mockUnloadHandler, mockLoadTestHandler, mockUnloadTestHandler;
  let mockSendMessage, mockExecuteScript, mockQuery;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Mock Chrome APIs
    global.chrome = {
      tabs: {
        query: jest.fn(),
        sendMessage: jest.fn(),
      },
      scripting: {
        executeScript: jest.fn(),
      },
      runtime: {
        getManifest: jest.fn(() => ({
          name: 'Streamline Tools',
          version: '1.0.0',
        })),
      },
      downloads: {
        setShelfEnabled: jest.fn(),
        onDeterminingFilename: {
          addListener: jest.fn(),
        },
      },
    };

    mockSendMessage = chrome.tabs.sendMessage;
    mockExecuteScript = chrome.scripting.executeScript;
    mockQuery = chrome.tabs.query;

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
      return {
        addEventListener: jest.fn(),
        onclick: jest.fn(),
        disabled: false,
      };
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

  test('should initialize extension and log debug messages', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../../../src/popup/popup');
    expect(logSpy).toHaveBeenCalledWith('[POPUP_DEBUG]', 'Initializing extension...');
    logSpy.mockRestore();
  });

  test('should query active tab and log URL', () => {
    mockQuery.mockImplementation((queryInfo, callback) => {
      callback([{ url: 'https://devmcnichols.bigmachines.com/admin/configuration/rules' }]);
    });

    require('../../../src/popup/popup');
    expect(mockQuery).toHaveBeenCalledWith({ active: true, currentWindow: true }, expect.any(Function));
  });

  test('should handle unload button click', () => {
    const unloadButton = document.getElementById('unload');
    unloadButton.onclick();

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      { greeting: 'unload' },
      expect.any(Function)
    );
  });

  test('should handle load button click', async () => {
    const loadButton = document.getElementById('load');
    const fileHandle = {
      getFile: jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('file contents'),
      }),
    };

    window.showOpenFilePicker = jest.fn().mockResolvedValue([fileHandle]);

    await loadButton.addEventListener.mock.calls[0][1]();
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      { greeting: 'load', code: 'file contents' },
      expect.any(Function)
    );
  });

  test('should set footer information on DOMContentLoaded', () => {
    const footer = { innerHTML: '' };
    document.getElementById = jest.fn().mockImplementation(id => (id === 'footer' ? footer : {}));

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(footer.innerHTML).toContain('Streamline Tools v1.0.0');
  });
});
