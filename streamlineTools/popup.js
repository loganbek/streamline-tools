// POPUP_DEBUG FLAG
const POPUP_DEBUG = false;

function logDebug(message, ...args) {
    if (POPUP_DEBUG) {
        console.log("[POPUP_DEBUG]", message, ...args);
    }
}

'use strict'

// VARS
let bmSiteSubDomain
let bmSiteType

// BUTTONS
const unloadButton = document.getElementById('unload')
const loadButton = document.getElementById('load')
const unloadTestButton = document.getElementById('unloadTest')
const loadTestButton = document.getElementById('loadTest')
const optionsButton = document.getElementById('options')
const logsButton = document.getElementById('logs')

logDebug("Initializing extension...");

// CHROME TABS
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    logDebug("chrome.tabs.query executed", tabs);
    
    const tab = tabs[0]
    const url = tab.url
    logDebug("Active tab URL:", url);

    const full = url
    const parts = full.split('.')
    const sub = parts[0]
    const domain = parts[1]
    const type = parts[2]

    const bmSiteParts = sub.split('//')
    const bmSite = bmSiteParts[1]
    
    bmSiteSubDomain = bmSite
    bmSiteType = 'commerce'
    
    logDebug("Extracted subdomain:", bmSiteSubDomain);
    logDebug("Extracted domain:", domain);
    logDebug("Extracted type:", type);

    if (url !== undefined) {
        if (
            url.includes('bigmachines.com/admin/commerce/rules') ||
            url.includes('bigmachines.com/admin/configuration/rules') ||
            url.includes('bigmachines.com/admin/commerce/actions')
        ) {
            unloadTestButton.disabled = true
            loadTestButton.disabled = true
            logDebug("Test buttons disabled due to matching admin commerce rules URL.");
        }
        
        if (url.includes('bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp')) {
            logDebug("Executing content script: adminCommerceActionsContent.js");
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['adminCommerceActionsContent.js'],
            });
        } else if (url.includes('bigmachines.com/admin/commerce/rules')) {
            logDebug("Executing content script: adminCommerceRulesContent.js");
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['adminCommerceRulesContent.js'],
            });
        } else if (url.includes('bigmachines.com/admin/configuration/rules')) {
            bmSiteType = 'configuration';
            logDebug("Folder Type:", bmSiteType);
            logDebug("Executing content script: adminConfigContent.js");
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['adminConfigContent.js'],
            });
        }
    }

    if (url.includes('bigmachines.com/spring/')) {
        logDebug("Sending message to content script for filename retrieval.");
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'filename' }, function (response) {
            if (response !== undefined) {
                logDebug("Received filename from content script:", response.filename);
                fileName = response.filename;
            }
        });

        logDebug("Executing content script: content.js");
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js'],
        });
    }
});

chrome.downloads.setShelfEnabled(true)
logDebug("Downloads shelf enabled.");

// EXTERNAL LOG LINKING
logsButton.disabled = true
logDebug("Logs button disabled.");

// DOWNLOAD FILENAME HANDLING
chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
    logDebug("Download detected, setting filename, subdomain, and site type:", item.filename, bmSiteSubDomain, bmSiteType);
    logDebug("item", item);
    logDebug("suggest", suggest);
    suggest({
        filename: 'bigmachines/' + bmSiteSubDomain + '/' + bmSiteType + '/' + item.filename,
        conflictAction: 'overwrite'
    });
});

// UNLOAD ONCLICK
unloadButton.onclick = function () {
    logDebug("Unload button clicked.");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unload' }, function (response) {
            if (response.code && response.filename) {
                if( response.foldername !== undefined){
                    bmSiteType = response.foldername;
                }
                logDebug("Received unload response, bmsiteType", bmSiteType);
                logDebug("Received unload response, saving folder", response.foldername);
                logDebug("Received unload response, saving file:", response.filename);
                saveText(response.filename + '.bml', response.code);
            }
        });
    });
}

// LOAD ONCLICK
let fileHandle;
loadButton.addEventListener('click', async () => {
    logDebug("Load button clicked.");
    [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    logDebug("File loaded:", file.name);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { greeting: 'load', code: contents },
            function (response) {
                logDebug("Load response received:", response);
            }
        );
    });
});

// UNLOAD TEST ONCLICK
unloadTestButton.onclick = function () {
    logDebug("Unload Test button clicked.");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadTest' }, function (response) {
            if (response.testCode && response.filename) {
                logDebug("Received unloadTest response, saving file:", response.filename);
                saveText(response.filename + '.test.bml', response.testCode);
            }
        });
    });
}

// LOAD TEST ONCLICK
let fileHandle2;
loadTestButton.addEventListener('click', async () => {
    logDebug("Load Test button clicked.");
    [fileHandle2] = await window.showOpenFilePicker();
    const file = await fileHandle2.getFile();
    const contents = await file.text();
    logDebug("Test file loaded:", file.name);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { greeting: 'loadTest', code: contents },
            function (response) {
                logDebug("Load Test response received:", response);
            }
        );
    });
});

// FILE SAVE FUNCTION
function saveText(filename, text) {
    logDebug("Saving file:", filename);
    const tempElem = document.createElement('a');
    tempElem.setAttribute(
        'href',
        'data:bml/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

// OPTIONS HANDLER
optionsButton.onclick = function () {
    logDebug("Options button clicked, redirecting to options page.");
    window.location = '/options.html';
}

// FOOTER INFORMATION
const manifest = chrome.runtime.getManifest();

document.addEventListener('DOMContentLoaded', () => {
    logDebug("DOM fully loaded, setting footer information.");
    document.getElementById('footer').innerHTML = getFooter();
});

function getFooter() {
    return '<p>' + manifest.name + ' v' + manifest.version + '</p>';
}
