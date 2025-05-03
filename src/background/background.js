'use strict';

// BACKGROUND_DEBUG FLAG
const BACKGROUND_DEBUG = true;

function logDebug(message, ...args) {
    if (BACKGROUND_DEBUG) {
        console.log("[BACKGROUND_DEBUG]", message, ...args);
    }
}

// Add to the top with other state management
const state = {
  isIterating: false,
  iterationCount: 0,
  lastIterationTime: null
};

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    logDebug("Extension started");
    initializeExtension();
});

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    logDebug("Extension installed/updated:", details.reason);
    initializeExtension();
});

function initializeExtension() {
    // Clear any stale state
    chrome.storage.local.get(null, (items) => {
        const staleKeys = ['currentBML', 'lastError'];
        for (const key of staleKeys) {
            if (key in items) {
                chrome.storage.local.remove(key);
            }
        }
    });
}

// Listen for messages from popup.js with enhanced error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logDebug("Received message:", request);
    
    // Handle immediate responses
    if (request.type === 'ping' || request.greeting === 'ping') {
        sendResponse({ status: 'alive' });
        return true;
    }

    // Handle iteration
    if (request.type === 'iterate') {
        handleIteration();
        sendResponse({ success: true });
        return true;
    }
    
    // Handle specialized HTML functions for the demo
    if (request.greeting === 'unloadHeaderHTML') {
        unloadHeaderHTML();
        sendResponse({ success: true });
        return true;
    }
    
    if (request.greeting === 'unloadFooterHTML') {
        unloadFooterHTML();
        sendResponse({ success: true });
        return true;
    }
    
    if (request.greeting === 'loadHeaderHTML' || request.greeting === 'loadFooterHTML') {
        const isHeader = request.greeting === 'loadHeaderHTML';
        handleHTML(isHeader ? 'Header' : 'Footer', request.code);
        sendResponse({ success: true });
        return true;
    }

    // Handle XSL operations
    if (request.greeting === 'unloadGlobalXSL') {
        sendResponse({ success: true, code: "<!-- XSL content would be here -->" });
        return true;
    }
    
    if (request.greeting === 'loadGlobalXSL') {
        sendResponse({ success: true });
        return true;
    }
    
    if (request.greeting === 'unloadXSL') {
        sendResponse({ success: true, code: "<!-- XSL content would be here -->" });
        return true;
    }
    
    if (request.greeting === 'loadXSL') {
        sendResponse({ success: true });
        return true;
    }

    // Handle messages that need to be forwarded to content scripts
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs.length) {
            const error = "No active tab found";
            logDebug(error);
            sendResponse({ success: false, error });
            return;
        }

        const activeTab = tabs[0];
        
        try {
            // Attempt to send message to content script
            const response = await chrome.tabs.sendMessage(activeTab.id, request);
            logDebug("Content script response:", response);
            sendResponse({ success: true, data: response });
        } catch (error) {
            // Handle various error cases
            if (error.message.includes('receiving end does not exist')) {
                // Content script not ready/injected - retry once
                setTimeout(async () => {
                    try {
                        const retryResponse = await chrome.tabs.sendMessage(activeTab.id, request);
                        sendResponse({ success: true, data: retryResponse });
                    } catch (retryError) {
                        logDebug("Retry failed:", retryError);
                        sendResponse({ success: false, error: retryError.message });
                    }
                }, 1000);
            } else {
                logDebug("Error handling message:", error);
                sendResponse({ success: false, error: error.message });
            }
        }
    });

    // Return true to indicate we'll send response asynchronously
    return true;
});

// Update popup dynamically based on active tab's URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        setDynamicPopup(tabId, changeInfo.url);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab?.url) {
            setDynamicPopup(activeInfo.tabId, tab.url);
        }
    });
});

/**
 * Dynamically set the popup based on the active tab's URL.
 * @param {number} tabId - The ID of the active tab.
 * @param {string} url - The URL of the active tab.
 */
