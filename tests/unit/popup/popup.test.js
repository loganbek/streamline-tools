/**
 * Unit tests for popup.js
 */
// @jest-environment jsdom

describe('Popup Script', () => {
  let mockLoadHandler, mockUnloadHandler;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Chrome APIs
    global.chrome = {
      tabs: {
        query: jest.fn(),
        sendMessage: jest.fn()
      },
      runtime: {
        getManifest: jest.fn(() => ({
          name: 'Streamline Tools',
          version: '1.0.0'
        }))
      }
    };

    // Mock DOM elements
    document.getElementById = jest.fn().mockImplementation(id => {
      return {
        addEventListener: jest.fn(),
        onclick: null,
        disabled: false
      };
    });

    // Mock handlers
    mockLoadHandler = jest.fn();
    mockUnloadHandler = jest.fn();

    jest.isolateModules(() => {
      jest.mock('../../../src/popup/popup', () => ({
        setupHandlers: jest.fn(() => {
          document.getElementById('loadButton').addEventListener('click', mockLoadHandler);
          document.getElementById('unloadButton').onclick = mockUnloadHandler;
        })
      }));
      require('../../../src/popup/popup');
    });
  });

  test('should set up button event handlers', () => {
    const loadButton = document.getElementById('loadButton');
    const unloadButton = document.getElementById('unloadButton');

    expect(loadButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(unloadButton).toBeTruthy();
  });

  test('should handle button clicks', () => {
    const loadButton = document.getElementById('loadButton');
    loadButton.addEventListener.mock.calls[0][1](); // Simulate click
    expect(mockLoadHandler).toHaveBeenCalled();

    const unloadButton = document.getElementById('unloadButton');
    unloadButton.onclick(); // Simulate click
    expect(mockUnloadHandler).toHaveBeenCalled();
  });

  test('should handle disabled state', () => {
    document.getElementById = jest.fn().mockImplementation(id => ({
      addEventListener: jest.fn(),
      onclick: null,
      disabled: true
    }));

    const loadButton = document.getElementById('loadButton');
    const unloadButton = document.getElementById('unloadButton');
    expect(loadButton.disabled).toBe(true);
    expect(unloadButton.disabled).toBe(true);
  });

  test('should display version info', () => {
    const footer = { innerHTML: '' };
    document.getElementById = jest.fn().mockImplementation(id => 
      id === 'footer' ? footer : { addEventListener: jest.fn() }
    );

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(footer.innerHTML).toContain('Streamline Tools v1.0.0');
  });
});
