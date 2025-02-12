'use strict';

// BACKGROUND_DEBUG FLAG
var BACKGROUND_DEBUG = false;

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

function unloadBML() {
    logDebug("Executing unloadBML...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            logDebug("No active tabs found, exiting unloadBML.");
            return;
        }

        const tabId = tabs[0].id;
        logDebug("Found active tab with ID:", tabId);

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                console.log("Executing UNLOAD BML...");
            }
        });

        logDebug("Script injected to unload BML.");
        chrome.action.enable(tabId);
        logDebug("Extension action enabled for tab:", tabId);
    });
}

function loadBML() {
    logDebug("Executing loadBML...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            logDebug("No active tabs found, exiting loadBML.");
            return;
        }

        const tabId = tabs[0].id;
        logDebug("Found active tab with ID:", tabId);

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                console.log("Executing LOAD BML...");
            }
        });

        logDebug("Script injected to load BML.");
    });
}
