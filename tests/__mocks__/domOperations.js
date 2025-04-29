const mockDomOperations = {
  createElement: jest.fn(tag => {
    // Create a basic element using JSDOM
    const element = document.createElement(tag);
    
    // Add any additional properties we need for testing
    element.value = '';
    element.style = {};
    
    return element;
  }),

  appendChild: jest.fn((parent, child) => {
    if (parent && typeof parent.appendChild === 'function') {
      return parent.appendChild(child);
    }
    return child;
  }),

  getHead: jest.fn(() => document.createElement('head')),

  querySelector: jest.fn(selector => {
    const mockElements = {
      '#test-code-element': { value: 'test code content' },
      '#test-file-element': { value: 'test.js' },
      'textarea[name="header"]': { value: 'header content' },
      '#header-element': { value: 'header content' },
      '#footer-element': { value: 'footer content' }
    };
    const element = document.createElement('div');
    const mockData = mockElements[selector];
    if (mockData) {
      Object.assign(element, mockData);
    }
    return mockData ? element : null;
  }),

  addEventListener: jest.fn((target, event, handler, options) => {
    if (target && typeof target.addEventListener === 'function') {
      return target.addEventListener(event, handler, options);
    }
  }),
  
  dispatchEvent: jest.fn((target, event) => {
    if (target && typeof target.dispatchEvent === 'function') {
      return target.dispatchEvent(event);
    }
    return true;
  }),

  removeEventListener: jest.fn(),
  
  getElementsByTagName: jest.fn(() => []),
  
  getElementsByClassName: jest.fn(() => [])
};

export default mockDomOperations;