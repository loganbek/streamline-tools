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
    logDebug(`Handling special case message: ${request.greeting}`);
    const type = request.greeting.toLowerCase();
    
    // First load rulesList to get the correct selectors
    fetch(chrome.runtime.getURL('rulesList.json'))
      .then(response => response.json())
      .then(rulesList => {
        // Find the rule for Header & Footer or other special cases
        let rule = null;
        let elementSelector = null;
        
        if (type.includes('headerhtml')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
          elementSelector = rule ? rule.codeSelector : 'textarea[name="header"]';
        } else if (type.includes('footerhtml')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
          elementSelector = rule ? rule.codeSelector2 : 'textarea[name="footer"]';
        } else if (type.includes('css')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Stylesheet Manager');
          elementSelector = rule ? rule.codeSelector : 'pre';
        } else if (type.includes('xml') || type.includes('json')) {
          rule = rulesList.find(r => 
            (r.AppArea === 'Interfaces' && r.RuleName === 'REST') || 
            (r.AppArea === 'Interfaces' && r.RuleName === 'SOAP')
          );
          elementSelector = rule ? rule.codeSelector : 'pre';
        }
        
        logDebug(`Using selector from rulesList: ${elementSelector}`);
        
        // Convert selector string to actual DOM operation
        let element = null;
        if (elementSelector) {
          if (elementSelector.includes('document.querySelector')) {
            // Extract the selector string from the code and execute it
            const selectorMatch = elementSelector.match(/document\.querySelector\(['"]([^'"]+)['"]\)/);
            if (selectorMatch && selectorMatch[1]) {
              element = document.querySelector(selectorMatch[1]);
              logDebug(`Using extracted selector: ${selectorMatch[1]}`);
            }
          } else {
            // Use the selector directly
            element = document.querySelector(elementSelector);
          }
        }
        
        // Fallback selectors if the element wasn't found
        if (!element) {
          logDebug('Element not found with primary selector, trying fallbacks');
          const fallbackSelectors = [];
          
          if (type.includes('headerhtml')) {
            fallbackSelectors.push(
              'textarea[name="header"]', 
              '#header-content',
              'textarea#header',
              'textarea[id*="header"]'
            );
          } else if (type.includes('footerhtml')) {
            fallbackSelectors.push(
              'textarea[name="footer"]',
              '#footer-content',
              'textarea#footer',
              'textarea[id*="footer"]'
            );
          }
          
          // Try fallback selectors
          for (const selector of fallbackSelectors) {
            element = document.querySelector(selector);
            if (element) {
              logDebug(`Found element using fallback selector: ${selector}`);
              break;
            }
          }
          
          // Check for iframe content if still not found
          if (!element) {
            const iframes = document.querySelectorAll('iframe');
            for (const iframe of iframes) {
              try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (type.includes('headerhtml')) {
                  element = iframeDoc.querySelector('textarea[name="header"]');
                } else if (type.includes('footerhtml')) {
                  element = iframeDoc.querySelector('textarea[name="footer"]');
                }
                
                if (element) {
                  logDebug('Found element in iframe');
                  break;
                }
              } catch (iframeError) {
                logDebug('Error accessing iframe content:', iframeError);
              }
            }
          }
        }
        
        if (!element) {
          throw new Error(`${type} element not found - tried multiple selectors`);
        }

        if (request.greeting.startsWith('unload')) {
          const code = element.value || element.innerHTML || element.textContent || '';
          logDebug(`Unloaded content length: ${code.length} characters`);
          
          // For header/footer HTML, match the exact response structure expected by popup.js
          if (type.includes('html')) {
            sendResponse({ 
              code: code,
              status: 'success'
            });
          } else {
            sendResponse({ code });
          }
        } else {
          // Handle load operations
          if (element.tagName === 'TEXTAREA' || element.hasAttribute('contenteditable')) {
            element.value = request.code;
            // Trigger change event for potential editor frameworks
            triggerInputEvents(element);
          } else {
            element.innerHTML = request.code;
          }
          
          sendResponse({ status: 'Content updated successfully' });
        }
      })
      .catch(error => {
        logDebug("Error loading rulesList.json:", error);
        sendResponse({ error: error.message });
      });
      
    // Return true to indicate we'll send the response asynchronously
    return true;
  } catch (error) {
    logDebug("Error handling special case message:", error);
    sendResponse({ error: error.message });
    return false;
  }
}

// Helper function to trigger input events to notify any JavaScript frameworks of the change
function triggerInputEvents(element) {
  // Create and dispatch events
  ['input', 'change'].forEach(eventName => {
    const event = new Event(eventName, { bubbles: true });
    element.dispatchEvent(event);
  });
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
