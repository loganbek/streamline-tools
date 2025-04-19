'use strict';

// Debugging Flag
const POPUP_DEBUG = true;

/**
 * Logs debug messages to the console if debugging is enabled.
 * @param {string} message - The debug message.
 * @param {...any} args - Additional arguments to log.
 */
function logDebug(message, ...args) {
    if (POPUP_DEBUG) {
        console.log("[POPUP_DEBUG]", message, ...args);
    }
}

// Global Variables
let bmSiteType = '';
let bmRuleType = '';
let bmFileType = 'bml';

/**
 * Dynamically fetch rule configurations from rulesList.json.
 * @returns {Promise<Object[]>} The parsed rules list.
 */
async function fetchRulesList() {
    try {
        const response = await fetch(chrome.runtime.getURL('rulesList.json'));
        if (!response.ok) {
            throw new Error(`Failed to fetch rulesList.json: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        logDebug("Error fetching rulesList.json:", error);
        return []; // Return an empty array to prevent further errors
    }
}

/**
 * Determines the site type and rule type based on the URL using rulesList.json.
 * @param {string} url - The URL to analyze.
 */
async function analyzeUrl(url) {
    const rulesList = await fetchRulesList();
    const matchingRule = rulesList.find(rule => {
        const ruleUrl = rule.URL.replace(/\*/g, ''); // Remove wildcard for comparison
        return url.includes(ruleUrl);
    });

    if (matchingRule) {
        bmSiteType = matchingRule.AppArea.toLowerCase();
        bmRuleType = matchingRule.RuleName.toLowerCase().replace(/\s+/g, '_');
        bmFileType = matchingRule.fileType || 'bml';
        logDebug("Matching rule found:", matchingRule);
    } else {
        logDebug("No matching rule found for URL:", url);
    }

    logDebug("Site type set to:", bmSiteType);
    logDebug("Rule type set to:", bmRuleType);
}

/**
 * Dynamically set up event listeners for buttons based on rulesList.json.
 */
async function setupDynamicEventListeners() {
    const rulesList = await fetchRulesList();

    rulesList.forEach(rule => {
        const loadButton = document.getElementById(`load${rule.RuleName.replace(/\s+/g, '')}`);
        const unloadButton = document.getElementById(`unload${rule.RuleName.replace(/\s+/g, '')}`);

        if (loadButton) {
            loadButton.addEventListener('click', async () => {
                logDebug(`Load button clicked for rule: ${rule.RuleName}`);
                const [fileHandle] = await window.showOpenFilePicker();
                const file = await fileHandle.getFile();
                const contents = await file.text();

                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { greeting: 'load', code: contents, rule },
                        function (response) {
                            logDebug("Load response received:", response);
                        }
                    );
                });
            });
        }

        if (unloadButton) {
            unloadButton.addEventListener('click', () => {
                logDebug(`Unload button clicked for rule: ${rule.RuleName}`);
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { greeting: 'unload', rule },
                        function (response) {
                            if (response?.code && response?.filename) {
                                saveText(`${response.filename}.${rule.fileType}`, response.code, rule.fileType);
                            }
                        }
                    );
                });
            });
        }
    });
}

/**
 * Saves text content to a file.
 * @param {string} filename - The name of the file.
 * @param {string} text - The content to save.
 * @param {string} filetype - The file type (default: 'bml').
 */
function saveText(filename, text, filetype = 'bml') {
    logDebug("Saving file:", filename);
    const mimeType = filetype === 'xsl' ? 'application/xml' : 'text/plain';
    const tempElem = document.createElement('a');
    tempElem.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(text)}`);
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

// Ensure buttons exist before assignment
const unloadBtn = document.getElementById('unload');
const loadBtn = document.getElementById('load');
const unloadTestBtn = document.getElementById('unloadTest');
const loadTestBtn = document.getElementById('loadTest');
const unloadHeaderHTMLBtn = document.getElementById('unloadHeaderHTML');
const loadHeaderHTMLBtn = document.getElementById('loadHeaderHTML');
const unloadFooterHTMLBtn = document.getElementById('unloadFooterHTML');
const loadFooterHTMLBtn = document.getElementById('loadFooterHTML');
const unloadCSSBtn = document.getElementById('unloadCSS');
const loadCSSBtn = document.getElementById('loadCSS');
const unloadAltCSSBtn = document.getElementById('unloadAltCSS');
const loadAltCSSBtn = document.getElementById('loadAltCSS');
const unloadJETCSSBtn = document.getElementById('unloadJETCSS');
const loadJETCSSBtn = document.getElementById('loadJETCSS');
const optionsBtn = document.getElementById('options');
const logsBtn = document.getElementById('logs');

// Ensure content script is injected before sending messages
async function ensureContentScript(tabId) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, { greeting: 'ping' });
        if (response?.status === 'ok') {
            logDebug("Content script is already loaded.");
            return true;
        }
    } catch (err) {
        logDebug("Content script not loaded, injecting now...");
    }

    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content/content.js'], // Replace with the actual content script file name
        });
        logDebug("Content script injected successfully.");
        return true;
    } catch (err) {
        logDebug("Failed to inject content script:", err);
        return false;
    }
}

