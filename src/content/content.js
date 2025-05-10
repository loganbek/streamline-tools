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
  iterationCount: 0
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
        
        // Look for all rows containing the specified interface type
        const rows = Array.from(document.querySelectorAll('tr.bgcolor-list-odd, tr.bgcolor-list-even'));
        logDebug(`Found ${rows.length} total rows in the interface table`);
        
        // Each row has multiple cells, we want to find rows where one cell contains "REST" or "SOAP"
        const interfaceRows = rows.filter(row => {
          const cells = Array.from(row.querySelectorAll('td.list-field'));
          return cells.some(cell => cell.textContent.trim() === interfaceType);
        });
        
        logDebug(`Found ${interfaceRows.length} ${interfaceType} interface rows`);
        
        if (interfaceRows.length === 0) {
          sendResponse({
            code: `// No ${interfaceType} interfaces found on this page.`,
            filename: 'no_interfaces_found'
          });
          return true;
        }
        
        // Process the first interface for now (we can enhance this later to handle multiple)
        const firstRow = interfaceRows[0];
        const cells = Array.from(firstRow.querySelectorAll('td.list-field'));
        
        // Find the link and interface name
        let interfaceName = 'interface';
        let interfaceUrl = '';
        
        // Usually the name is in the second column
        if (cells.length > 1) {
          const nameCell = cells[1];
          const link = nameCell.querySelector('a[name="display_resource"]');
          
          if (link) {
            interfaceName = link.textContent.trim();
            // Extract URL from onclick attribute (typically in format: openWindow('url'))
            const onclickAttr = link.getAttribute('onclick') || '';
            const urlMatch = onclickAttr.match(/openWindow\(['"]([^'"]+)['"]/);
            if (urlMatch && urlMatch[1]) {
              interfaceUrl = urlMatch[1];
              logDebug(`Found interface URL: ${interfaceUrl}`);
            }
          }
        }
        
        // Create a helpful sample response
        let sampleCode = '';
        if (interfaceType === 'REST') {
          sampleCode = `{
  "name": "${interfaceName}",
  "description": "This is a placeholder for the JSON that would be returned from ${interfaceUrl}",
  "instructions": "To get the actual JSON content, please click on the '${interfaceName}' link first to open it in a new window, then click the unloadJSON button with that window active."
}`;
        } else {
          sampleCode = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <!-- This is a placeholder for the XML that would be returned from ${interfaceUrl} -->
    <instructions>
      To get the actual XML content, please click on the '${interfaceName}' link first to open it in a new window, then click the unloadXML button with that window active.
    </instructions>
  </soap:Header>
  <soap:Body>
    <interfaceName>${interfaceName}</interfaceName>
  </soap:Body>
</soap:Envelope>`;
        }
        
        // Return a structured response with the sample content and helpful information
        sendResponse({
          code: sampleCode,
          filename: interfaceName
        });
        
        return true;
      } catch (error) {
        logDebug("Error handling interface catalog page:", error);
        
        // Fallback to a simpler but still informative response
        sendResponse({
          code: `// You're currently on the Interface Catalog page.\n// Please click on a specific interface link first to open it in a new window,\n// then click the unloadJSON button with that window active.`,
          filename: 'interface_instructions'
        });
        return true;
      }
    }
    
    // Use already loaded rules if available, or fetch them if needed
    const rulesPromise = state.rules.length > 0
      ? Promise.resolve(state.rules)
      : fetch(chrome.runtime.getURL('rulesList.json')).then(response => response.json());
    
    rulesPromise
      .then(rulesList => {
        // Find the rule for Header & Footer or other special cases
        let rule = null;
        let elementSelector = null;
        
        // Handle specific direct interface actions (unloadJSON, loadJSON, unloadXML, loadXML)
        if (request.greeting === 'unloadJSON' || request.greeting === 'loadJSON') {
          rule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'REST');
          if (rule) {
            elementSelector = rule.codeSelector;
            logDebug(`Found REST interface rule for ${request.greeting}`, rule);
          }
        } else if (request.greeting === 'unloadXML' || request.greeting === 'loadXML') {
          rule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'SOAP');
          if (rule) {
            elementSelector = rule.codeSelector;
            logDebug(`Found SOAP interface rule for ${request.greeting}`, rule);
          }
        }
        // Handle other special case messages based on content
        else if (type.includes('headerhtml')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
          elementSelector = rule ? rule.codeSelector : 'textarea[name="header"]';
        } else if (type.includes('footerhtml')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
          elementSelector = rule ? rule.codeSelector2 : 'textarea[name="footer"]';
        } else if (type.includes('css')) {
          rule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Stylesheet Manager');
          elementSelector = rule ? rule.codeSelector : 'pre';
        } else if (type.includes('xml')) {
          rule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'SOAP');
          elementSelector = rule ? rule.codeSelector : 'pre';
        } else if (type.includes('json')) {
          rule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'REST');
          elementSelector = rule ? rule.codeSelector : 'pre';
        }
        
        // Handle case where we're in an interface window (JSON or XML)
        if (isInterfaceWindow && (type.includes('json') || type.includes('xml') || 
            request.greeting === 'unloadJSON' || request.greeting === 'loadJSON' || 
            request.greeting === 'unloadXML' || request.greeting === 'loadXML')) {
          logDebug('Handling interface new window - using pre selector');
          // In new window REST/SOAP views, the content is typically in a pre tag
          elementSelector = 'pre';
        }
        
        // Special handling for Interface Catalog page - observe direct REST API windows
        const isRestAPIWindow = window.location.href.includes('bigmachines.com/rest/');
        if (isRestAPIWindow && 
            (request.greeting === 'unloadJSON' || request.greeting === 'loadJSON')) {
          logDebug('Detected direct REST API window, using body as source');
          elementSelector = 'body';
        }
        
        logDebug(`Using selector from rulesList: ${elementSelector}`);
        
        // Convert selector string to actual DOM operation
        let element = null;
        if (elementSelector) {
          if (elementSelector.includes('document.querySelector')) {
            // Extract the selector string from the code and execute it
            const selectorMatch = elementSelector.match(/document\.querySelector\(['"]([^'"]+)['"]\)/);
            if (selectorMatch?.[1]) {
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
          } else if (type.includes('json') || type.includes('xml') || 
                  request.greeting === 'unloadJSON' || request.greeting === 'loadJSON' || 
                  request.greeting === 'unloadXML' || request.greeting === 'loadXML') {
            // Fallbacks for REST and SOAP interfaces
            fallbackSelectors.push(
              'pre',
              '.response-body pre',
              '.response pre',
              '[data-content-type="application/json"] pre',
              '[data-content-type="application/xml"] pre',
              'code',
              'body' // Last resort - try the body itself
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
                } else if (type.includes('json') || type.includes('xml') ||
                    request.greeting === 'unloadJSON' || request.greeting === 'loadJSON' || 
                    request.greeting === 'unloadXML' || request.greeting === 'loadXML') {
                  element = iframeDoc.querySelector('pre');
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
          throw new Error(`${request.greeting} element not found - tried multiple selectors`);
        }

        if (request.greeting.startsWith('unload')) {
          // Get code from element considering different element types and page contexts
          let code = '';
          
          // If element is body and we're in a REST window, handle specially
          if (element.tagName === 'BODY' && isRestAPIWindow) {
            code = document.body.innerText || document.body.textContent;
            // Try to clean up the content if it's a REST API response
            try {
              const jsonObject = JSON.parse(code);
              code = JSON.stringify(jsonObject, null, 2); // Pretty format
            } catch (e) {
              logDebug('Could not parse JSON from body text, using raw content');
            }
          } else {
            // Normal handling
            code = element.value || element.innerHTML || element.textContent || '';
          }
          
          logDebug(`Unloaded content length: ${code.length} characters`);
          
          // Special handling for filename extraction in REST/SOAP interfaces
          let filename = 'unknown';
          if ((type.includes('json') || type.includes('xml') || 
               request.greeting === 'unloadJSON' || request.greeting === 'unloadXML') 
               && (isInterfaceWindow || window.location.href.includes('/admin/interfaceCatalogs/') || isRestAPIWindow)) {
            // Try to extract filename from URL - get the last path segment
            const urlPath = window.location.pathname;
            const pathSegments = urlPath.split('/').filter(segment => segment.length > 0);
            
            // Specifically extract the last path segment as the filename
            if (pathSegments.length > 0) {
              filename = pathSegments[pathSegments.length - 1];
              logDebug(`Extracted filename from last URL path segment: ${filename}`);
            } else {
              // For catalog page, try to extract from DOM
              const resourceNameElement = document.querySelector('a[name="display_resource"]');
              if (resourceNameElement) {
                filename = resourceNameElement.textContent.trim();
                logDebug(`Extracted filename from resource name element: ${filename}`);
              } else {
                filename = 'interface';
                logDebug("Could not extract filename from URL path or DOM, using default: interface");
              }
            }
          }
          
          // For header/footer HTML, match the exact response structure expected by popup.js
          if (type.includes('html')) {
            sendResponse({ 
              code: code,
              status: 'success'
            });
          } else if (type.includes('json') || type.includes('xml') || 
                    request.greeting === 'unloadJSON' || request.greeting === 'unloadXML') {
            sendResponse({ 
              code: code,
              filename: filename
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
        logDebug("Error processing rules list:", error);
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
    greeting.includes('XSL') ||
    greeting.includes('XML') ||
    greeting.includes('JSON') ||
    greeting === 'unloadJSON' ||
    greeting === 'loadJSON' ||
    greeting === 'unloadXML' ||
    greeting === 'loadXML'
  );
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
