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
let bmSiteSubDomain = '';
let bmSiteType = '';
let bmRuleType = '';
let bmFileType = 'bml';
let githubLoginStatus = false;
let githubUsername = null;

// URL Matchers for Different Sections and Rule Types
const URL_MATCHERS = {
    config: {
        generic: "bigmachines.com/admin/configuration/rules",
        ruleTypes: {
            1: 'recommendation',
            2: 'constraint',
            11: 'hiding',
            23: 'bommapping',
        },
    },
    commerce: {
        generic: "bigmachines.com/admin/commerce/rules",
        action: "bigmachines.com/admin/commerce/actions/edit_action.jsp",
        rule: "bigmachines.com/admin/commerce/rules/edit_rule.jsp",
        ruleInputs: "bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp",
    },
    utils: "bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor",
    interfaces: {
        rest: "bigmachines.com/rest/",
        soap: "bigmachines.com/soap/",
    },
    stylesheets: {
        stylesheetManager: "bigmachines.com/admin/ui/branding/edit_site_branding.jsp",
        headerFooter: "bigmachines.com/admin/ui/branding/edit_header_footer.jsp",
    },
    documents: "bigmachines.com/admin/document-designer/",
};

/**
 * Extracts the value of a specified query parameter from a URL.
 * @param {string} url - The URL to search for the query parameter.
 * @param {string} name - The name of the query parameter to extract.
 * @returns {string} The decoded value of the query parameter, or an empty string if not present.
 */
function getUrlParameter(url, name) {
    const escapedName = name.replace(/[[\]\\]/g, '\\$&');
    const regex = new RegExp(`[?&]${escapedName}=([^&#]*)`);
    const results = regex.exec(url);
    return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
}

/**
 * Determines the rule type based on the `rule_type` parameter in the URL.
 * @param {string} url - The URL to analyze.
 * @returns {string|null} The rule type or null if not found.
 */
function determineRuleType(url) {
    const ruleTypeParam = getUrlParameter(url, 'rule_type');
    if (ruleTypeParam) {
        const ruleType = URL_MATCHERS.config.ruleTypes[ruleTypeParam] || `other_rule_type_${ruleTypeParam}`;
        logDebug(`Detected configuration rule type: ${ruleType}`);
        return ruleType;
    }
    return null;
}

/**
 * Determines the site type and rule type based on the URL.
 * @param {string} url - The URL to analyze.
 */
function analyzeUrl(url) {
    if (url.includes(URL_MATCHERS.config.generic)) {
        bmSiteType = 'config';
        bmRuleType = determineRuleType(url);
    } else if (url.includes(URL_MATCHERS.commerce.generic)) {
        bmSiteType = 'commerce';
        if (url.includes(URL_MATCHERS.commerce.action)) {
            bmRuleType = 'action';
        } else if (url.includes(URL_MATCHERS.commerce.rule)) {
            bmRuleType = 'rule';
        } else if (url.includes(URL_MATCHERS.commerce.ruleInputs)) {
            bmRuleType = 'rule_inputs';
        }
    } else if (url.includes(URL_MATCHERS.utils)) {
        bmSiteType = 'utils';
        bmRuleType = null;
    } else if (url.includes(URL_MATCHERS.interfaces.rest)) {
        bmSiteType = 'interfaces';
        bmRuleType = 'rest';
    } else if (url.includes(URL_MATCHERS.interfaces.soap)) {
        bmSiteType = 'interfaces';
        bmRuleType = 'soap';
    } else if (url.includes(URL_MATCHERS.stylesheets.stylesheetManager)) {
        bmSiteType = 'stylesheets';
        bmRuleType = 'stylesheet';
    } else if (url.includes(URL_MATCHERS.stylesheets.headerFooter)) {
        bmSiteType = 'stylesheets';
        bmRuleType = 'headerFooter';
    } else if (url.includes(URL_MATCHERS.documents)) {
        bmSiteType = 'documents';
        bmRuleType = null;
        bmFileType = 'xsl';
    } else {
        logDebug("Unrecognized URL pattern:", url);
    }

    logDebug("Site type set to:", bmSiteType);
    logDebug("Rule type set to:", bmRuleType);
}