/**
 * Sends a message to the background script and waits for a response.
 * @param {Object} message - The message to send.
 * @returns {Promise<Object>} The response from the background script.
 */
function sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// Update event listeners to use synchronized message passing
if (unloadBtn) {
    unloadBtn.addEventListener('click', async () => {
        logDebug("Unload button clicked.");
        try {
            const response = await sendMessageToBackground({ greeting: 'unload' });
            if (response?.code && response?.filename) {
                saveText(`${response.filename}.${bmFileType}`, response.code, bmFileType);
            }
        } catch (error) {
            logDebug("Error during unload:", error);
        }
    });
}

if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
        logDebug("Load button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            const response = await sendMessageToBackground({ greeting: 'load', code: contents });
            logDebug("Load response received:", response);
        } catch (error) {
            logDebug("Error during load:", error);
        }
    });
}

// Event Listeners for Buttons
if (unloadBtn) {
    unloadBtn.addEventListener('click', async () => {
        logDebug("Unload button clicked.");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (await ensureContentScript(tab.id)) {
            chrome.tabs.sendMessage(tab.id, { greeting: 'unload' }, function (response) {
                if (chrome.runtime.lastError) {
                    logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                } else if (response.code && response.filename) {
                    if (response.foldername !== undefined) {
                        bmSiteType = response.foldername;
                    }
                    logDebug("Received unload response, bmsiteType", bmSiteType);
                    logDebug("Received unload response, saving folder", response.foldername);
                    logDebug("Received unload response, saving file:", response.filename);
                    saveText(response.filename + '.' + bmFileType, response.code, bmFileType);
                }
            });
        }
    });
}

if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
        logDebug("Load button clicked.");
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        logDebug("File loaded:", file.name);

        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            if (await ensureContentScript(tabs[0].id)) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { greeting: 'load', code: contents },
                    function (response) {
                        if (chrome.runtime.lastError) {
                            logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                        } else {
                            logDebug("Load response received:", response);
                        }
                    }
                );
            } else {
                logDebug("Failed to inject content script");
            }
        });
    });
}

// UNLOAD TEST ONCLICK
if (unloadTestBtn) {
    unloadTestBtn.addEventListener('click', () => {
        logDebug("Unload Test button clicked.");
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadTest' }, function (response) {
                if (chrome.runtime.lastError) {
                    logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                } else if (response.testCode && response.filename) {
                    logDebug("Received unloadTest response, saving file:", response.filename);
                    saveText(response.filename + '.test.' + bmFileType, response.testCode, bmFileType);
                }
            });
        });
    });
}

// LOAD TEST ONCLICK
if (loadTestBtn) {
    loadTestBtn.addEventListener('click', async () => {
        logDebug("Load Test button clicked.");
        const [fileHandle2] = await window.showOpenFilePicker();
        const file = await fileHandle2.getFile();
        const contents = await file.text();
        logDebug("Test file loaded:", file.name);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { greeting: 'loadTest', code: contents },
                function (response) {
                    if (chrome.runtime.lastError) {
                        logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                    } else {
                        logDebug("Load Test response received:", response);
                    }
                }
            );
        });
    });
}

// Similar handlers for unloadHeaderHTMLBtn, loadHeaderHTMLBtn, unloadFooterHTMLBtn, loadFooterHTMLBtn,
// unloadCSSBtn, loadCSSBtn, unloadAltCSSBtn, loadAltCSSBtn, unloadJETCSSBtn, loadJETCSSBtn can be added here following the same pattern.

if (unloadHeaderHTMLBtn) {
    unloadHeaderHTMLBtn.onclick = async function () {
        logDebug("Unload Header button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadHeaderHTML' });
                if (response?.code) {
                    saveText('header.html', response.code);
                } else {
                    throw new Error('Failed to unload header');
                }
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error unloading header:", err);
        }
    }
}

