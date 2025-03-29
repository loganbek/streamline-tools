jest.setTimeout(60000); // Set timeout to 60 seconds

// Mock Chrome API
global.chrome = {
  runtime: {
    getURL: jest.fn(path => `chrome-extension://fake-extension-id/${path}`),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock window.addEventListener
window.addEventListener = jest.fn();

// Mock CustomEvent
global.CustomEvent = class CustomEvent {
  constructor(event, params) {
    this.event = event;
    this.detail = params ? params.detail : undefined;
  }
};

// Mock document functions that might be used
document.createElement = jest.fn(tagName => {
  const element = {
    tagName,
    style: {},
    setAttribute: jest.fn(),
    appendChild: jest.fn()
  };
  return element;
});

// Helper for testing DOM events
window.dispatchEvent = jest.fn();
