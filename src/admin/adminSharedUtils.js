/**
 * Shared utilities for admin injected scripts
 * @module adminSharedUtils
 */

/**
 * Options for setting up common event listeners
 * @typedef {Object} ListenerOptions
 * @property {boolean} [debug=false] - Enable debug logging
 * @property {string} [debugPrefix='DEBUG'] - Prefix for debug logs
 * @property {number} [iframeIndex=0] - Index of iframe containing textarea
 * @property {(code: string) => void} [onAfterLoad] - Callback after code is loaded
 * @property {() => void} [onLoad] - Callback when window loads
 */

/**
 * Injects code into the textarea within an iframe
 * @param {string} code - Code to inject
 * @param {number} [iframeIndex=0] - Index of iframe containing textarea
 * @returns {boolean} Success status
 * @throws {Error} If iframe or textarea not found
 */
export function injectCode(code, iframeIndex = 0) {
  try {
    const iframe = document.getElementsByTagName('iframe')[iframeIndex];
    if (!iframe?.contentDocument) {
      throw new Error(`Iframe not found at index ${iframeIndex}`);
    }

    const textarea = iframe.contentDocument.querySelector('#textarea');
    if (!textarea) {
      throw new Error('Textarea not found in iframe');
    }

    textarea.value = code;
    return true;
  } catch (error) {
    console.error(`[INJECT_ERROR] ${error.message}`);
    return false;
  }
}

/**
 * Extracts code from the textarea within an iframe
 * @param {number} [iframeIndex=0] - Index of iframe containing textarea
 * @returns {string} Extracted code or newline
 */
export function extractCode(iframeIndex = 0) {
  try {
    const iframe = document.getElementsByTagName('iframe')[iframeIndex];
    if (!iframe?.contentDocument) {
      throw new Error(`Iframe not found at index ${iframeIndex}`);
    }

    const textarea = iframe.contentDocument.querySelector('#textarea');
    if (!textarea) {
      throw new Error('Textarea not found in iframe');
    }

    return textarea.value || '\n';
  } catch (error) {
    console.error(`[EXTRACT_ERROR] ${error.message}`);
    return '\n';
  }
}

/**
 * Dispatches a custom event with code payload
 * @param {string} eventName - Name of event to dispatch
 * @param {string} code - Code payload
 * @returns {CustomEvent} The dispatched event
 */
export function dispatchCodeEvent(eventName, code) {
  const event = new CustomEvent(eventName, { detail: code });
  try {
    window.dispatchEvent(event);
  } catch (error) {
    console.error(`[DISPATCH_ERROR] Failed to dispatch ${eventName}: ${error.message}`);
  }
  return event;
}

/**
 * Sets up common event listeners for code operations
 * @param {ListenerOptions} options - Configuration options
 */
export function setupCommonEventListeners(options = { debug: false }) {
  const logDebug = (...args) => {
    if (options.debug) {
      console.log(`[${options.debugPrefix || 'DEBUG'}]`, ...args);
    }
  };

  // Log startup configuration
  logDebug('Initializing with options:', options);

  window.addEventListener('load', function () {
    try {
      if (typeof options.onLoad === 'function') {
        options.onLoad();
      }
      logDebug("Load event handled");
    } catch (error) {
      console.error(`[LOAD_ERROR] ${error.message}`);
    }
  });

  window.addEventListener('unloadCode', function (evt) {
    try {
      const code = extractCode(options.iframeIndex);
      dispatchCodeEvent('PassCodeToBackground', code);
      logDebug("Unload code event handled");
    } catch (error) {
      console.error(`[UNLOAD_ERROR] ${error.message}`);
    }
  });

  window.addEventListener('loadCode', function (evt) {
    try {
      const code = evt.detail;
      if (injectCode(code, options.iframeIndex)) {
        if (options.onAfterLoad) {
          options.onAfterLoad(code);
        }
        logDebug("Load code event handled");
      }
    } catch (error) {
      console.error(`[LOAD_ERROR] ${error.message}`);
    }
  }, false);

  // Test code support
  window.addEventListener('unloadTestCode', function (evt) {
    try {
      const testCode = extractCode(options.iframeIndex);
      dispatchCodeEvent('PassTestCodeToBackground', testCode);
      logDebug("Unload test code event handled");
    } catch (error) {
      console.error(`[UNLOAD_TEST_ERROR] ${error.message}`);
    }
  });

  window.addEventListener('loadTestCode', function (evt) {
    try {
      const code = evt.detail;
      if (injectCode(code, options.iframeIndex)) {
        if (options.onAfterLoad) {
          options.onAfterLoad(code);
        }
        logDebug("Load test code event handled");
      }
    } catch (error) {
      console.error(`[LOAD_TEST_ERROR] ${error.message}`);
    }
  }, false);
}