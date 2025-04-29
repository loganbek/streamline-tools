/**
 * Unit tests for popup.js
 * @jest-environment jsdom
 */

describe('Popup Script', () => {
  let originalFetch;
  let mockSendMessage, mockExecuteScript, mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch API
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{
          URL: "test.com",
          AppArea: "admin",
          RuleName: "Test Rule",
          fileType: "bml"
        }])
      })
    );

    // Set up DOM elements
    document.body.innerHTML = `
      <button id="load"></button>
      <button id="unload"></button>
      <button id="loadBML"></button>
      <button id="unloadBML"></button>
      <button id="loadTestBML"></button>
      <button id="unloadTestBML"></button>
      <div id="footer"></div>
    `;

    // Mock window.showOpenFilePicker
    global.window.showOpenFilePicker = jest.fn().mockResolvedValue([{
      getFile: () => Promise.resolve({
        text: () => Promise.resolve('test file content'),
        name: 'test.bml'
      })
    }]);

    // Mock Chrome APIs
    global.chrome = {
      tabs: {
        query: jest.fn().mockImplementation((queryInfo, callback) => {
          const tabs = [{ id: 1, url: 'https://test.com' }];
          return callback ? callback(tabs) : Promise.resolve(tabs);
        }),
        sendMessage: jest.fn().mockImplementation((tabId, message, callback) => {
          if (callback) {
            callback({ status: 'ok', code: 'test code', filename: 'test' });
          }
          return Promise.resolve({ status: 'ok' });
        })
      },
      runtime: {
        getManifest: jest.fn(() => ({
          name: 'Streamline Tools',
          version: '1.0.0'
        })),
        getURL: jest.fn(path => `chrome-extension://${global.__EXTENSION_ID__}/${path}`),
        sendMessage: jest.fn()
      },
      scripting: {
        executeScript: jest.fn().mockResolvedValue([{ result: true }])
      },
      downloads: {
        setShelfEnabled: jest.fn(),
        onDeterminingFilename: {
          addListener: jest.fn()
        }
      }
    };

    // Store mock references
    mockSendMessage = chrome.tabs.sendMessage;
    mockExecuteScript = chrome.scripting.executeScript;
    mockQuery = chrome.tabs.query;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('should initialize extension and log debug messages', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    require('../../../src/popup/popup');
    expect(logSpy).toHaveBeenCalledWith('[POPUP_DEBUG]', 'Initializing extension...');
    logSpy.mockRestore();
  });

  test('should initialize and set up event listeners', async () => {
    require('../../../src/popup/popup');
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init

    // Verify rules were fetched
    expect(global.fetch).toHaveBeenCalledWith(
      `chrome-extension://${global.__EXTENSION_ID__}/rulesList.json`
    );

    // Verify Chrome APIs were called
    expect(mockQuery).toHaveBeenCalledWith({
      active: true,
      currentWindow: true
    }, expect.any(Function));
  });

  test('should handle BML operations', async () => {
    require('../../../src/popup/popup');
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init

    const unloadBtn = document.getElementById('unloadBML');
    const loadBtn = document.getElementById('loadBML');

    // Test unload
    await unloadBtn.click();
    expect(mockQuery).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ greeting: 'unload' }),
      expect.any(Function)
    );

    // Test load
    await loadBtn.click();
    expect(window.showOpenFilePicker).toHaveBeenCalled();
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ 
        greeting: 'load',
        code: expect.any(String)
      }),
      expect.any(Function)
    );
  });

  test('should handle basic load/unload operations', async () => {
    require('../../../src/popup/popup');
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init

    const unloadButton = document.getElementById('unload');
    const loadButton = document.getElementById('load');

    // Test unload
    await unloadButton.click();
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      { greeting: 'unload' },
      expect.any(Function)
    );

    // Test load
    const fileHandle = {
      getFile: jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('file contents'),
      }),
    };
    window.showOpenFilePicker = jest.fn().mockResolvedValue([fileHandle]);
    await loadButton.click();
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ 
        greeting: 'load', 
        code: expect.any(String) 
      }),
      expect.any(Function)
    );
  });

  test('should display version info', async () => {
    require('../../../src/popup/popup');
    
    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    const footer = document.getElementById('footer');
    expect(footer.innerHTML).toContain('Streamline Tools v1.0.0');
  });
});
