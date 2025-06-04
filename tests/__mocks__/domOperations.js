const windowEventHandlers = {};

const mockDomOperations = {
  createElement: jest.fn(tag => {
    const element = document.createElement(tag);
    element.value = '';
    element.style = {};
    element.click = jest.fn().mockImplementation(async () => {
      if (element.onclick) {
        await element.onclick();
      }
    });
    element.contentDocument = {
      querySelector: jest.fn(selector => {
        const textArea = document.createElement('textarea');
        textArea.id = 'textarea';
        textArea.value = 'Test code';
        return textArea;
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

  getHead: jest.fn(() => document.createElement('head')),

  querySelector: jest.fn(selector => {
    const mockElements = {
      '#test-code-element': { value: 'test code content' },
      '#test-file-element': { value: 'test.js' },
      'textarea[name="header"]': { value: 'header content' },
      '#header-element': { value: 'header content' },
      '#footer-element': { value: 'footer content' },
      '#textarea': { value: 'Test code' },
      '#loadBML': { id: 'loadBML', onclick: jest.fn() },
      '#unloadBML': { id: 'unloadBML', onclick: jest.fn() },
      '#loadTestBML': { id: 'loadTestBML', onclick: jest.fn() },
      '#unloadTestBML': { id: 'unloadTestBML', onclick: jest.fn() },
      '#load': { id: 'load', onclick: jest.fn() },
      '#unload': { id: 'unload', onclick: jest.fn() },
      'iframe': { contentDocument: { querySelector: () => ({ value: 'Test code' }) } }
    };
    const element = document.createElement('div');
    Object.assign(element, mockElements[selector] || {});
    if (mockElements[selector]) {
      element.click = jest.fn().mockImplementation(async () => {
        if (element.onclick) {
          await element.onclick();
        }
      });
      element.addEventListener = jest.fn((event, handler) => {
        if (event === 'click') {
          element.onclick = handler;
        }
      });
    }
    return mockElements[selector] ? element : null;
  }),

  addEventListener: jest.fn((target, event, handler, options) => {
    if (target === window) {
      // Store window event handlers
      windowEventHandlers[event] = windowEventHandlers[event] || [];
      windowEventHandlers[event].push(handler);
      
      // Simulate immediate events if needed
      if (event === 'load' || event === 'DOMContentLoaded') {
        setTimeout(() => {
          handler(new Event(event));
        }, 0);
      }
    } else if (target && typeof target.addEventListener === 'function') {
      target.addEventListener(event, handler, options);
    }
  }),

  dispatchEvent: jest.fn((target, event) => {
    if (target === window) {
      const handlers = windowEventHandlers[event.type] || [];
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (err) {
          console.error('Error in event handler:', err);
        }
      });
      return true;
    }
    if (target && typeof target.dispatchEvent === 'function') {
      return target.dispatchEvent(event);
    }
    return true;
  }),

  removeEventListener: jest.fn((target, event, handler) => {
    if (target === window && windowEventHandlers[event]) {
      const idx = windowEventHandlers[event].indexOf(handler);
      if (idx !== -1) {
        windowEventHandlers[event].splice(idx, 1);
      }
    } else if (target && typeof target.removeEventListener === 'function') {
      target.removeEventListener(event, handler);
    }
  }),

  getElementsByTagName: jest.fn((tag) => {
    if (tag === 'iframe') {
      const iframe = document.createElement('iframe');
      iframe.contentDocument = {
        querySelector: jest.fn(selector => {
          if (selector === '#textarea') {
            const textArea = document.createElement('textarea');
            textArea.value = 'Test code';
            return textArea;
          }
          return null;
        })
      };
      return [iframe];
    }
    return [];
  }),

  getElementsByClassName: jest.fn((className) => {
    if (className === 'bmx-spellcheck' || className === 'bmx-debug') {
      const button = document.createElement('button');
      button.click = jest.fn();
      return [button];
    }
    return [];
  })
};

module.exports = mockDomOperations;