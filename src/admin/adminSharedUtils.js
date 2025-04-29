/**
 * Shared utilities for admin injected scripts
 * @module adminSharedUtils
 */

// Performance monitoring
const metrics = {
  operations: 0,
  errors: 0,
  startTime: Date.now(),
  timings: new Map()
};

// Retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500; // ms

/**
 * Records performance metrics for operations
 * @param {string} operation - Name of operation
 * @param {number} duration - Duration in ms 
 */
function recordMetric(operation, duration) {
  metrics.operations++;
  if (!metrics.timings.has(operation)) {
    metrics.timings.set(operation, []);
  }
  metrics.timings.get(operation).push(duration);
}

/**
 * Retries an operation on failure
 * @param {Function} operation - Operation to retry
 * @param {number} attempts - Number of attempts remaining
 * @returns {Promise<any>} Operation result
 */
async function retryOperation(operation, attempts = RETRY_ATTEMPTS) {
  try {
    const start = performance.now();
    const result = await operation();
    recordMetric(operation.name, performance.now() - start);
    return result;
  } catch (error) {
    metrics.errors++;
    if (attempts <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return retryOperation(operation, attempts - 1);
  }
}

/**
 * Validates access to an iframe and its contentDocument
 * @param {HTMLIFrameElement} iframe - The iframe to validate
 * @throws {Error} If iframe or contentDocument is not accessible
 */
function validateIframe(iframe) {
  if (!iframe?.contentDocument) {
    throw new Error('Invalid iframe or contentDocument not accessible');
  }
}

/**
 * Validates access to a textarea element
 * @param {HTMLTextAreaElement} textarea - The textarea to validate
 * @throws {Error} If textarea is not valid
 */
function validateTextarea(textarea) {
  if (!textarea || typeof textarea.value !== 'string') {
    throw new Error('Invalid textarea element');
  }
}

/**
 * Options for setting up common event listeners
 * @typedef {Object} ListenerOptions
 * @property {boolean} [debug=false] - Enable debug logging
 * @property {string} [debugPrefix='DEBUG'] - Prefix for debug logs
 * @property {number} [iframeIndex=0] - Index of iframe containing textarea
 * @property {(code: string) => void} [onAfterLoad] - Callback after code is loaded
 * @property {() => void} [onLoad] - Callback when window loads
 * @property {boolean} [enableRetries=true] - Enable operation retries
 * @property {boolean} [collectMetrics=false] - Enable performance metrics
 */

/**
 * Injects code into the textarea within an iframe
 * @param {string} code - Code to inject
 * @param {number} [iframeIndex=0] - Index of iframe containing textarea
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.enableRetries=true] - Enable retries on failure
 * @returns {Promise<boolean>} Success status
 */
export async function injectCode(code, iframeIndex = 0, options = { enableRetries: true }) {
  try {
    const iframes = document.getElementsByTagName('iframe');
    if (!iframes || !iframes[iframeIndex]) {
      console.error('[INJECT_ERROR] Iframe not found');
      return false;
    }

    const iframe = iframes[iframeIndex];
    validateIframe(iframe);

    const textarea = iframe.contentDocument.querySelector('#textarea');
    if (!textarea) {
      console.error('[INJECT_ERROR] Textarea not found');
      return false;
    }

    validateTextarea(textarea);
    textarea.value = code;
    return true;
  } catch (error) {
    console.error(`[INJECT_ERROR] ${error.message}`);
    if (options.enableRetries) {
      return retryOperation(() => injectCode(code, iframeIndex, { ...options, enableRetries: false }));
    }
    return false;
  }
}

/**
 * Extracts code from the textarea within an iframe
 * @param {number} [iframeIndex=0] - Index of iframe containing textarea
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.enableRetries=true] - Enable retries on failure
 * @returns {Promise<string>} Extracted code or newline
 */
export async function extractCode(iframeIndex = 0, options = { enableRetries: true }) {
  try {
    const iframes = document.getElementsByTagName('iframe');
    if (!iframes || !iframes[iframeIndex]) {
      console.error('[EXTRACT_ERROR] Iframe not found');
      return '\n';
    }

    const iframe = iframes[iframeIndex];
    validateIframe(iframe);

    const textarea = iframe.contentDocument.querySelector('#textarea');
    if (!textarea) {
      console.error('[EXTRACT_ERROR] Textarea not found');
      return '\n';
    }

    validateTextarea(textarea);
    return textarea.value;
  } catch (error) {
    console.error(`[EXTRACT_ERROR] ${error.message}`);
    if (options.enableRetries) {
      return retryOperation(() => extractCode(iframeIndex, { ...options, enableRetries: false }));
    }
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
  if (typeof eventName !== 'string' || !eventName) {
    console.error('[DISPATCH_ERROR] Invalid event name');
    return null;
  }

  try {
    const event = new CustomEvent(eventName, { 
      detail: code,
      bubbles: true, // Allow event to bubble up through DOM
      cancelable: true // Allow event to be canceled
    });
    window.dispatchEvent(event);
    return event;
  } catch (error) {
    console.error(`[DISPATCH_ERROR] Failed to dispatch ${eventName}: ${error.message}`);
    return null;
  }
}

/**
 * Creates a debug logger function
 * @param {boolean} debug - Whether debug logging is enabled
 * @param {string} [prefix='DEBUG'] - Prefix for debug messages
 * @returns {Function} Debug logger function
 */
function createDebugLogger(debug, prefix = 'DEBUG') {
  return (...args) => {
    if (debug) {
      console.log(`[${prefix}]`, ...args);
    }
  };
}

/**
 * Wraps an event handler with error logging
 * @param {Function} handler - The event handler to wrap
 * @param {string} errorType - Type of error for logging
 * @param {Function} logDebug - Debug logger function
 * @returns {Function} Wrapped handler with error logging
 */
function wrapWithErrorHandling(handler, errorType, logDebug) {
  return (...args) => {
    try {
      handler(...args);
      logDebug(`${errorType} handled successfully`);
    } catch (error) {
      console.error(`[${errorType}_ERROR] ${error.message}`);
      logDebug(`${errorType} handler failed:`, error);
    }
  };
}

/**
 * Sets up common event listeners for code operations
 * @param {ListenerOptions} options - Configuration options
 */
export function setupCommonEventListeners(options = { debug: false }) {
  const logDebug = createDebugLogger(options.debug, options.debugPrefix);
  logDebug('Initializing with options:', options);

  // Clean up any existing event listeners to prevent memory leaks
  const cleanup = new Set();

  const handlers = {
    load: () => {
      if (typeof options.onLoad === 'function') {
        options.onLoad();
      }
    },

    unloadCode: async () => {
      const code = await extractCode(options.iframeIndex, {
        enableRetries: options.enableRetries
      });
      dispatchCodeEvent('PassCodeToBackground', code);
    },

    loadCode: async (evt) => {
      const code = evt.detail;
      const success = await injectCode(code, options.iframeIndex, {
        enableRetries: options.enableRetries
      });
      if (success && options.onAfterLoad) {
        options.onAfterLoad(code);
      }
    },

    unloadTestCode: async () => {
      const testCode = await extractCode(options.iframeIndex, {
        enableRetries: options.enableRetries
      });
      dispatchCodeEvent('PassTestCodeToBackground', testCode);
    },

    loadTestCode: async (evt) => {
      const code = evt.detail;
      const success = await injectCode(code, options.iframeIndex, {
        enableRetries: options.enableRetries
      });
      if (success && options.onAfterLoad) {
        options.onAfterLoad(code);
      }
    }
  };

  // Add wrapped event listeners
  Object.entries(handlers).forEach(([event, handler]) => {
    const wrappedHandler = wrapWithErrorHandling(handler, event.toUpperCase(), logDebug);
    window.addEventListener(event, wrappedHandler, false);
    cleanup.add(() => window.removeEventListener(event, wrappedHandler));
  });

  // Clean up on unload to prevent memory leaks
  window.addEventListener('unload', () => {
    cleanup.forEach(cleanupFn => cleanupFn());
    cleanup.clear();
  });

  // Expose metrics if enabled
  if (options.collectMetrics) {
    window.__DEBUG_METRICS__ = metrics;
  }
}