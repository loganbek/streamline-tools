const backgroundScript = require('../../src/background/background');

describe('Header & Footer Functionality', () => {
  // Mock the chrome API
  global.chrome = {
    tabs: {
      query: jest.fn(),
      sendMessage: jest.fn()
    },
    runtime: {
      getURL: jest.fn().mockReturnValue('mocked-url'),
      lastError: null
    }
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up tab query mock
    chrome.tabs.query.mockImplementation((query, callback) => {
      callback([{ id: 1 }]);
    });
    
    // Set up send message mock
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      callback && callback({ status: 'ok' });
    });
  });

  test('handleHTML should send correct parameters for header', () => {
    // Call the handleHTML function with header parameters
    const handleHTML = backgroundScript.__get__('handleHTML');
    handleHTML('Header', 'test header content');
    
    // Verify the correct message was sent
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      {
        greeting: 'loadHeaderHTML',
        headerType: 'header',
        code: 'test header content'
      },
      expect.any(Function)
    );
  });

  test('handleHTML should send correct parameters for footer', () => {
    // Call the handleHTML function with footer parameters
    const handleHTML = backgroundScript.__get__('handleHTML');
    handleHTML('Footer', 'test footer content');
    
    // Verify the correct message was sent
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      {
        greeting: 'loadFooterHTML',
        headerType: 'footer',
        code: 'test footer content'
      },
      expect.any(Function)
    );
  });
});