async function setDynamicPopup(tabId, url) {
    logDebug("Setting dynamic popup for URL:", url);

    try {
        const rulesList = await fetchRulesList();
        const matchingRule = rulesList.find(rule => {
            const ruleUrl = rule.URL.replace(/\*/g, ''); // Remove wildcard for comparison
            
            // Handle special URL cases for specific rule types
            let cleanedRuleUrl = ruleUrl;
            if (rule.opensNewWindow === "TRUE" && rule.newWindowURL !== "x") {
                const newWindowUrl = rule.newWindowURL.replace(/\*/g, '');
                cleanedRuleUrl = newWindowUrl;
            } else if (rule.redirect === "TRUE" && rule.redirectURL !== "x") {
                const redirectUrl = rule.redirectURL.replace(/\*/g, '');
                cleanedRuleUrl = redirectUrl;
            }
            
            logDebug("Matching URL against rule:", {
              url: url,
              ruleUrl: cleanedRuleUrl
            });
            
            // Use the same URL matching logic as popup.js and content.js
            try {
                const urlObj = new URL(url);
                const ruleUrlObj = new URL(cleanedRuleUrl.startsWith('http') ? cleanedRuleUrl : 'https://' + cleanedRuleUrl);
                
                // Compare hostname and path parts more securely
                const hostMatch = 
                    urlObj.hostname === ruleUrlObj.hostname ||
                    urlObj.hostname.endsWith('.' + ruleUrlObj.hostname);
                
                // Must match BOTH host AND path to be considered a match
                const pathMatch = urlObj.pathname.startsWith(ruleUrlObj.pathname);
                const isMatch = hostMatch && pathMatch;
                
                if (isMatch) {
                    logDebug("URL match found:", {
                      urlHostname: urlObj.hostname,
                      ruleHostname: ruleUrlObj.hostname,
                      urlPath: urlObj.pathname,
                      rulePath: ruleUrlObj.pathname
                    });
                }
                
                return isMatch;
            } catch (e) {
                logDebug("URL parsing failed, falling back to regex:", e);
                // Fallback to a safer regex pattern if URL parsing fails
                const escapedPattern = cleanedRuleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${escapedPattern}\\/`);
                return regex.test(url);
            }
        });

        if (matchingRule) {
            let popupUrl = matchingRule.ui;
            chrome.action.setPopup({
                tabId,
                popup: 'popup/' + popupUrl,
            });

            logDebug("Popup set to:", popupUrl);
        } else {
            chrome.action.setPopup({
                tabId,
                popup: 'popup/popup.html',
            });

            logDebug("Popup set to default:", 'popup/popup.html');
        }
    } catch (error) {
        logDebug("Error setting dynamic popup:", error);
    }
}

/**
 * Cleans up URL parameters by removing unnecessary query parameters for matching.
 * @param {string} url - The URL to clean.
 * @returns {string} The cleaned URL.
 */
function cleanUrlParameters(url) {
    try {
        logDebug("Cleaning URL parameters for:", url);
        // Add protocol if missing
        let urlWithProtocol = url;
        if (url.startsWith('*.') || url.startsWith('.')) {
            urlWithProtocol = 'https://' + url.replace(/^\*\.?/, '');
        } else if (!url.match(/^[a-zA-Z]+:\/\//)) {
            urlWithProtocol = 'https://' + url;
        }
        
        const urlObj = new URL(urlWithProtocol);
        const allowedParams = ['rule_id', 'rule_type', 'pline_id', 'segment_id', 'model_id', 'fromList'];
        const cleanedSearchParams = new URLSearchParams();

        for (const [key, value] of urlObj.searchParams.entries()) {
            if (allowedParams.includes(key)) {
                cleanedSearchParams.append(key, value);
            }
        }

        urlObj.search = cleanedSearchParams.toString();
        return urlObj.toString();
    } catch (error) {
        logDebug("Error cleaning URL parameters:", error);
        return url;
    }
}

/**
 * Fetch rule configurations from rulesList.json.
 * @returns {Promise<Object[]>} The parsed rules list.
 */
async function fetchRulesList() {
    try {
        const response = await fetch(chrome.runtime.getURL('rulesList.json'));
        if (!response.ok) {
            throw new Error(`Failed to fetch rulesList.json: ${response.status} ${response.statusText}`);
        }
        logDebug("Fetched rulesList.json successfully:", response);
        // Check if the response is valid JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid JSON response from rulesList.json");
        }
        return await response.json();
    } catch (error) {
        logDebug("Error fetching rulesList.json:", error);
        return []; // Return an empty array to prevent further errors
    }
}

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
    logDebug("Received command:", command);
    switch (command) {
        case 'unload_bml':
            logDebug("Calling unloadBML function.");
            unloadBML();
            break;
        case 'load_bml':
            logDebug("Calling loadBML function.");
            loadBML();
            break;
        default:
            logDebug(`Command ${command} not recognized.`);
    }
});

// Improved BML handling function
function handleBML(action) {
    const isLoad = action === 'load';
    logDebug(`Executing ${action}BML...`);

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs.length) {
            logDebug(`No active tabs found, exiting ${action}BML.`);
            return;
        }

        const tabId = tabs[0].id;

        try {
            if (isLoad) {
                const storage = await chrome.storage.local.get(['currentBML']);
                if (!storage.currentBML) {
                    throw new Error('No BML code found in storage');
                }
                
                await chrome.tabs.sendMessage(tabId, {
                    greeting: "load",
                    code: storage.currentBML
                });
            } else {
                await chrome.tabs.sendMessage(tabId, { greeting: "unload" });
                chrome.action.enable(tabId);
            }
            
            logDebug(`${action}BML completed successfully`);
        } catch (error) {
            logDebug(`Error in ${action}BML:`, error);
            // Store last error for debugging
            chrome.storage.local.set({ lastError: error.message });
        }
    });
}

// Function to handle HTML actions
function handleHTML(action, code) {
 const isLoad = action.startsWith('load');
 logDebug(`Executing ${action}HTML with${isLoad ? '' : 'out'} code...`);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
          logDebug(`No active tabs found, exiting ${action}HTML.`);
          return;
      }

      const tabId = tabs[0].id;
      logDebug("Found active tab with ID:", tabId);

      // Send appropriate message to content script based on action
      chrome.tabs.sendMessage(tabId, {
          greeting: isLoad ? `load${action}HTML` : `unload${action}HTML`,
          type: action.includes('Head') ? 'header' : 'footer',
          code: code
      }, (response) => {
          if (chrome.runtime.lastError) {
              console.error(`Error ${isLoad ? 'loading' : 'unloading'} HTML:`, chrome.runtime.lastError);
              return;
          }
          logDebug(`HTML ${isLoad ? 'loaded' : 'unloaded'} successfully:`, response);
      });

      logDebug(`Message sent to content script to ${action} HTML.`);
      if (!isLoad) {
          chrome.action.enable(tabId);
          logDebug("Extension action enabled for tab:", tabId);
      }
  });
}

// Implement unloadHeadHTML function with hardcoded values for demo purposes
function unloadHeaderHTML() {
    logDebug("Unloading Header HTML with hardcoded data for demo");
    // Hardcoded header HTML for demo purposes
    const headerHtmlDemo = `<!-- Demo Header HTML -->
<div class="header-container">
    <div class="logo">
        <img src="https://example.com/logo.png" alt="Company Logo">
    </div>
    <div class="header-title">
        <h1>Oracle CPQ Configuration Portal</h1>
        <p>Welcome to our product configuration system</p>
    </div>
    <div class="user-info">
        <span class="username">Demo User</span>
        <a href="#" class="logout-btn">Logout</a>
    </div>
</div>`;
    
    // Send the hardcoded header to popup
    chrome.runtime.sendMessage({ 
        greeting: "unloadHeaderHTML", 
        code: headerHtmlDemo,
        filename: "demo_header.html" 
    });
}

function unloadFooterHTML() {
    logDebug("Unloading Footer HTML with hardcoded data for demo");
    // Hardcoded footer HTML for demo purposes
    const footerHtmlDemo = `<!-- Demo Footer HTML -->
<div class="footer-container">
    <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact Support</a>
    </div>
    <div class="copyright">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
    </div>
    <div class="footer-logo">
        <img src="https://example.com/small-logo.png" alt="Small Logo">
    </div>
</div>`;
    
    // Send the hardcoded footer to popup
    chrome.runtime.sendMessage({ 
        greeting: "unloadFooterHTML", 
        code: footerHtmlDemo,
        filename: "demo_footer.html" 
    });
}

// Define loadBML and unloadBML functions
const loadBML = () => handleBML('load');
const unloadBML = () => handleBML('unload');
const loadTestBML = () => handleBML('loadTest');
const unloadTestBML = () => handleBML('unloadTest');

// Add new function for iteration management
function handleIteration() {
  logDebug("Handling iteration");
  
  // Query active tab to check iteration state
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs.length) {
      logDebug("No active tab found for iteration");
      return;
    }

    try {
      // Check current iteration state
      const response = await chrome.tabs.sendMessage(tabs[0].id, { greeting: 'checkIteration' });
      
      if (response.isIterating) {
        logDebug("Already iterating, count:", response.iterationCount);
        return;
      }

      // Start new iteration
      state.isIterating = true;
      state.iterationCount++;
      state.lastIterationTime = Date.now();
      
      await chrome.tabs.sendMessage(tabs[0].id, { 
        greeting: 'startIteration',
        iterationCount: state.iterationCount
      });
      
      // Perform iteration logic
      await handleBML('unload');
      await handleBML('load');
      
      // End iteration
      state.isIterating = false;
      await chrome.tabs.sendMessage(tabs[0].id, { greeting: 'endIteration' });
      
    } catch (error) {
      logDebug("Error during iteration:", error);
      state.isIterating = false;
    }
  });
}
