const CONTENT_DEBUG = true;
import domOps from './domOperations';

function logDebug(message, ...args) {
  if (CONTENT_DEBUG) {
    console.log("[CONTENT_DEBUG]", message, ...args);
  }
}

// State management
const state = {
  initialized: false,
  commentHeader: "// ",
  code: "",
  testCode: "",
  retryAttempts: 0,
  maxRetries: 3,
  isIterating: false,
  iterationCount: 0
};

// Initialize content script
function initialize() {
  if (state.initialized) return;
  
  try {
    // Register all event listeners
    setupEventListeners();
    state.initialized = true;
    logDebug("Content script initialized successfully");
    
    // Notify background script that content script is ready
    chrome.runtime.sendMessage({ type: 'contentScriptReady' });
  } catch (error) {
    logDebug("Initialization error:", error);
    if (state.retryAttempts < state.maxRetries) {
      state.retryAttempts++;
      setTimeout(initialize, 1000 * state.retryAttempts);
    }
  }
}

function setupEventListeners() {
  // Event listeners for custom events with error handling
  const eventHandlers = {
    'PassToBackground': (evt) => {
      state.code = evt.detail;
      logDebug("PassToBackground event handled", { length: state.code.length });
    },
    'PassCommentHeader': (evt) => {
      state.commentHeader = evt.detail;
      logDebug("PassCommentHeader event handled", state.commentHeader);
    },
    'PassCodeToBackground': (evt) => {
      state.code = evt.detail;
      logDebug("PassCodeToBackground event handled", { length: state.code.length });
    },
    'PassTestCodeToBackground': (evt) => {
      state.testCode = evt.detail;
      logDebug("PassTestCodeToBackground event handled", { length: state.testCode.length });
    },
    'unloadCode': (evt) => {
      state.code = evt.detail;
      logDebug("unloadCode event handled", { length: state.code.length });
    }
  };

  Object.entries(eventHandlers).forEach(([event, handler]) => {
    domOps.addEventListener(window, event, (evt) => {
      try {
        handler(evt);
      } catch (error) {
        logDebug(`Error handling ${event}:`, error);
      }
    }, false);
  });

  // Add iteration event handlers
  window.addEventListener('startIteration', (evt) => {
    state.isIterating = true;
    state.iterationCount++;
    logDebug("Starting iteration:", state.iterationCount);
  });

  window.addEventListener('endIteration', (evt) => {
    state.isIterating = false;
    logDebug("Ending iteration:", state.iterationCount);
  });
}

// Message handling from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logDebug("Message received", request);

  try {
    if (!state.initialized) {
      throw new Error('Content script not fully initialized');
    }

    // Handle command API messages
    if (request.direction) {
      logDebug("Command API message received for direction:", request.direction);
      sendResponse({ success: true });
      return true;
    }

    // Handle BML-related messages
    if (request.greeting === 'load' || request.greeting === 'unload') {
      handleBMLMessage(request, sendResponse);
      return true;
    }

    // Handle special case messages
    if (isSpecialCaseMessage(request.greeting)) {
      handleSpecialCaseMessages(request, sendResponse);
      return true;
    }

    if (request.greeting === 'checkIteration') {
      sendResponse({
        isIterating: state.isIterating,
        iterationCount: state.iterationCount
      });
      return true;
    }

    sendResponse({ error: 'Unknown message type' });
  } catch (error) {
    logDebug("Error handling message:", error);
    sendResponse({ error: error.message });
  }

  return true;
});

function handleBMLMessage(request, sendResponse) {
  try {
    if (request.greeting === 'load' && request.code) {
      // Handle load request
      const textarea = domOps.getTextArea();
      if (!textarea) {
        throw new Error('Textarea not found');
      }
      textarea.value = request.code;
      sendResponse({ success: true });
    } else if (request.greeting === 'unload') {
      // Handle unload request
      const textarea = domOps.getTextArea();
      if (!textarea) {
        throw new Error('Textarea not found');
      }
      state.code = textarea.value;
      sendResponse({ success: true, code: state.code });
    }
  } catch (error) {
    logDebug("Error handling BML message:", error);
    sendResponse({ error: error.message });
  }
}

function isSpecialCaseMessage(greeting) {
  return greeting && (
    greeting.includes('HeaderHTML') ||
    greeting.includes('FooterHTML') ||
    greeting.includes('CSS') ||
    greeting.includes('XML')
  );
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
