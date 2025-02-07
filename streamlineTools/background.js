'use strict';

// Ensure extension is enabled on matching pages
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
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
        actions: [new chrome.declarativeContent.SetIcon({ path: "images/streamline48.png" })]
      }
    ]);
  });
});

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'unload_bml':
      unloadBML();
      break;
    case 'load_bml':
      loadBML();
      break;
    default:
      console.log(`Command ${command} not found`);
  }
});

function unloadBML() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        console.log("Executing UNLOAD BML...");
      }
    });

    // Show extension action (if needed)
    chrome.action.enable(tabId);
  });
}

function loadBML() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const tabId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        console.log("Executing LOAD BML...");
      }
    });
  });
}
