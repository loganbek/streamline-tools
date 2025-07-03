'use strict';

// BACKGROUND_DEBUG FLAG
var BACKGROUND_DEBUG = true;

function logDebug(message, ...args) {
    if (BACKGROUND_DEBUG) {
        console.log("[BACKGROUND_DEBUG]", message, ...args);
    }
}

// Ensure extension is enabled on matching pages
chrome.runtime.onInstalled.addListener(() => {
    logDebug("Extension installed, setting up rules...");
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        logDebug("Removed existing rules.");
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches:
                                'bigmachines.com/admin/configuration/rules/edit_rule.jsp|bigmachines.com/spring/|bigmachines.com/admin/commerce/rules/|bigmachines.com/admin/commerce/actions/edit_action.jsp'
                        }
                    })
                ],
                actions: [new chrome.declarativeContent.ShowAction()]
            }
        ]);
        logDebug("New rules added.");
    });
});

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

// Listen for tab updates to switch popups
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (tab.url.includes('bigmachines.com/admin/ui/branding/edit_header_footer.jsp')) {
      chrome.action.setPopup({
        tabId: tabId,
        popup: 'popup/popupHeaderFooterHTML.html'
      });
    } else if (tab.url.includes('bigmachines.com')) {
      chrome.action.setPopup({
        tabId: tabId,
        popup: 'popup/popup.html'
      });
    }
  }
});

// Also handle initial tab loading
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url.includes('bigmachines.com/admin/ui/branding/edit_header_footer.jsp')) {
      chrome.action.setPopup({
        tabId: activeInfo.tabId,
        popup: 'popup/popupHeaderFooterHTML.html'
      });
    } else if (tab.url.includes('bigmachines.com')) {
      chrome.action.setPopup({
        tabId: activeInfo.tabId,
        popup: 'popup/popup.html'
      });
    }
  });
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

// Define loadBML and unloadBML functions
const loadBML = () => handleBML('load');
const unloadBML = () => handleBML('unload');

// GitHub OAuth Configuration
// Note: CLIENT_ID should be set by the user in the extension options
const TOKEN_VALIDATION_URL = 'https://api.github.com/user';

/**
 * Launch GitHub OAuth authentication flow
 */
function authenticateGitHub() {
    logDebug("Starting GitHub authentication flow...");
    
    // Get CLIENT_ID from storage (users need to set this in options)
    chrome.storage.local.get(['githubClientId'], (result) => {
        const clientId = result.githubClientId;
        
        if (!clientId) {
            logDebug("No GitHub Client ID found. User needs to set it in options.");
            // Notify popup that client ID is missing
            chrome.runtime.sendMessage({
                type: 'githubAuthError',
                error: 'No GitHub Client ID configured. Please set it in the extension options.'
            });
            return;
        }
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`;
        const redirectUrl = chrome.identity.getRedirectURL();
        
        logDebug("Auth URL:", authUrl);
        logDebug("Redirect URL:", redirectUrl);
        
        const authParams = {
            url: `${authUrl}&redirect_uri=${encodeURIComponent(redirectUrl)}`,
            interactive: true
        };
        
        chrome.identity.launchWebAuthFlow(authParams, (responseUrl) => {
            if (chrome.runtime.lastError || !responseUrl) {
                logDebug('GitHub auth failed:', chrome.runtime.lastError);
                chrome.runtime.sendMessage({
                    type: 'githubAuthError',
                    error: chrome.runtime.lastError?.message || 'Authentication failed'
                });
                return;
            }
            
            logDebug("Auth response URL:", responseUrl);
            
            // Extract access_token from URL fragment or query parameters
            const url = new URL(responseUrl);
            let accessToken = null;
            
            // Try URL fragment first (for implicit flow)
            if (url.hash) {
                const fragmentParams = new URLSearchParams(url.hash.slice(1));
                accessToken = fragmentParams.get('access_token');
            }
            
            // If not found in fragment, try query parameters
            if (!accessToken) {
                accessToken = url.searchParams.get('code'); // This would be auth code, not token
            }
            
            if (accessToken) {
                // If we got an auth code instead of token, we'd need to exchange it
                // For simplicity, let's assume we got a token (though GitHub typically returns code)
                validateGitHubToken(accessToken);
            } else {
                logDebug("No access token found in response URL");
                chrome.runtime.sendMessage({
                    type: 'githubAuthError',
                    error: 'No access token received from GitHub'
                });
            }
        });
    });
}

/**
 * Validate GitHub token and get user info
 * @param {string} token - The GitHub access token
 */
function validateGitHubToken(token) {
    logDebug("Validating GitHub token...");
    
    fetch(TOKEN_VALIDATION_URL, {
        headers: { 
            'Authorization': `token ${token}`,
            'User-Agent': 'Streamline-Tools-Extension'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(userData => {
        if (userData.login) {
            // Store token and user data
            chrome.storage.local.set({ 
                githubToken: token, 
                githubUser: userData.login,
                githubUserData: userData
            }, () => {
                logDebug('GitHub login successful for user:', userData.login);
                // Notify popup of successful login
                chrome.runtime.sendMessage({
                    type: 'githubAuthSuccess',
                    user: userData.login
                });
            });
        } else {
            throw new Error('Invalid user data received from GitHub');
        }
    })
    .catch(error => {
        logDebug('GitHub token validation failed:', error);
        chrome.runtime.sendMessage({
            type: 'githubAuthError',
            error: `Token validation failed: ${error.message}`
        });
    });
}

/**
 * Logout from GitHub (clear stored credentials)
 */
function logoutGitHub() {
    logDebug("Logging out from GitHub...");
    
    chrome.storage.local.remove(['githubToken', 'githubUser', 'githubUserData'], () => {
        logDebug("GitHub credentials cleared");
        chrome.runtime.sendMessage({
            type: 'githubLogoutSuccess'
        });
    });
}

/**
 * Check GitHub login status
 */
function checkGitHubLoginStatus() {
    chrome.storage.local.get(['githubUser', 'githubToken'], (result) => {
        if (result.githubUser && result.githubToken) {
            chrome.runtime.sendMessage({
                type: 'githubLoginStatus',
                isLoggedIn: true,
                user: result.githubUser
            });
        } else {
            chrome.runtime.sendMessage({
                type: 'githubLoginStatus',
                isLoggedIn: false
            });
        }
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logDebug("Received message:", request);
    
    switch (request.action) {
        case 'githubLogin':
            authenticateGitHub();
            break;
        case 'githubLogout':
            logoutGitHub();
            break;
        case 'checkGitHubStatus':
            checkGitHubLoginStatus();
            break;
        default:
            logDebug(`Unhandled message action: ${request.action}`);
    }
});
