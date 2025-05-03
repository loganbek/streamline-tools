// Immediately set up ping handler at the top level for immediate response
// We'll use direct DOM APIs instead of require modules

const CONTENT_DEBUG = true;
let SCRIPT_READY = false; // Flag to indicate if the script is ready to receive messages
let PING_READY = true; // Flag to ensure ping always responds, even if other parts fail

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

// IMPORTANT: Dedicated message listener with immediate ping response
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Immediately log all incoming messages
  logDebug("Message received:", request?.greeting || "unknown");
  
  // Always respond to ping messages, even if script fails elsewhere
  if (request && request.greeting === 'ping') {
    logDebug("Ping received - responding immediately");
    sendResponse({ status: 'ok' });
    return true;
  }
  
  // For non-ping messages, check if script is ready
  if (!SCRIPT_READY) {
    logDebug("Message received before script ready:", request);
    sendResponse({ error: 'Script not fully initialized yet' });
    return true;
  }
  
  try {
    if (!state.initialized) {
      // Special case for messages that should work without full initialization
      if (isSpecialCaseMessage(request.greeting)) {
        handleSpecialCaseMessages(request, sendResponse);
        return true;
      }
      throw new Error('Content script not fully initialized');
    }

    if (!state.currentRule && !request.rule && !isSpecialCaseMessage(request.greeting)) {
      throw new Error('No matching rule found for this page');
    }

    const rule = request.rule || state.currentRule;
    
    if (request.greeting === 'unload') {
      handleUnloadRequest(rule, request, sendResponse);
    } else if (request.greeting === 'load') {
      handleLoadRequest(rule, request, sendResponse);
    } else if (request.greeting === 'unloadTest') {
      handleTestRequest(rule, sendResponse);
    } else if (request.greeting === 'loadTest') {
      handleLoadTestRequest(rule, request, sendResponse);
    } else if (isSpecialCaseMessage(request.greeting)) {
      handleSpecialCaseMessages(request, sendResponse);
    } else if (request.greeting === 'checkIteration') {
      sendResponse({
        isIterating: state.isIterating,
        iterationCount: state.iterationCount
      });
    } else if (request.greeting === 'startIteration') {
      state.isIterating = true;
      state.iterationCount = request.iterationCount || state.iterationCount + 1;
      sendResponse({ status: 'Iteration started', iterationCount: state.iterationCount });
    } else if (request.greeting === 'endIteration') {
      state.isIterating = false;
      sendResponse({ status: 'Iteration ended' });
    } else {
      sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    logDebug("Error handling message:", error);
    sendResponse({ error: error.message });
  }

  return true;
});

// Initialize content script with improved error handling
async function initialize() {
  try {
    logDebug("Content script initializing...");
    
    if (state.initialized) {
      logDebug("Already initialized, skipping");
      return;
    }
    
    // Set ping ready immediately (defensive programming)
    PING_READY = true;
    
    // Fetch rules list
    await fetchRulesList();
    
    // Set up DOM event listeners
    setupEventListeners();
    
    // Find matching rule for current page
    state.currentRule = findMatchingRule(window.location.href);
    logDebug("Current rule:", state.currentRule);
    
    // Mark as fully initialized
    state.initialized = true;
    SCRIPT_READY = true;
    
    logDebug("Content script initialization COMPLETE");
    
    // Notify background that content script is ready
    chrome.runtime.sendMessage({ type: 'contentScriptReady' });
  } catch (error) {
    logDebug("Initialization error:", error);
    
    if (state.retryAttempts < state.maxRetries) {
      state.retryAttempts++;
      const delay = 1000 * state.retryAttempts;
      logDebug(`Retrying initialization in ${delay}ms (attempt ${state.retryAttempts}/${state.maxRetries})`);
      setTimeout(initialize, delay);
    } else {
      logDebug("Max retry attempts reached. Initialization failed.");
    }
  }
}

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
    const ruleUrl = rule.URL.replace(/\*/g, ''); // Remove wildcard for comparison
    
    // More secure URL matching using URL object
    try {
      const urlObj = new URL(url);
      const ruleUrlObj = new URL(ruleUrl.startsWith('http') ? ruleUrl : 'https://' + ruleUrl);
      
      // Compare hostname and path parts more securely
      const hostMatch = 
          urlObj.hostname === ruleUrlObj.hostname ||
          urlObj.hostname.endsWith('.' + ruleUrlObj.hostname);
      
      // Must match both host AND path to be considered a match
      return hostMatch && urlObj.pathname.startsWith(ruleUrlObj.pathname);
    } catch (e) {
      // Fallback to a safer regex pattern if URL parsing fails
      const escapedPattern = ruleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${escapedPattern}\\/`);
      return regex.test(url);
    }
  });
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
    window.addEventListener(event, handler, false);
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
  window.dispatchEvent(new CustomEvent('codeUpdate', {
    detail: { type, code, rule: state.currentRule }
  }));
}

function handleUnloadRequest(rule, request, sendResponse) {
  try {
    const selector = request.headerType ? 
      rule[`codeSelector${request.headerType === 'header' ? '1' : '2'}`] :
      rule.codeSelector;
    
    if (!selector) {
      throw new Error('No code selector found for this rule');
    }

    const element = document.querySelector(selector);
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

    const element = document.querySelector(selector);
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

    window.dispatchEvent(new CustomEvent('unloadTestCode'));
    sendResponse({ status: 'Test operation completed' });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function handleLoadTestRequest(rule, request, sendResponse) {
  try {
    if (rule.hasTest !== 'TRUE') {
      throw new Error('No test configuration for this rule');
    }
    
    // Dispatch the loadTestCode event with the test code
    window.dispatchEvent(new CustomEvent('loadTestCode', {
      detail: request.code
    }));
    
    sendResponse({ status: 'Test code loaded successfully' });
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

    const element = document.querySelector(selector);
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
  const element = document.querySelector(rule.fileNameSelector);
  return element ? element.value || element.textContent : 'unknown.js';
}

function isSpecialCaseMessage(greeting) {
  return greeting && (
    greeting.includes('HeaderHTML') ||
    greeting.includes('FooterHTML') ||
    greeting.includes('CSS') ||
    greeting.includes('XML') ||
    greeting.includes('XSL') ||
    greeting.includes('JSON')
  );
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
