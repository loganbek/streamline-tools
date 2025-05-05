const mockElement = {
  appendChild: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  style: {},
  value: '',
};

// Mock implementation for DOM operations
module.exports = {
  createElement: jest.fn(tag => {
    const element = Object.create(mockElement);
    element.tagName = tag.toUpperCase();
    element.contentDocument = {
      querySelector: jest.fn(selector => {
        if (selector === '#textarea') {
          const textArea = Object.create(mockElement);
          textArea.id = 'textarea';
          textArea.value = 'Test code';
          return textArea;
        }
        return null;
      })
    };
    return element;
  }),

  appendChild: jest.fn((parent, child) => {
    if (parent && typeof parent.appendChild === 'function') {
      return parent.appendChild(child);
    }
    return child;
  }),

  getHead: jest.fn(() => {
    const head = Object.create(mockElement);
    head.tagName = 'HEAD';
    return head;
  }),

  querySelector: jest.fn(selector => {
    const mockElements = {
      '#test-code-element': { value: 'test code content' },
      '#test-file-element': { value: 'test.js' },
      'textarea[name="header"]': { value: 'header content' },
      '#header-element': { value: 'header content' },
      '#footer-element': { value: 'footer content' },
      '#textarea': { value: 'Test code' }
    };

    const element = Object.create(mockElement);
    const mockData = mockElements[selector];
    if (mockData) {
      Object.assign(element, mockData);
    }
    return mockData ? element : null;
  }),

  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  removeEventListener: jest.fn(),

  getElementsByTagName: jest.fn(tag => {
    if (tag === 'iframe') {
      const iframe = Object.create(mockElement);
      iframe.tagName = 'IFRAME';
      iframe.contentDocument = {
        querySelector: jest.fn(selector => {
          if (selector === '#textarea') {
            const textArea = Object.create(mockElement);
            textArea.id = 'textarea';
            textArea.value = 'Test code';
            textArea.tagName = 'TEXTAREA';
            return textArea;
          }
          return null;
        })
      };
      return [iframe];
    }
    return [];
  }),

  getElementsByClassName: jest.fn(className => {
    if (className === 'bmx-spellcheck' || className === 'bmx-debug') {
      const button = Object.create(mockElement);
      button.tagName = 'BUTTON';
      button.click = jest.fn();
      return [button];
    }
    return [];
  })
};