/**
 * Sanitizes a filename by replacing invalid characters with underscores.
 * @param {string} filename - The filename to sanitize.
 * @returns {string} The sanitized filename.
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
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

// Event Listeners for Buttons
document.getElementById('unload').addEventListener('click', () => {
    logDebug("Unload button clicked.");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unload' }, function (response) {
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
    });
});

document.getElementById('load').addEventListener('click', async () => {
    logDebug("Load button clicked.");
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    logDebug("File loaded:", file.name);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
    });
});

// UNLOAD TEST ONCLICK
document.getElementById('unloadTest').addEventListener('click', () => {
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

// LOAD TEST ONCLICK
document.getElementById('loadTest').addEventListener('click', async () => {
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

// Options button event listener
document.getElementById('options').addEventListener('click', () => {
    logDebug("Options button clicked.");
    chrome.runtime.openOptionsPage();
});

// Logs button event listener
document.getElementById('logs').addEventListener('click', () => {
    logDebug("Logs button clicked.");
    // For now, just log a message. This could open a log viewer in the future.
    console.log("Logs feature not yet implemented.");
    alert("Logs feature coming soon!");
});

// Initialize Extension
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    if (url) {
        logDebug("Active tab URL:", url);
        analyzeUrl(url);
    }
});

logDebug("Extension initialized.");

// FOOTER INFORMATION
const manifest = chrome.runtime.getManifest();

function getFooter() {
    return '<p>' + manifest.name + ' v' + manifest.version + '</p>';
}

// GitHub Login Functions
/**
 * Updates the GitHub login UI based on login status
 */
function updateGitHubUI() {
    const loginContainer = document.getElementById('githubLoginContainer');
    const userContainer = document.getElementById('githubUserContainer');
    const usernameSpan = document.getElementById('githubUsername');
    
    if (githubLoginStatus && githubUsername) {
        loginContainer.style.display = 'none';
        userContainer.style.display = 'block';
        usernameSpan.textContent = githubUsername;
        logDebug("GitHub UI updated: logged in as", githubUsername);
    } else {
        loginContainer.style.display = 'block';
        userContainer.style.display = 'none';
        logDebug("GitHub UI updated: not logged in");
    }
}

/**
 * Check GitHub login status on popup load
 */
function checkGitHubLoginStatus() {
    logDebug("Checking GitHub login status...");
    chrome.runtime.sendMessage({ action: 'checkGitHubStatus' });
}

// GitHub Login Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    logDebug("DOM fully loaded, setting up GitHub login...");
    
    // Set up event listeners for GitHub login/logout
    document.getElementById('githubLogin').addEventListener('click', () => {
        logDebug("GitHub login button clicked");
        chrome.runtime.sendMessage({ action: 'githubLogin' });
    });
    
    document.getElementById('githubLogout').addEventListener('click', () => {
        logDebug("GitHub logout button clicked");
        chrome.runtime.sendMessage({ action: 'githubLogout' });
    });
    
    // Check login status
    checkGitHubLoginStatus();
    
    // Set footer
    document.getElementById('footer').innerHTML = getFooter();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logDebug("Popup received message:", message);
    
    switch (message.type) {
        case 'githubLoginStatus':
            githubLoginStatus = message.isLoggedIn;
            githubUsername = message.user || null;
            updateGitHubUI();
            break;
            
        case 'githubAuthSuccess':
            githubLoginStatus = true;
            githubUsername = message.user;
            updateGitHubUI();
            logDebug("GitHub login successful:", message.user);
            break;
            
        case 'githubAuthError':
            logDebug("GitHub auth error:", message.error);
            alert(`GitHub Login Error: ${message.error}`);
            break;
            
        case 'githubLogoutSuccess':
            githubLoginStatus = false;
            githubUsername = null;
            updateGitHubUI();
            logDebug("GitHub logout successful");
            break;
            
        default:
            logDebug("Unhandled message type:", message.type);
    }
});
