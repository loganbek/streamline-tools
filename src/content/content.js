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
  rules: [],
  currentRule: null,
  retryAttempts: 0,
  maxRetries: 3,
  isIterating: false,
  iterationCount: 0
};

async function fetchRulesList() {
  try {
    const response = await fetch(chrome.runtime.getURL('rulesList.json'));
    if (response.ok) {
      state.rules = await response.json();
      logDebug("Rules loaded:", state.rules.length);
    }
  } catch (error) {
    logDebug("Error loading rules:", error);
  }
}

function findMatchingRule(url) {
  return state.rules.find(rule => {
    try {
      return new URL(url).href.match(rule.pattern ?? rule.URL);
    } catch {
      return false;
    }
  });
}

// Initialize content script
async function initialize() {
  if (state.initialized) return;
  
  try {
    await fetchRulesList();
    setupEventListeners();
    state.initialized = true;
    logDebug("Content script initialized successfully");
    
    // Find matching rule for current page
    state.currentRule = findMatchingRule(window.location.href);
    logDebug("Current rule:", state.currentRule);

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
  const eventHandlers = {
    'PassToBackground': handlePassToBackground,
    'PassCommentHeader': handlePassCommentHeader,
    'PassCodeToBackground': handlePassCodeToBackground,
    'PassTestCodeToBackground': handlePassTestCode,
    'unloadCode': handleUnloadCode
  };

  Object.entries(eventHandlers).forEach(([event, handler]) => {
    domOps.addEventListener(window, event, handler, false);
  });

  window.addEventListener('startIteration', () => {
    state.isIterating = true;
    state.iterationCount++;
  });

  window.addEventListener('endIteration', () => {
    state.isIterating = false;
  });
}

// Event handlers
function handlePassToBackground(evt) {
  dispatchCodeEvent('code', evt.detail);
}

function handlePassCommentHeader(evt) {
  dispatchCodeEvent('commentHeader', evt.detail);
}

function handlePassCodeToBackground(evt) {
  dispatchCodeEvent('code', evt.detail);
}

function handlePassTestCode(evt) {
  dispatchCodeEvent('testCode', evt.detail);
}

function handleUnloadCode(evt) {
  dispatchCodeEvent('code', evt.detail);
}

function dispatchCodeEvent(type, code) {
  domOps.dispatchEvent(window, new CustomEvent('codeUpdate', {
    detail: { type, code, rule: state.currentRule }
  }));
}

// Message handling from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logDebug("Message received", request);

  try {
    if (!state.initialized) {
      throw new Error('Content script not fully initialized');
    }

    if (!state.currentRule && !request.rule) {
      throw new Error('No matching rule found for this page');
    }

    const rule = request.rule || state.currentRule;
    
    if (request.greeting === 'unload') {
      handleUnloadRequest(rule, request, sendResponse);
    } else if (request.greeting === 'load') {
      handleLoadRequest(rule, request, sendResponse);
    } else if (request.greeting === 'unloadTest') {
      handleTestRequest(rule, sendResponse);
    } else if (isSpecialCaseMessage(request.greeting)) {
      handleSpecialCaseMessages(request, sendResponse);
    } else if (request.greeting === 'checkIteration') {
      sendResponse({
        isIterating: state.isIterating,
        iterationCount: state.iterationCount
      });
    } else {
      sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    logDebug("Error handling message:", error);
    sendResponse({ error: error.message });
  }

  return true;
});

function handleUnloadRequest(rule, request, sendResponse) {
  try {
    const selector = request.headerType ? 
      rule[`codeSelector${request.headerType === 'header' ? '1' : '2'}`] :
      rule.codeSelector;
    
    if (!selector) {
      throw new Error('No code selector found for this rule');
    }

    const element = domOps.querySelector(selector);
    if (!element) {
      throw new Error('Code element not found');
    }

    const code = element.value || element.textContent;
    const filename = getFilename(rule);

    sendResponse({
      filename,
      code,
      rule
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function handleLoadRequest(rule, request, sendResponse) {
  try {
    const selector = rule.codeSelector;
    if (!selector) {
      throw new Error('No code selector found for this rule');
    }

    const element = domOps.querySelector(selector);
    if (!element) {
      throw new Error('Code element not found');
    }

    element.value = request.code;
    sendResponse({ status: 'Code loaded successfully' });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function handleTestRequest(rule, sendResponse) {
  try {
    if (rule.hasTest !== 'TRUE') {
      throw new Error('No test configuration for this rule');
    }

    domOps.dispatchEvent(window, new CustomEvent('unloadTestCode'));
    sendResponse({ status: 'Test operation completed' });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function handleSpecialCaseMessages(request, sendResponse) {
  try {
    const type = request.greeting.toLowerCase();
    const selector = type.includes('header') ? 'textarea[name="header"]' :
                    type.includes('footer') ? 'textarea[name="footer"]' :
                    'textarea[name="content"]';

    const element = domOps.querySelector(selector);
    if (!element) {
      throw new Error(`${type} element not found`);
    }

    if (request.greeting.startsWith('unload')) {
      sendResponse({ code: element.value });
    } else {
      element.value = request.code;
      sendResponse({ status: 'Content updated successfully' });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function getFilename(rule) {
  const element = domOps.querySelector(rule.fileNameSelector);
  return element ? element.value || element.textContent : 'unknown.js';
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
