'use strict';

// BACKGROUND_DEBUG FLAG
const BACKGROUND_DEBUG = true;

function logDebug(message, ...args) {
    if (BACKGROUND_DEBUG) {
        console.log("[BACKGROUND_DEBUG]", message, ...args);
    }
}

// Listen for messages from popup.js and handle them synchronously
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logDebug("Received message from popup.js:", request);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            logDebug("No active tabs found, cannot forward message to content.js.");
            sendResponse({ success: false, error: "No active tabs found." });
            return;
        }

        const activeTabId = tabs[0].id;

        // Forward the message to content.js and wait for a response
        chrome.tabs.sendMessage(activeTabId, request, (response) => {
            if (chrome.runtime.lastError) {
                logDebug("Error forwarding message to content.js:", chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                logDebug("Response from content.js:", response);
                sendResponse(response);
            }
        });
    });

    // Return true to indicate asynchronous response
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
            logDebug("ruleUrl:", ruleUrl);
            logDebug("rule:", rule);
            let cleanedRuleUrl = cleanUrlParameters(ruleUrl); // Clean up URL parameters
            
            if (rule.opensNewWindow === "TRUE" && rule.newWindowURL !== "x") {
                const newWindowUrl = rule.newWindowURL.replace(/\*/g, ''); // Remove wildcard for comparison
                cleanedRuleUrl = cleanUrlParameters(newWindowUrl); // Clean up URL parameters
            } else if (rule.redirect === "TRUE" && rule.redirectURL !== "x") {
                const redirectUrl = rule.redirectURL.replace(/\*/g, ''); // Remove wildcard for comparison
                cleanedRuleUrl = cleanUrlParameters(redirectUrl); // Clean up URL parameters
            }
            logDebug("ruleUrl:", ruleUrl);
            logDebug("cleanedRuleUrl:", cleanedRuleUrl);
            
            // More secure URL matching using URL object
            try {
                const urlObj = new URL(url);
                const ruleUrlObj = new URL(cleanedRuleUrl);
                // Check hostname and path more securely
                return urlObj.hostname.includes(ruleUrlObj.hostname) &&
                       urlObj.pathname.startsWith(ruleUrlObj.pathname);
            } catch (e) {
                // Fallback with safer string check
                return url.includes(cleanedRuleUrl);
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
        const urlObj = new URL(url);
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

// Function to handle BML actions
function handleBML(action) {
 const isLoad = action === 'load';
 logDebug(`Executing ${action}BML...`);
 
 chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
     if (tabs.length === 0) {
         logDebug(`No active tabs found, exiting ${action}BML.`);
         return;
     }

     const tabId = tabs[0].id;
     logDebug("Found active tab with ID:", tabId);

     chrome.scripting.executeScript({
         target: { tabId: tabId },
         func: (isLoad) => {
             console.log(`Executing ${isLoad ? 'LOAD' : 'UNLOAD'} BML...`);
             
             // Send message to content script to handle BML loading/unloading
             chrome.runtime.sendMessage({
                 greeting: isLoad ? "load" : "unload"
             });
             
             // Trigger the appropriate action based on whether we're loading or unloading
             if (isLoad) {
                 // For loading BML, we need to get the code from storage and load it
                 chrome.storage.local.get(['currentBML'], function(result) {
                     try {
                         if (result.currentBML) {
                             chrome.tabs.sendMessage(tabId, {
                                 greeting: "load",
                                 code: result.currentBML
                             }, function() {
                                 if (chrome.runtime.lastError) {
                                     console.error("Error loading BML:", chrome.runtime.lastError);
                                 }
                             });
                         } else {
                             console.warn("No BML code found in storage to load");
                         }
                     } catch (error) {
                         console.error("Error in BML loading process:", error);
                     }
                 });
             } else {
                 // For unloading BML, we need to get the code from the editor and save it
                 chrome.tabs.sendMessage(tabId, { greeting: "unload" }, function() {
                     if (chrome.runtime.lastError) {
                         console.error("Error unloading BML:", chrome.runtime.lastError);
                         return;
                     }
                 });
             }
         },
         args: [isLoad]
     });

     logDebug(`Script injected to ${action} BML.`);
     if (!isLoad) {
         chrome.action.enable(tabId);
         logDebug("Extension action enabled for tab:", tabId);
     }
 });
}

// Function to handle HTML actions
function handleHTML(action) {
 const isLoad = action === 'load';
 logDebug(`Executing ${action}HTML...`);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
          logDebug(`No active tabs found, exiting ${action}HTML.`);
          return;
      }

      const tabId = tabs[0].id;
      logDebug("Found active tab with ID:", tabId);

      chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (isLoad) => {
          // TODO: Implement actual HTML loading/unloading logic
          console.log(`Executing ${isLoad ? 'LOAD' : 'UNLOAD'} HTML...`);
          },
          args: [isLoad]
      });

      logDebug(`Script injected to ${action} HTML.`);
      if (!isLoad) {
          chrome.action.enable(tabId);
          logDebug("Extension action enabled for tab:", tabId);
      }
  });
}

// Implement unloadHeadHTML function
function unloadHeaderHTML() {
    //get Head HTML code from editor for unloading
    const code = Document.querySelector('textarea[name="header"]').value;
    logDebug("Unloading Head HTML code:", code);
    // Send the code back to the popup or wherever needed
    chrome.runtime.sendMessage({ greeting: "unloadHeadHTML", code: code }, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error unloading Head HTML:", chrome.runtime.lastError);
        } else {
            logDebug("Head HTML unloaded successfully:", response);
        }
    });
}

function unloadFooterHTML() {
    // Background script can't access page DOM - need to message the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            logDebug("No active tabs found, can't unload footer HTML.");
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unloadFooterHTML" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error getting footer HTML:", chrome.runtime.lastError);
                return;
            }
            
            if (response?.code) {
                logDebug("Unloading Footer HTML code:", response.code);
                chrome.runtime.sendMessage({ greeting: "unloadFooterHTML", code: response.code });
            }
        });
    });
}

// Define loadBML and unloadBML functions
const loadBML = () => handleBML('load');
const unloadBML = () => handleBML('unload');
const loadTestBML = () => handleBML('loadTest');
const unloadTestBML = () => handleBML('unloadTest');
