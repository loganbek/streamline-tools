/**
 * Unit tests for popup.js
 */

describe('Popup v2 Script', () => {
  let mockSendMessage, mockExecuteScript, mockQuery;

  beforeEach(() => {
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
      return {
        addEventListener: jest.fn(),
        onclick: jest.fn(),
        disabled: false,
      };
    });

    jest.clearAllMocks();
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