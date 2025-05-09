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
  // Removed iteration-related state properties
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
    
    // Handle saveToDirectory action from popup.js
    if (request.action === 'saveToDirectory') {
        const { url, dirPath, filename, fullPath, overwrite } = request.data;
        
        logDebug("Saving file with directory structure:", {dirPath, filename, overwrite});
        
        // Format the path for Chrome downloads API
        // First strip any leading slashes to prevent issues
        let finalDirPath = dirPath.replace(/^\/+/, '');
        
        // Format the full path for download
        let downloadPath = finalDirPath ? `${finalDirPath}/${filename}` : filename;
        logDebug("Using download path:", downloadPath);
        
        chrome.downloads.download({
            url: url,
            filename: downloadPath,
            saveAs: false,
            conflictAction: overwrite ? 'overwrite' : 'uniquify' // Use 'overwrite' to force overwriting existing files
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                logDebug("Error saving file:", chrome.runtime.lastError);
                sendResponse({ 
                    success: false, 
                    error: chrome.runtime.lastError.message,
                    path: downloadPath
                });
            } else {
                logDebug("File saved successfully to:", downloadPath);
                
                // Optional: Try to show the download in the file manager
                try {
                    chrome.downloads.show(downloadId);
                } catch (e) {
                    logDebug("Could not show download in file manager:", e);
                }
                
                sendResponse({ 
                    success: true, 
                    downloadId: downloadId,
                    path: downloadPath
                });
            }
        });
        
        // Return true to indicate we'll send response asynchronously
        return true;
    }

    // Handle immediate responses
    if (request.type === 'ping' || request.greeting === 'ping') {
        sendResponse({ status: 'alive' });
        return true;
    }
    
    // Handle DOM snapshot saving
    if (request.action === 'saveDomSnapshot' && request.snapshot) {
        saveDomSnapshot(request.snapshot)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ 
                success: false, 
                error: error.toString() 
            }));
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
    logDebug("==== Setting dynamic popup for URL ====");
    logDebug("Tab ID:", tabId);
    logDebug("URL:", url);

    try {
        const rulesList = await fetchRulesList();
        logDebug(`Fetched ${rulesList.length} rules`);
        
        // Log all rules first for debugging purposes
        rulesList.forEach((rule, index) => {
            logDebug(`Rule ${index}: ${rule.RuleName}, URL pattern: ${rule.URL}, popup: ${rule.ui}`);
        });

        let matchFound = false;
        let allRulesDetails = [];
        
        // Check matching rules with detailed logging
        const matchingRule = rulesList.find(rule => {
            const ruleUrl = rule.URL.replace(/\*/g, ''); // Remove wildcard for comparison
            
            // Handle special URL cases for specific rule types
            let cleanedRuleUrl = ruleUrl;
            if (rule.opensNewWindow === "TRUE" && rule.newWindowURL !== "x") {
                const newWindowUrl = rule.newWindowURL.replace(/\*/g, '');
                cleanedRuleUrl = newWindowUrl;
                logDebug(`Rule uses newWindowURL: ${cleanedRuleUrl}`);
            } else if (rule.redirect === "TRUE" && rule.redirectURL !== "x") {
                const redirectUrl = rule.redirectURL.replace(/\*/g, '');
                cleanedRuleUrl = redirectUrl;
                logDebug(`Rule uses redirectURL: ${cleanedRuleUrl}`);
            }
            
            // Collect details for all rules for debugging
            const ruleDetail = {
                ruleName: rule.RuleName,
                ruleUrl: cleanedRuleUrl,
                ui: rule.ui
            };
            
            // Use the same URL matching logic EXACTLY as in popup.js
            try {
                const urlObj = new URL(url);
                const ruleUrlObj = new URL(cleanedRuleUrl.startsWith('http') ? cleanedRuleUrl : 'https://' + cleanedRuleUrl);
                
                // Add URL components to rule details
                ruleDetail.urlPathname = urlObj.pathname;
                ruleDetail.rulePathname = ruleUrlObj.pathname;
                ruleDetail.urlHostname = urlObj.hostname;
                ruleDetail.ruleHostname = ruleUrlObj.hostname;
                
                // EXACT same logic as popup.js - only check pathname
                const isMatch = urlObj.pathname.startsWith(ruleUrlObj.pathname);
                ruleDetail.isMatch = isMatch;
                
                if (isMatch) {
                    matchFound = true;
                    logDebug("✓ URL MATCH FOUND:", {
                      ruleName: rule.RuleName,
                      urlPathname: urlObj.pathname,
                      rulePathname: ruleUrlObj.pathname,
                      popupUI: rule.ui
                    });
                }
                
                allRulesDetails.push(ruleDetail);
                return isMatch;
                
            } catch (e) {
                logDebug(`URL parsing failed for rule ${rule.RuleName}:`, e);
                
                // Fallback to regex pattern if URL parsing fails
                const escapedPattern = cleanedRuleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${escapedPattern}\\/`);
                const isMatch = regex.test(url);
                
                ruleDetail.regex = regex.toString();
                ruleDetail.isMatch = isMatch;
                allRulesDetails.push(ruleDetail);
                
                if (isMatch) {
                    matchFound = true;
                    logDebug(`✓ URL REGEX MATCH FOUND: ${rule.RuleName}`);
                }
                
                return isMatch;
            }
        });

        // Log all rule matching attempts if no match was found
        if (!matchFound) {
            logDebug("NO MATCHING RULE FOUND. Detailed matching attempts:");
            allRulesDetails.forEach(detail => {
                logDebug(`Rule: ${detail.ruleName}`, detail);
            });
        }

        if (matchingRule) {
            let popupUrl = matchingRule.ui;
            logDebug(`Setting popup to: ${popupUrl}`);
            
            chrome.action.setPopup({
                tabId,
                popup: 'popup/' + popupUrl,
            });

            logDebug(`✓ POPUP SET SUCCESSFULLY to: popup/${popupUrl}`);
            
            // Verify the popup was set correctly
            chrome.action.getPopup({tabId}, (result) => {
                logDebug(`Popup verification - current popup is: ${result}`);
                if (result !== 'popup/' + popupUrl) {
                    logDebug(`⚠️ WARNING: Popup verification failed! Expected 'popup/${popupUrl}' but got '${result}'`);
                }
            });
        } else {
            logDebug("No matching rule found, setting default popup");
            chrome.action.setPopup({
                tabId,
                popup: 'popup/popup.html',
            });
            
            // Verify default popup was set
            chrome.action.getPopup({tabId}, (result) => {
                logDebug(`Default popup verification - current popup is: ${result}`);
                if (result !== 'popup/popup.html') {
                    logDebug(`⚠️ WARNING: Default popup verification failed! Expected 'popup/popup.html' but got '${result}'`);
                }
            });
        }
    } catch (error) {
        logDebug("❌ ERROR setting dynamic popup:", error);
    }
    
    logDebug("==== End of setDynamicPopup function ====");
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
    const isLoad = action.startsWith('load');
    logDebug(`Executing ${action}BML with${isLoad ? '' : 'out'} code...`);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            logDebug(`No active tabs found, exiting ${action}BML.`);
            return;
        }

        const tabId = tabs[0].id;
        logDebug("Found active tab with ID:", tabId);

        // For loading, we need to get the file content first
        if (isLoad) {
            loadFileWithPicker(tabId, action);
        } else {
            // For unloading, directly send the message to content script
            chrome.tabs.sendMessage(tabId, { greeting: action }, (response) => {
                handleUnloadResponse(response, action, tabId);
            });
        }
    });
}

/**
 * Handles loading a file using the File System Access API
 * @param {number} tabId - The tab ID to send the message to
 * @param {string} action - The action to perform ('load' or 'loadTest')
 * @param {function} callback - Optional callback function when operation completes
 */
async function loadFileWithPicker(tabId, action, callback) {
  try {
    // Use executeScript to run file picker in the tab context
    chrome.scripting.executeScript({
      target: { tabId },
      function: async () => {
        try {
          // Handle environments where showOpenFilePicker isn't available (e.g., tests)
          if (typeof window.showOpenFilePicker !== 'function') {
            console.warn('showOpenFilePicker not available, using fallback file input');
            return { error: 'FILE_PICKER_NOT_AVAILABLE' };
          }

          const [fileHandle] = await window.showOpenFilePicker();
          const file = await fileHandle.getFile();
          const content = await file.text();
          return { 
            content, 
            fileName: fileHandle.name,
            success: true
          };
        } catch (error) {
          console.error('Error in file picker:', error);
          
          // Handle user cancellation vs actual errors
          if (error.name === 'AbortError') {
            return { error: 'USER_CANCELLED' };
          }
          
          return { 
            error: error.message || 'Unknown error in file picker',
            errorName: error.name,
            errorStack: error.stack
          };
        }
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error executing script:', chrome.runtime.lastError);
        if (callback) callback(false);
        return;
      }

      const result = results?.[0]?.result;
      logDebug('File picker result:', result);

      if (result?.success && result.content) {
        // Send the file content to the content script
        chrome.tabs.sendMessage(tabId, { 
          greeting: action, 
          code: result.content 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(`Error sending message to tab ${tabId}:`, chrome.runtime.lastError);
            if (callback) callback(false);
          } else {
            logDebug(`${action} response:`, response);
            if (callback) callback(true);
          }
        });
      } else if (result?.error === 'FILE_PICKER_NOT_AVAILABLE') {
        // Fallback to input element for testing environments
        useFallbackFileInput(tabId, action, callback);
      } else if (result?.error === 'USER_CANCELLED') {
        logDebug('User cancelled file selection');
        if (callback) callback(false);
      } else {
        console.error('Error picking file:', result?.error || 'Unknown error');
        if (callback) callback(false);
      }
    });
  } catch (error) {
    console.error('Error in loadFileWithPicker:', error);
    if (callback) callback(false);
  }
}

/**
 * Fallback method using a file input element for environments without File System Access API
 * @param {number} tabId - The tab ID to send the message to
 * @param {string} action - The action to perform ('load' or 'loadTest')
 * @param {function} callback - Optional callback function when operation completes
 */
function useFallbackFileInput(tabId, action, callback) {
    chrome.scripting.executeScript({
        target: { tabId },
        function: (actionType) => {
            return new Promise((resolve) => {
                // Create and configure file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.bml,.js,.xsl,.css,.html,.json,.xml';
                fileInput.style.position = 'fixed';
                fileInput.style.top = '20px';
                fileInput.style.left = '20px';
                fileInput.style.zIndex = '9999';
                
                // Handle file selection
                fileInput.onchange = (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        resolve({ error: 'No file selected' });
                        document.body.removeChild(fileInput);
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        resolve({
                            content,
                            fileName: file.name,
                            success: true
                        });
                        document.body.removeChild(fileInput);
                    };
                    
                    reader.onerror = (error) => {
                        resolve({ error: error.message || 'Error reading file' });
                        document.body.removeChild(fileInput);
                    };
                    
                    reader.readAsText(file);
                };
                
                // Handle cancellation
                const cleanup = () => {
                    if (document.body.contains(fileInput)) {
                        document.body.removeChild(fileInput);
                        resolve({ error: 'USER_CANCELLED' });
                    }
                };
                
                // Add timeout for auto-removal
                setTimeout(() => cleanup(), 30000);
                
                // Add to DOM and trigger click
                document.body.appendChild(fileInput);
                fileInput.click();
            });
        },
        args: [action]
    }, (results) => {
        if (chrome.runtime.lastError) {
            console.error('Error executing script:', chrome.runtime.lastError);
            if (callback) callback(false);
            return;
        }

        const result = results?.[0]?.result;
        if (result?.success && result.content) {
            chrome.tabs.sendMessage(tabId, { 
                greeting: action, 
                code: result.content 
            }, (response) => {
                logDebug(`${action} response with fallback:`, response);
                if (callback) callback(true);
            });
        } else {
            logDebug('Fallback file input result:', result);
            if (callback) callback(false);
        }
    });
}

/**
 * Handle the response from unload operations
 * @param {Object} response - The response from the content script
 * @param {string} action - The action that was performed
 * @param {number} tabId - The tab ID
 */
function handleUnloadResponse(response, action, tabId) {
    if (chrome.runtime.lastError) {
        console.error(`Error in ${action}:`, chrome.runtime.lastError);
        return;
    }

    logDebug(`${action} response:`, response);
    
    // Check if the response is valid
    if (!response || response.error) {
        console.error(`Error in ${action}:`, response?.error || 'No response');
        return;
    }
    
    // For tests, ensure we have a valid filename
    if (!response.filename && action.includes('Test')) {
        // Generate a default test filename if none provided
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        response.filename = `test-script-${timestamp}.bml`;
        logDebug(`Generated default test filename: ${response.filename}`);
    }
    
    // Save the unloaded code to a file
    if (response.code) {
        downloadTextFile(response.code, response.filename || 'bml_code.bml');
        
        // Enable extension if needed
        chrome.action.enable(tabId);
        logDebug("Extension action enabled for tab:", tabId);
    }
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
          headerType: action.toLowerCase().includes('head') ? 'header' : 'footer',
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

/**
 * Downloads text content as a file
 * @param {string} content - The text content to save
 * @param {string} filename - The name to give the file
 */
function downloadTextFile(content, filename) {
  try {
    // Ensure consistent newline handling
    // First normalize Windows style to Unix style
    content = content.replace(/\r\n/g, '\n');
    
    // Log the number of newlines for debugging
    const newlineCount = (content.match(/\n/g) || []).length;
    logDebug(`Saving file with ${newlineCount} newlines`);
    
    // Create a blob from the text content with proper line endings
    // We use the native line endings of the platform here
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create object URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename || 'download.txt';
    
    // Append to the document temporarily
    document.body.appendChild(downloadLink);
    
    // Programmatically click the link to trigger download
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    logDebug(`File "${filename}" created for download`);
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
}

/**
 * Saves a DOM snapshot to a file
 * @param {Object} snapshot - The DOM snapshot object from content script
 * @returns {Promise<Object>} Result with success status and filename
 */
async function saveDomSnapshot(snapshot) {
  try {
    logDebug("Saving DOM snapshot:", snapshot.metadata);
    
    // Create a unique filename with timestamp and area name
    const timestamp = snapshot.metadata?.timestamp || new Date().toISOString();
    const formattedTimestamp = timestamp.replace(/:/g, '-').replace(/\./g, '-');
    const areaName = (snapshot.metadata?.areaName || 'unknown').replace(/[^\w-]/g, '_');
    const filenamePrefix = snapshot.metadata?.location?.path ? 
      snapshot.metadata.location.path.replace(/\//g, '_').replace(/[^\w-]/g, '_') : 
      'page';
      
    const filename = `dom-snapshot-${filenamePrefix}-${areaName}-${formattedTimestamp}`;
    
    // Create two files: one for the HTML and one for the metadata/structure
    
    // 1. Save the full HTML content
    const htmlFilename = `${filename}.html`;
    const htmlContent = snapshot.htmlContent || '<html><body><h1>HTML content not available</h1></html>';
    downloadTextFile(htmlContent, htmlFilename);
    
    // 2. Save the structured metadata as JSON
    // Remove the full HTML content from the JSON to keep file size reasonable
    const jsonSnapshot = { ...snapshot };
    delete jsonSnapshot.htmlContent;
    
    const jsonFilename = `${filename}.json`;
    const jsonContent = JSON.stringify(jsonSnapshot, null, 2);
    downloadTextFile(jsonContent, jsonFilename);
    
    logDebug(`DOM snapshot saved as ${htmlFilename} and ${jsonFilename}`);
    return { 
      success: true, 
      filename: htmlFilename,
      jsonFilename: jsonFilename
    };
  } catch (error) {
    console.error("Error saving DOM snapshot:", error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}
