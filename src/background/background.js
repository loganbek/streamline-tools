'use strict';

// BACKGROUND_DEBUG FLAG
var BACKGROUND_DEBUG = true;

function logDebug(message, ...args) {
    if (BACKGROUND_DEBUG) {
        console.log("[BACKGROUND_DEBUG]", message, ...args);
    }
}

// NOTE: bigmachines.com/admin/ui/branding/edit_header_footer.jsp|bigmachines.com/admin/ui/branding/edit_site_branding.jsp
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
    if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/ui\/branding\/edit_header_footer\.jsp/.test(tab.url)) {
    chrome.action.setPopup({
      tabId: tabId,
      popup: 'popup/popupHeaderFooterHTML.html'
    });
    } else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/interfaceCatalogs\/list_ics_resources\.jsp/.test(tab.url)){
      chrome.action.setPopup({
        tabId: tabId,
        popup: 'popup/popupInterfacesSOAP.html'
      });
     } else if(tab.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/ui\/branding\/edit_site_branding\.jsp/.test(tab.url)){
        chrome.action.setPopup({
            tabId: tabId,
            popup: 'popup/popupStyleSheetsCSS.html'
        });
    }
    else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/document-designer/.test(tab.url)){
        chrome.action.setPopup({
            tabId: tabId,
            popup: 'popup/popupDocumentDesigner.html'
        });
    }
     else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\//.test(tab.url)) {
      chrome.action.setPopup({
        tabId: tabId,
        popup: 'popup/popup.html'
      });
    } else {
      console.log("Tab or tab.url is undefined");
    }
  }
});

// Also handle initial tab loading
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
//    if (tab && tab.url && tab.url.includes('bigmachines.com/admin/ui/branding/edit_header_footer.jsp')) {
    if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/ui\/branding\/edit_header_footer\.jsp/.test(tab.url)) {
      chrome.action.setPopup({
        tabId: activeInfo.tabId,
        popup: 'popup/popupHeaderFooterHTML.html'
      });
    } else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/interfaceCatalogs\/list_ics_resources\.jsp/.test(tab.url)){
        chrome.action.setPopup({
            tabId: activeInfo.tabId,
            popup: 'popup/popupInterfacesSOAP.html'
        });
    } else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/ui\/branding\/edit_site_branding\.jsp/.test(tab.url)){
        chrome.action.setPopup({
            tabId: activeInfo.tabId,
            popup: 'popup/popupStyleSheetsCSS.html'
        });
    } else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\/admin\/document-designer/.test(tab.url)){
      chrome.action.setPopup({
        tabId: activeInfo.tabId,
        popup: 'popup/popupDocumentDesigner.html'
      });
    }
    else if (tab?.url && /^https?:\/\/[^\/]*bigmachines\.com\//.test(tab.url)) {
        chrome.action.setPopup({
            tabId: activeInfo.tabId,
            popup: 'popup/popup.html'
        });
    } else {
      console.log("Tab or tab.url is undefined");
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

// Listen for messages from popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logDebug("Received message:", request);
    switch (request.greeting) {
        case 'loadBML':
            loadBML();
            break;
        case 'unloadBML':
            unloadBML();
            break;
        case 'loadTestBML':
            loadTestBML();
            break;
        case 'unloadTestBML':
            unloadTestBML();
            break;
        case 'loadHeadHTML':
            loadHeadHTML();
            break;
        case 'unloadHeaderHTML':
            unloadHeaderHTML();
            break;
        case 'loadFooterHTML':
            loadFooterHTML();
            break;
        case 'unloadFooterHTML':
            unloadFooterHTML();
            break;
        default:
            logDebug("Unknown message received:", request.greeting);
    }
});

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

//Implement unloadFooter
function unloadFooterHTML() {
    //get Footer HTML code from editor for unloading
    const code = Document.querySelector('textarea[name="footer"]').value;
    logDebug("Unloading Footer HTML code:", code);
    // Send the code back to the popup or wherever needed
    chrome.runtime.sendMessage({ greeting: "unloadFooterHTML", code: code }, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error unloading Footer HTML:", chrome.runtime.lastError);
        } else {
            logDebug("Footer HTML unloaded successfully:", response);
        }
    });
}

    


// Define loadBML and unloadBML functions
const loadBML = () => handleBML('load');
const unloadBML = () => handleBML('unload');
const loadTestBML = () => handleBML('loadTest');
const unloadTestBML = () => handleBML('unloadTest');
// const loadHeadHTML = () => handleHTML('loadHead');
// const unloadHeadHTML = () => handleHTML('unloadHead');
// const loadFooterHTML = () => handleHTML('loadFooter');
// const unloadFooterHTML = () => handleHTML('unloadFooter');
