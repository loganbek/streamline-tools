// Immediately set up ping handler at the top level for immediate response
// We'll use direct DOM APIs instead of require modules

// Use window object to store global variables to avoid redeclaration errors
window.CONTENT_DEBUG = window.CONTENT_DEBUG !== undefined ? window.CONTENT_DEBUG : false; // Set to true only during development
window.SCRIPT_READY = window.SCRIPT_READY !== undefined ? window.SCRIPT_READY : false;
window.PING_READY = window.PING_READY !== undefined ? window.PING_READY : true;

function logDebug(message, ...args) {
  if (window.CONTENT_DEBUG) {
    console.log("[CONTENT_DEBUG]", message, ...args);
  }
}

// State management - use a namespaced approach to avoid conflicts
window.streamlineState = window.streamlineState || {
  initialized: false,
  rules: [],
  currentRule: null,
  retryAttempts: 0,
  maxRetries: 3,
  isIterating: false,
  iterationCount: 0,
  lastClickedInterfaces: {
    REST: null,
    SOAP: null
  }
};

// Use local reference for cleaner code
const state = window.streamlineState;

// IMPORTANT: Dedicated message listener with immediate ping response
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Immediately log all incoming messages
  logDebug("Message received:", request?.greeting || "unknown", request);
  
  // Always respond to ping messages, even if script fails elsewhere
  if (request && request.greeting === 'ping') {
    logDebug("Ping received - responding immediately");
    sendResponse({ status: 'ok' });
    return true;
  }
  
  // For non-ping messages, check if script is ready
  if (!window.SCRIPT_READY) {
    logDebug("Message received before script ready:", request);
    sendResponse({ error: 'Script not fully initialized yet' });
    return true;
  }
  
  try {
    // Enable debugging
    window.CONTENT_DEBUG = true;
    
    if (!state.initialized) {
      // Special case for messages that should work without full initialization
      if (isSpecialCaseMessage(request.greeting)) {
        logDebug(`Handling special case without full initialization: ${request.greeting}`);
        handleSpecialCaseMessages(request, sendResponse);
        return true;
      }
      throw new Error('Content script not fully initialized');
    }

    // Special handling for REST and SOAP interfaces - check if we're in a new window
    if ((request.greeting === 'unloadJSON' || request.greeting === 'unloadXML') && 
        isNewWindowInterface(window.location.href)) {
      logDebug(`Detected we're in a new window for interface data: ${request.greeting}`);
      handleSpecialCaseMessages(request, sendResponse);
      return true;
    }

    // Debug check for interface-specific operations
    if (request.greeting === 'unloadJSON' || request.greeting === 'loadJSON' || 
        request.greeting === 'unloadXML' || request.greeting === 'loadXML') {
      logDebug(`Direct interface operation detected: ${request.greeting}`);
      handleSpecialCaseMessages(request, sendResponse);
      return true;
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
      logDebug(`Special case message detected in main flow: ${request.greeting}`);
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
      logDebug(`Unknown message type received: ${request.greeting}`);
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
    window.PING_READY = true;
    
    // Fetch rules list
    await fetchRulesList();
    
    // Set up DOM event listeners
    setupEventListeners();
    
    // Find matching rule for current page
    state.currentRule = findMatchingRule(window.location.href);
    logDebug("Current rule:", state.currentRule);

    // Also check if this is a new window for REST or SOAP interface
    if (!state.currentRule) {
      state.currentRule = findNewWindowInterfaceRule(window.location.href);
      logDebug("Interface new window rule:", state.currentRule);
    }
    
    // If we're on the interface catalog page, detect whether REST or SOAP is predominant
    const url = window.location.href;
    if (url.includes('/admin/interfaceCatalogs/list_ics_resources.jsp')) {
      const interfaceType = detectInterfaceType();
      logDebug(`Interface catalog page detected, predominant type: ${interfaceType}`);
      
      // Send message to background script about the interface type
      chrome.runtime.sendMessage({
        action: 'setInterfaceType',
        interfaceType: interfaceType
      });
      
      // Add click listeners to all interface links to track the last clicked interface
      setupInterfaceLinkTracking();
    }
    
    // Mark as fully initialized
    state.initialized = true;
    window.SCRIPT_READY = true;
    
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

// Track interface link clicks
function setupInterfaceLinkTracking() {
  try {
    // Find all REST and SOAP interface links
    const interfaceLinks = document.querySelectorAll('a[name="display_resource"]');
    logDebug(`Found ${interfaceLinks.length} interface links to track`);
    
    // Store interface link info with both type and URL details
    window.streamlineState.lastClickedInterfaces = window.streamlineState.lastClickedInterfaces || {
      REST: null,
      SOAP: null
    };
    
    interfaceLinks.forEach(link => {
      // Add click listener to each link
      link.addEventListener('click', function(e) {
        // Extract the URL from the onclick attribute
        const onclickAttr = this.getAttribute('onclick') || '';
        const urlMatch = onclickAttr.match(/openWindow\(['"]([^'"]+)['"]/);
        
        if (urlMatch && urlMatch[1]) {
          const interfaceUrl = urlMatch[1];
          const interfaceName = this.textContent.trim();
          
          // Determine if this is REST or SOAP
          let interfaceType = 'REST'; // Default
          
          // Look at parent row to determine if REST or SOAP
          let row = this.closest('tr');
          if (row) {
            const cells = row.querySelectorAll('td.list-field');
            cells.forEach(cell => {
              const text = cell.textContent.trim();
              if (text === 'REST') {
                interfaceType = 'REST';
              } else if (text === 'SOAP') {
                interfaceType = 'SOAP';
              }
            });
          }
          
          // Store the details of this clicked interface
          window.streamlineState.lastClickedInterfaces[interfaceType] = {
            url: interfaceUrl,
            name: interfaceName,
            timestamp: Date.now()
          };
          
          logDebug(`Tracked ${interfaceType} interface click: ${interfaceName} - ${interfaceUrl}`);
        }
      });
    });
    
    logDebug("Interface link tracking setup complete");
  } catch (error) {
    logDebug("Error setting up interface link tracking:", error);
  }
}

/**
 * Detects whether the interface catalog page shows more REST or SOAP interfaces
 * @returns {string} 'REST' or 'SOAP' depending on which one is more predominant
 */
function detectInterfaceType() {
  try {
    logDebug("Detecting interface type from DOM content...");
    
    // Count REST and SOAP elements
    const cells = document.querySelectorAll('td.list-field');
    let restCount = 0;
    let soapCount = 0;
    
    cells.forEach(cell => {
      const text = cell.textContent.trim();
      if (text === 'REST') {
        restCount++;
      } else if (text === 'SOAP') {
        soapCount++;
      }
    });
    
    logDebug(`Interface counts - REST: ${restCount}, SOAP: ${soapCount}`);
    
    // Additional strategy: also check if the page has interface-specific headers
    const headers = document.querySelectorAll('th');
    headers.forEach(header => {
      const text = header.textContent.trim().toUpperCase();
      if (text.includes('REST')) {
        restCount += 2; // Give extra weight to headers
      } else if (text.includes('SOAP')) {
        soapCount += 2; // Give extra weight to headers
      }
    });
    
    // Return which one is more predominant
    return restCount >= soapCount ? 'REST' : 'SOAP';
  } catch (error) {
    logDebug("Error detecting interface type:", error);
    return 'REST'; // Default to REST if something goes wrong
  }
}

async function fetchRulesList() {
  try {
    const response = await fetch(chrome.runtime.getURL('rulesList.json'));
    if (response.ok) {
      state.rules = await response.json();
      logDebug("Rules loaded:", state.rules.length);
    } else {
      logDebug(`Error loading rules: Server responded with ${response.status} ${response.statusText}`);
      throw new Error(`Failed to load rules: ${response.status} ${response.statusText}`);
    }
    return true;
  } catch (error) {
    logDebug("Error loading rules:", error);
    return false;
  }
}

function findMatchingRule(url) {
  return state.rules.find(rule => {
    const ruleUrl = rule.URL.replace(/\*/g, ''); // Remove wildcard for comparison
    
    // More secure URL matching using URL object
    try {
      const urlObj = new URL(url);
      const ruleUrlObj = new URL(ruleUrl.startsWith('http') ? ruleUrl : 'https://' + ruleUrl);
      
      // Match only based on path, no hostname matching
      return urlObj.pathname.startsWith(ruleUrlObj.pathname);
    } catch (e) {
      // Fallback to a safer regex pattern if URL parsing fails
      const escapedPattern = ruleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${escapedPattern}\\/`);
      return regex.test(url);
    }
  });
}

// New function to check if we're in a new window for an interface (REST/SOAP)
function findNewWindowInterfaceRule(url) {
  return state.rules.find(rule => {
    // Skip rules without newWindowURL
    if (!rule.newWindowURL || rule.newWindowURL === "x") return false;
    
    // Clean up the newWindowURL for comparison
    const newWindowUrl = rule.newWindowURL.replace(/\*/g, '');
    
    try {
      // Check if the current URL matches the newWindowURL pattern
      const urlObj = new URL(url);
      let ruleUrlObj;
      
      try {
        ruleUrlObj = new URL(newWindowUrl.startsWith('http') ? newWindowUrl : 'https://' + newWindowUrl);
      } catch (e) {
        // If the ruleUrl is malformed, try to extract the path part
        const pathMatch = newWindowUrl.match(/\/([^/].+)$/);
        if (pathMatch && pathMatch[1]) {
          return urlObj.pathname.includes(pathMatch[1]);
        }
        return false;
      }
      
      // First check for exact match
      if (urlObj.pathname === ruleUrlObj.pathname) return true;
      
      // Then check if the URL contains the path from the rule
      // This is especially important for REST/SOAP interfaces that might have additional path segments
      const rulePath = ruleUrlObj.pathname;
      return urlObj.pathname.includes(rulePath);
    } catch (e) {
      // Fallback to basic string matching if URL parsing fails
      logDebug("URL parsing failed for newWindowURL:", e);
      return url.includes(newWindowUrl);
    }
  });
}

// Helper function to determine if the current URL matches a new window interface URL
function isNewWindowInterface(url) {
  if (!state.rules || state.rules.length === 0) return false;
  
  const interfaceRules = state.rules.filter(rule => 
    rule.AppArea === 'Interfaces' && 
    // Consider both explicitly marked new windows and any REST/SOAP interface URLs
    ((rule.opensNewWindow === "TRUE" && rule.newWindowURL && rule.newWindowURL !== "x") ||
     (rule.RuleName === "REST" || rule.RuleName === "SOAP"))
  );
  
  for (const rule of interfaceRules) {
    // Handle the case where openNewWindow is TRUE and newWindowURL is specified
    if (rule.newWindowURL && rule.newWindowURL !== "x") {
      const newWindowUrl = rule.newWindowURL.replace(/\*/g, '');
      
      try {
        const urlObj = new URL(url);
        const ruleUrlObj = new URL(newWindowUrl.startsWith('http') ? newWindowUrl : 'https://' + newWindowUrl);
        
        // Match on path for REST/SOAP endpoints
        if (urlObj.pathname.includes(ruleUrlObj.pathname)) {
          logDebug(`Matched interface new window rule: ${rule.RuleName}`);
          return true;
        }
      } catch (e) {
        // Simple string matching fallback
        if (url.includes(newWindowUrl)) {
          logDebug(`Simple match for interface new window rule: ${rule.RuleName}`);
          return true;
        }
      }
    }
    
    // Additional patterns for REST/SOAP interfaces opened in popups
    // These patterns match URLs like: 
    // https://devmcnichols.bigmachines.com/rest/v18/metadata-catalog/commerceDocumentsQuickstart_commerce_processQuote_process
    if ((rule.RuleName === "REST" || rule.RuleName === "SOAP") && url.includes(".bigmachines.com/rest/")) {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
      // Check for REST API URL pattern
      if (pathSegments.includes('rest') && pathSegments.length >= 3) {
        logDebug(`Matched REST/SOAP interface by URL pattern: ${url}`);
        return true;
      }
    }
  }
  
  // Check if we're in a popup window that might be a REST/SOAP interface
  if (window.opener && window.name === "Interface Catalog") {
    logDebug("Detected we're in a popup named 'Interface Catalog', likely a REST/SOAP interface");
    return true;
  }
  
  return false;
}

function setupEventListeners() {
  const eventHandlers = {
    'PassToBackground': handlePassToBackground,
    'PassCommentHeader': handlePassCommentHeader,
    'PassCodeToBackground': handlePassToBackground, // Reuse the existing handler instead of duplicate
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

    element.value = request.code;
    // Trigger input events to notify frameworks of the change
    triggerInputEvents(element);
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
    
    // Check if we're in a REST or SOAP interface new window
    const isInterfaceWindow = isNewWindowInterface(window.location.href);
    
    // Special handling for interface catalog page (list_ics_resources.jsp)
    const isInterfaceCatalogPage = window.location.href.includes('/admin/interfaceCatalogs/list_ics_resources.jsp');
    
    // If we're on catalog page and trying to unload JSON/XML, we need to handle this specially
    if (isInterfaceCatalogPage && 
        (request.greeting === 'unloadJSON' || request.greeting === 'unloadXML')) {
      logDebug(`Detected interface catalog page for ${request.greeting}`);
      
      try {
        // We need to find the correct interface link to open
        const interfaceType = request.greeting === 'unloadJSON' ? 'REST' : 'SOAP';
        
        // Check if we have a last clicked interface of this type
        if (window.streamlineState.lastClickedInterfaces && 
            window.streamlineState.lastClickedInterfaces[interfaceType] &&
            window.streamlineState.lastClickedInterfaces[interfaceType].url) {
          
          const interfaceDetails = window.streamlineState.lastClickedInterfaces[interfaceType];
          logDebug(`Found tracked ${interfaceType} interface: ${interfaceDetails.name}`);
          
          // Use fetch to directly download the interface content
          fetch(interfaceDetails.url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              if (interfaceType === 'REST') {
                return response.json().then(data => {
                  // Format JSON nicely
                  const formattedJSON = JSON.stringify(data, null, 2);
                  
                  // Send the formatted JSON back
                  sendResponse({
                    code: formattedJSON,
                    filename: interfaceDetails.name
                  });
                });
              } else {
                return response.text().then(text => {
                  sendResponse({
                    code: text,
                    filename: interfaceDetails.name
                  });
                });
              }
            })
            .catch(error => {
              logDebug(`Error fetching ${interfaceType} interface:`, error);
              
              // Attempt fallback to window-based approach
              sendResponse({
                code: `// Error fetching ${interfaceType} interface directly: ${error.message}\n`,
                filename: `error_${interfaceDetails.name}`
              });
            });
          
          // Return true to keep the messaging channel open for async response
          return true;
        }
        
        // Special handling: Check for any open popup windows first
        const openedWindows = window.opener ? [] : getOpenedWindows();
        logDebug(`Found ${openedWindows.length} opened windows from this page`);
        
        if (openedWindows.length > 0) {
          // Try to find an appropriate window that might contain our interface content
          for (const openWindow of openedWindows) {
            try {
              // Try to access the window content (may fail due to same-origin policy)
              if (!openWindow.document) continue;
              
              const windowUrl = openWindow.location.href;
              logDebug(`Checking opened window: ${windowUrl}`);
              
              // Check if this window URL looks like an interface URL
              const isRESTWindow = windowUrl.includes('/rest/');
              const isSOAPWindow = windowUrl.includes('/soap/') || windowUrl.includes('/ws/');
              
              // If the window type matches what we're looking for
              if ((request.greeting === 'unloadJSON' && isRESTWindow) ||
                  (request.greeting === 'unloadXML' && isSOAPWindow)) {
                  
                logDebug(`Found matching interface window for ${request.greeting}`);
                
                // Try to extract the content from the window
                let content = '';
                let filename = '';
                
                // Get content from the pre tag if it exists
                const preElement = openWindow.document.querySelector('pre');
                if (preElement) {
                  content = preElement.textContent || preElement.innerText;
                } else {
                  // Fallback to body text
                  content = openWindow.document.body.textContent || openWindow.document.body.innerText;
                }
                
                // Clean up the content if it's JSON
                if (request.greeting === 'unloadJSON' && content) {
                  try {
                    const jsonObject = JSON.parse(content);
                    content = JSON.stringify(jsonObject, null, 2); // Pretty format
                  } catch (e) {
                    logDebug('Could not parse JSON from window content, using raw content');
                  }
                }
                
                // Extract filename from URL
                const urlPath = new URL(windowUrl).pathname;
                const pathParts = urlPath.split('/');
                filename = pathParts[pathParts.length - 1];
                
                // If the filename doesn't look valid, try to extract it from metadata
                if (!filename || filename === '' || filename === '/') {
                  // Try to find filename in the document title or other metadata
                  if (openWindow.document.title && openWindow.document.title !== 'Interface Catalog') {
                    filename = openWindow.document.title
                      .replace(/[^a-zA-Z0-9_-]/g, '_')
                      .replace(/_+/g, '_');
                  } else {
                    // Generate a filename based on interface type and timestamp
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    filename = `interface_${interfaceType.toLowerCase()}_${timestamp}`;
                  }
                }
                
                // Ensure proper file extension
                if (request.greeting === 'unloadJSON' && !filename.endsWith('.json')) {
                  filename = filename.replace(/\.[^/.]+$/, '') + '.json';
                } else if (request.greeting === 'unloadXML' && !filename.endsWith('.xml')) {
                  filename = filename.replace(/\.[^/.]+$/, '') + '.xml';
                }
                
                // Return the content and filename
                sendResponse({
                  code: content || `// No ${interfaceType} content found in the opened window.`,
                  filename: filename.replace(/\.[^/.]+$/, '') // Remove extension as it will be added later
                });
                return true;
              }
            } catch (error) {
              logDebug(`Error accessing window: ${error.message}`);
              continue; // Try next window
            }
          }
        }
        
        // If none of the above methods worked, display a more direct message
        sendResponse({
          code: `// No ${interfaceType} interface content found.\n// Try clicking on a specific interface first.`,
          filename: `${interfaceType.toLowerCase()}_interface`
        });
        return true;
      } catch (error) {
        logDebug("Error handling interface catalog page:", error);
        sendResponse({ error: error.message });
        return false;
      }
    }
    
    // Rest of the handleSpecialCaseMessages function remains unchanged
    // ...existing code...
  } catch (error) {
    logDebug("Error handling special case message:", error);
    sendResponse({ error: error.message });
    return false;
  }
}

/**
 * Helper function to get all windows opened by this page
 * @returns {Array<Window>} Array of window objects
 */
function getOpenedWindows() {
  const openWindows = [];
  try {
    // Check if window.open has been called and stored references
    if (window._openedWindows && Array.isArray(window._openedWindows)) {
      return window._openedWindows.filter(win => win && !win.closed);
    }
    
    // Try another approach to find children windows
    if (window.opener === null) { // This is a parent window
      // Try to access child window properties in a safe way
      const windowReferences = Object.keys(window)
        .filter(key => {
          try {
            return window[key] instanceof Window && 
                  window[key] !== window && 
                  window[key].opener === window &&
                  !window[key].closed;
          } catch (e) {
            return false; // In case of cross-origin issues
          }
        })
        .map(key => window[key]);
      
      return windowReferences;
    }
  } catch (e) {
    logDebug("Error getting opened windows:", e);
  }
  
  return openWindows;
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
