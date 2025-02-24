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
        popup: 'popup/popupHeaderFooter.html'
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
        popup: 'popup/popupHeaderFooter.html'
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
             // TODO: Implement actual BML loading/unloading logic
             console.log(`Executing ${isLoad ? 'LOAD' : 'UNLOAD'} BML...`);
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