if (loadHeaderHTMLBtn) {
    loadHeaderHTMLBtn.onclick = async function () {
        logDebug("Load Header button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                if (await ensureContentScript(tabs[0].id)) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { greeting: 'loadHeaderHTML', code: contents },
                        function (response) {
                            logDebug("Load Header response received:", response);
                        }
                    );
                } else {
                    logDebug("Failed to inject content script for header loading");
                }
            });
        } catch (err) {
            logDebug("Error loading header:", err);
        }
    }

}

if(unloadFooterHTMLBtn){
    unloadFooterHTMLBtn.onclick = async function () {
        logDebug("Unload Footer button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadFooterHTML' });
                if (response?.code) {
                    saveText('footer.html', response.code);
                } else {
                    throw new Error('Failed to unload footer');
                }
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error unloading footer:", err);
        }
    } 
}

if(loadFooterHTMLBtn){
    loadFooterHTMLBtn.onclick = async function () {
        logDebug("Load Footer button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { greeting: 'loadFooterHTML', code: contents },
                    function (response) {
                        logDebug("Load Footer response received:", response);
                    }
                );
            });
        } catch (err) {
            logDebug("Error loading footer:", err);
        }
    }
}

if(unloadCSSBtn) {
    unloadCSSBtn.onclick = async function () {
        logDebug("Unload CSS button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadCSS' });
                if (response?.code) {
                    saveText('style.css', response.code);
                } else {
                    throw new Error('Failed to unload CSS');
                }
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error unloading CSS:", err);
        }
    }
}

if(loadCSSBtn) {
    loadCSSBtn.onclick = async function () {
        logDebug("Load CSS button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { greeting: 'loadCSS', code: contents },
                    function (response) {
                        logDebug("Load CSS response received:", response);
                    }
                );
            });
        } catch (err) {
            logDebug("Error loading CSS:", err);
        }
    }
}

if(unloadAltCSSBtn) {
    unloadAltCSSBtn.onclick = async function () {
        logDebug("Unload Alt CSS button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadAltCSS' });
                if (response?.code) {
                    saveText('styleAlt.css', response.code);
                } else {
                    throw new Error('Failed to unload Alt CSS');
                }
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error unloading Alt CSS:", err);
        }
    }
}

if(loadAltCSSBtn){
    loadAltCSSBtn.onclick = async function () {
        logDebug("Load Alt CSS button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { greeting: 'loadAltCSS', code: contents },
                    function (response) {
                        logDebug("Load Alt CSS response received:", response);
                    }
                );
            });
        } catch (err) {
            logDebug("Error loading Alt CSS:", err);
        }
    }
}

if(unloadJETCSSBtn) {
    unloadJETCSSBtn.onclick = async function () {
        logDebug("Unload JET CSS button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadJETCSS' });
                if (response?.code) {
                    saveText('styleJET.css', response.code);
                } else {
                    throw new Error('Failed to unload JET CSS');
                }
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error unloading JET CSS:", err);
        }
    }
}

if(loadJETCSSBtn) {
    loadJETCSSBtn.onclick = async function () {
        logDebug("Load JET CSS button clicked.");
        try {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { greeting: 'loadJETCSS', code: contents },
                    function (response) {
                        logDebug("Load JET CSS response received:", response);
                    }
                );
            });
        } catch (err) {
            logDebug("Error loading JET CSS:", err);
        }
    }
}

if (optionsBtn) {
    optionsBtn.onclick = () => {
        logDebug("Options button clicked");
        window.location = chrome.runtime.getURL('options/options.html');
    };
}

if (logsBtn) {
    logsBtn.onclick = () => {
        logDebug("Logs button clicked");
        // Implement logs functionality if needed
    };
}

// Initialize Extension
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const url = tabs[0]?.url;
    if (url) {
        logDebug("Active tab URL:", url);
        await analyzeUrl(url);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    logDebug("DOM fully loaded, setting footer information.");
    const footer = document.getElementById('footer');
    try {
        const manifest = chrome.runtime.getManifest(); // Fetch manifest.json dynamically
        if (footer) {
            footer.innerHTML = `<p>${manifest.name} v${manifest.version}</p>`;
        }
    } catch (error) {
        logDebug("Error fetching manifest.json:", error);
    }
    await setupDynamicEventListeners();
});
