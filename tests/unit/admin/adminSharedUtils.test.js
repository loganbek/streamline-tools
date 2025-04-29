/**
 * Unit tests for adminSharedUtils.js
 * @jest-environment jsdom
 */

describe('Admin Shared Utils', () => {
  let utils;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Mock iframe structure
    document.getElementsByTagName = jest.fn().mockImplementation(tag => {
      if (tag === 'iframe') {
        return [{
          contentDocument: {
            querySelector: jest.fn().mockImplementation(selector => {
              if (selector === '#textarea') {
                return { value: 'Test code' };
              }
              return null;
            })
          }
        }];
      }
      return [];
    });

    // Load the module
    jest.isolateModules(() => {
      utils = require('../../../src/admin/adminSharedUtils');
    });
  });

  describe('injectCode', () => {
    test('should inject code into textarea', () => {
      const result = utils.injectCode('New code');
      expect(result).toBe(true);
      expect(document.getElementsByTagName('iframe')[0].contentDocument.querySelector('#textarea').value)
        .toBe('New code');
    });

    test('should return false if iframe not found', () => {
      document.getElementsByTagName.mockReturnValue([]);
      const result = utils.injectCode('New code');
      expect(result).toBe(false);
    });

    test('should return false if textarea not found', () => {
      document.getElementsByTagName.mockReturnValue([{
        contentDocument: {
          querySelector: () => null
        }
      }]);
      const result = utils.injectCode('New code');
      expect(result).toBe(false);
    });
  });

  describe('extractCode', () => {
    test('should extract code from textarea', () => {
      const code = utils.extractCode();
      expect(code).toBe('Test code');
    });

    test('should return newline if iframe not found', () => {
      document.getElementsByTagName.mockReturnValue([]);
      const code = utils.extractCode();
      expect(code).toBe('\n');
    });

    test('should return newline if textarea not found', () => {
      document.getElementsByTagName.mockReturnValue([{
        contentDocument: {
          querySelector: () => null
        }
      }]);
      const code = utils.extractCode();
      expect(code).toBe('\n');
    });
  });

  describe('dispatchCodeEvent', () => {
    test('should dispatch event with code', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      const event = utils.dispatchCodeEvent('testEvent', 'Test code');
      expect(dispatchSpy).toHaveBeenCalledWith(event);
      expect(event.detail).toBe('Test code');
    });

    test('should handle dispatch errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent')
        .mockImplementation(() => { throw new Error('Test error'); });

      utils.dispatchCodeEvent('testEvent', 'Test code');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[DISPATCH_ERROR]'));

      consoleSpy.mockRestore();
      dispatchSpy.mockRestore();
    });
  });

  describe('setupCommonEventListeners', () => {
    let listeners = {};

    beforeEach(() => {
      listeners = {};
      window.addEventListener = jest.fn((event, handler) => {
        listeners[event] = handler;
      });
    });

    test('should set up all event listeners', () => {
      utils.setupCommonEventListeners({ debug: true });
      expect(listeners).toHaveProperty('load');
      expect(listeners).toHaveProperty('unloadCode');
      expect(listeners).toHaveProperty('loadCode');
      expect(listeners).toHaveProperty('unloadTestCode');
      expect(listeners).toHaveProperty('loadTestCode');
    });

    test('should handle load event with custom handler', () => {
      const onLoad = jest.fn();
      utils.setupCommonEventListeners({ debug: true, onLoad });
      listeners.load();
      expect(onLoad).toHaveBeenCalled();
    });

    test('should handle loadCode with custom afterLoad handler', () => {
      const onAfterLoad = jest.fn();
      utils.setupCommonEventListeners({ debug: true, onAfterLoad });
      listeners.loadCode({ detail: 'Test code' });
      expect(onAfterLoad).toHaveBeenCalledWith('Test code');
    });

    test('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onLoad = () => { throw new Error('Test error'); };
      
      utils.setupCommonEventListeners({ debug: true, onLoad });
      listeners.load();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[LOAD_ERROR]'));
      consoleSpy.mockRestore();
    });
  });
});