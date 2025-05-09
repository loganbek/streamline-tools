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
        
        // More secure URL matching using URL object
        try {
            const urlObj = new URL(url);
            const ruleUrlObj = new URL(ruleUrl.startsWith('http') ? ruleUrl : 'https://' + ruleUrl);
            
            // Compare hostname and path parts more securely
            const hostMatch = 
                //urlObj.hostname === ruleUrlObj.hostname ||
                urlObj.hostname.endsWith('.' + ruleUrlObj.hostname);
            
            // Must match both host AND path to be considered a match
            logDebug("URL Pathname:", urlObj.pathname);
            logDebug("Rule URL Pathname:", ruleUrlObj.pathname);
            return urlObj.pathname.startsWith(ruleUrlObj.pathname);
        } catch (e) {
            // Fallback to a safer regex pattern if URL parsing fails
            const escapedPattern = ruleUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${escapedPattern}\\/`);
            return regex.test(url);
        }
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
                const [fileHandle] = await safeShowOpenFilePicker();
                const file = await fileHandle.getFile();
                const contents = await file.text();

                chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                    if (await ensureContentScript(tabs[0].id)) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { greeting: 'load', code: contents, rule },
                            function (response) {
                                logDebug("Load response received:", response);
                            }
                        );
                    } else {
                        logDebug("Failed to inject content script for rule:", rule.RuleName);
                    }
                });
            });
        }

        if (unloadButton) {
            unloadButton.addEventListener('click', async () => {
                logDebug(`Unload button clicked for rule: ${rule.RuleName}`);
                chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
                    if (await ensureContentScript(tabs[0].id)) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { greeting: 'unload', rule },
                            function (response) {
                                if (response?.code && response?.filename) {
                                    saveText(`${response.filename}.${rule.fileType}`, response.code, rule.fileType, rule.savePath);
                                }
                            }
                        );
                    } else {
                        logDebug("Failed to inject content script for rule:", rule.RuleName);
                    }
                });
            });
        }
    });
}

/**
 * Safely shows file picker with testing fallback
 * @returns {Promise<Array<FileSystemFileHandle>>} Array of file handles
 */
async function safeShowOpenFilePicker() {
    // Check if we're in a test environment
    const isTestEnvironment = window._mockFileContent !== undefined;
    
    if (isTestEnvironment) {
        logDebug('Using mock file picker in test environment');
        // Create a mock FileSystemFileHandle with the necessary methods
        const mockFileHandle = {
            getFile: async () => ({
                text: async () => window._mockFileContent,
                name: 'test-file.bml'
            })
        };
        return [mockFileHandle];
    }
    
    // Use the real file picker API for normal operation
    try {
        return await window.showOpenFilePicker();
    } catch (error) {
        logDebug('Error using file picker:', error);
        throw error;
    }
}

/**
 * Saves text content to a file with proper directory structure.
 * @param {string} filename - The name of the file.
 * @param {string} text - The content to save.
 * @param {string} filetype - The file type (default: 'bml').
 * @param {string} savePath - The path to save the file to (from rulesList.json).
 */
function saveText(filename, text, filetype = 'bml', savePath = '') {
    let finalPath = '';
    let finalFilename = filename;
    let dirPath = '';
    
    // Get current subdomain from active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (!tabs || tabs.length === 0) {
            logDebug("Error: No active tab found");
            return;
        }
        
        let subdomain = "default";
        try {
            const url = new URL(tabs[0].url);
            // Extract subdomain from URL
            if (url.hostname.includes(".bigmachines.com")) {
                // Handle URLs like: subdomain.bigmachines.com
                const parts = url.hostname.split(".bigmachines.com")[0].split(".");
                subdomain = parts[parts.length - 1]; // Get the last part before bigmachines.com
                logDebug("Extracted subdomain:", subdomain);
            } else {
                // For other URLs, use hostname as subdomain
                subdomain = url.hostname.replace(/\./g, "-");
                logDebug("Using hostname as subdomain:", subdomain);
            }
        } catch (error) {
            logDebug("Error extracting subdomain:", error);
            // Default to 'dev' if we can't extract a subdomain
            subdomain = "dev";
        }
        
        // Dynamically create base path using the subdomain
        const basePath = `bigmachines/${subdomain}`;
        logDebug("Using dynamic base path:", basePath);
        
        if (savePath) {
            logDebug("Original savePath:", savePath);
            
            // Handle tilde for home directory
            const cleanPath = savePath.replace(/^~\//, '').replace(/\/$/, '');
            logDebug("Cleaned savePath:", cleanPath);
            
            // Handle special case where savePath contains placeholders
            if (cleanPath.includes('(header/footer)')) {
                // Extract the base directory part 
                const parts = cleanPath.split('(header/footer)');
                const baseDirPath = parts[0];
                const fileType = filename.split('.')[0]; // 'header' or 'footer'
                
                // Create directory path with actual header/footer value and include base path
                dirPath = `${basePath}/${baseDirPath}${fileType}`;
                finalFilename = filename;
                logDebug("Special case - Dir path:", dirPath);
                logDebug("Special case - Final filename:", finalFilename);
            } 
            // Handle paths with fileName placeholder
            else if (cleanPath.includes('fileName')) {
                // Extract base filename without extension
                const baseFilename = filename.split('.')[0]; // e.g. 'style' from 'style.css'
                // Replace fileName with actual filename but preserve directory structure
                dirPath = `${basePath}/${cleanPath.substring(0, cleanPath.lastIndexOf('/'))}`;
                finalFilename = baseFilename + '.' + filetype;
                logDebug("Placeholder - Dir path:", dirPath);
                logDebug("Placeholder - Final filename:", finalFilename);
            } 
            // Standard path
            else {
                // Separate directory path from filename
                dirPath = `${basePath}/${cleanPath}`;
                logDebug("Standard path - Dir path:", dirPath);
                logDebug("Standard path - Final filename:", finalFilename);
            }
            
            // Combine into finalPath for logging
            finalPath = `${dirPath}/${finalFilename}`;
        } else {
            // No path specified, but still use base path
            dirPath = basePath;
            finalPath = `${dirPath}/${finalFilename}`;
            logDebug("No savePath, using base path with filename:", finalPath);
        }
        
        logDebug("Final directory path for download:", dirPath);
        logDebug("Final filename for download:", finalFilename);
        logDebug("Full path representation:", finalPath);
        
        try {
            // Set appropriate MIME type for the file
            let mimeType;
            switch (filetype) {
                case 'xsl':
                    mimeType = 'application/xml';
                    break;
                case 'html':
                    mimeType = 'text/html';
                    break;
                case 'css':
                    mimeType = 'text/css';
                    break;
                case 'json':
                    mimeType = 'application/json';
                    break;
                case 'xml':
                    mimeType = 'application/xml';
                    break;
                default:
                    mimeType = 'text/plain';
            }
            
            // Create a blob with the content
            const blob = new Blob([text], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            // Send message to background script with directory path and filename separated
            chrome.runtime.sendMessage({
                action: 'saveToDirectory',
                data: {
                    url: url,
                    dirPath: dirPath, 
                    filename: finalFilename,
                    fullPath: finalPath,
                    overwrite: true // Add flag to overwrite existing files
                }
            }, (response) => {
                if (response && response.success) {
                    logDebug("File saved successfully:", response.path || finalPath);
                } else {
                    logDebug("Error saving file:", response?.error || "Unknown error");
                }
                
                // Clean up the blob URL
                URL.revokeObjectURL(url);
            });
            
        } catch (error) {
            logDebug("Error preparing file download:", error);
        }
    });
}

/**
 * Adds a click listener to a button if it exists and ensures only one listener is added.
 * @param {string} buttonId - The ID of the button.
 * @param {Function} callback - The function to execute on click.
 */
function addButtonClickListener(buttonId, callback) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.onclick = callback;
    } else {
        logDebug(`Button with ID "${buttonId}" not found.`);
    }
}

// Ensure buttons exist before assignment
const unloadBMLBtn = document.getElementById('unloadBML');
const loadBMLBtn = document.getElementById('loadBML');
const unloadTestBMLBtn = document.getElementById('unloadTestBML');
const loadTestBMLBtn = document.getElementById('loadTestBML');
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
const unloadGlobalXSLBtn = document.getElementById('unloadGlobalXSL');
const loadGlobalXSLBtn = document.getElementById('loadGlobalXSL');
const unloadXSLBtn = document.getElementById('unloadXSL');
const loadXSLBtn = document.getElementById('loadXSL');
const unloadXMLBtn = document.getElementById('unloadXML');
const loadXMLBtn = document.getElementById('loadXML');
const unloadJSONBtn = document.getElementById('unloadJSON');
const loadJSONBtn = document.getElementById('loadJSON');
const optionsBtn = document.getElementById('options');
const logsBtn = document.getElementById('logs');

// Ensure content script is injected before sending messages
async function ensureContentScript(tabId) {
    try {
        logDebug("Ensuring content script is loaded and ready...");
        
        // First try to ping the content script
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, { greeting: 'ping' }, response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                });
                
                // Add safety timeout
                setTimeout(() => reject(new Error("Ping timed out")), 500);
            });
            
            if (response?.status === 'ok') {
                logDebug("Content script is already loaded and responsive");
                return true;
            }
        } catch (pingErr) {
            logDebug("Content script not responding to ping:", pingErr.message);
        }

        // Need to inject the script
        logDebug("Injecting content script...");
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content/content.js']
            });
            logDebug("Content script injected successfully");
        } catch (injectErr) {
            logDebug("Failed to inject content script:", injectErr);
            return false;
        }
        
        // Wait for content script to initialize
        let attempts = 0;
        const maxAttempts = 10;
        const baseDelay = 100; // ms
        
        logDebug("Waiting for content script to initialize...");
        while (attempts < maxAttempts) {
            try {
                // Exponential backoff with jitter for retry attempts
                const delay = baseDelay * Math.pow(1.5, attempts) * (0.9 + Math.random() * 0.2);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                logDebug(`Ping attempt ${attempts + 1}/${maxAttempts}...`);
                const pingResponse = await new Promise((resolve, reject) => {
                    chrome.tabs.sendMessage(tabId, { greeting: 'ping' }, response => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(response);
                        }
                    });
                    
                    // Add safety timeout
                    setTimeout(() => reject(new Error("Ping timed out")), 500);
                });
                
                if (pingResponse?.status === 'ok') {
                    logDebug("Content script responded successfully after injection");
                    return true;
                }
            } catch (retryErr) {
                attempts++;
                logDebug(`Waiting for content script (attempt ${attempts}/${maxAttempts}): ${retryErr.message}`);
            }
        }
        
        logDebug("Content script injection failed after maximum retry attempts");
        return false;
    } catch (err) {
        logDebug("Critical error ensuring content script:", err);
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

// Event Listeners for Buttons
if (unloadBMLBtn) {
    unloadBMLBtn.addEventListener('click', async () => {
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

if (loadBMLBtn) {
    loadBMLBtn.addEventListener('click', async () => {
        logDebug("Load button clicked.");
        const [fileHandle] = await safeShowOpenFilePicker();
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
if (unloadTestBMLBtn) {
    unloadTestBMLBtn.addEventListener('click', async () => {
        logDebug("Unload Test button clicked.");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (await ensureContentScript(tab.id)) {
            chrome.tabs.sendMessage(tab.id, { greeting: 'unloadTest' }, function (response) {
                if (chrome.runtime.lastError) {
                    logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                } else if (response.testCode && response.filename) {
                    logDebug("Received unloadTest response, saving file:", response.filename);
                    saveText(response.filename + '.test.' + bmFileType, response.testCode, bmFileType);
                }
            });
        } else {
            logDebug("Failed to inject content script for unload test");
        }
    });
}

// LOAD TEST ONCLICK
if (loadTestBMLBtn) {
    loadTestBMLBtn.addEventListener('click', async () => {
        logDebug("Load Test button clicked.");
        const [fileHandle2] = await safeShowOpenFilePicker();
        const file = await fileHandle2.getFile();
        const contents = await file.text();
        logDebug("Test file loaded:", file.name);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (await ensureContentScript(tab.id)) {
            chrome.tabs.sendMessage(
                tab.id,
                { greeting: 'loadTest', code: contents },
                function (response) {
                    if (chrome.runtime.lastError) {
                        logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                    } else {
                        logDebug("Load Test response received:", response);
                    }
                }
            );
        } else {
            logDebug("Failed to inject content script for load test");
        }
    });
}

// Header/Footer HTML Handlers
if (unloadHeaderHTMLBtn) {
    unloadHeaderHTMLBtn.onclick = async function() {
        logDebug("Unload Header button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadHeaderHTML' });
                if (response?.code) {
                    // Get the Header & Footer rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const headerRule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
                    let savePath = '';
                    if (headerRule && headerRule.savePath) {
                        // Replace placeholder in savePath if needed (header/footer)
                        savePath = headerRule.savePath.replace('(header/footer)', 'header');
                        logDebug("Using savePath for header:", savePath);
                    }
                    saveText('header.html', response.code, 'html', savePath);
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
    loadHeaderHTMLBtn.onclick = async function() {
        logDebug("Load Header button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { greeting: 'loadHeaderHTML', code: contents },
                    function(response) {
                        logDebug("Load Header response received:", response);
                    }
                );
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error loading header:", err);
        }
    }
}

if (unloadFooterHTMLBtn) {
    unloadFooterHTMLBtn.onclick = async function() {
        logDebug("Unload Footer button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadFooterHTML' });
                if (response?.code) {
                    // Get the Header & Footer rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const footerRule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Header & Footer');
                    let savePath = '';
                    if (footerRule && footerRule.savePath) {
                        // Replace placeholder in savePath if needed (header/footer)
                        savePath = footerRule.savePath.replace('(header/footer)', 'footer');
                        logDebug("Using savePath for footer:", savePath);
                    }
                    saveText('footer.html', response.code, 'html', savePath);
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

if (loadFooterHTMLBtn) {
    loadFooterHTMLBtn.onclick = async function() {
        logDebug("Load Footer button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { greeting: 'loadFooterHTML', code: contents },
                    function(response) {
                        logDebug("Load Footer response received:", response);
                    }
                );
            } else {
                throw new Error('Content script injection failed');
            }
        } catch (err) {
            logDebug("Error loading footer:", err);
        }
    }
}

// CSS Handlers
if(unloadCSSBtn) {
    unloadCSSBtn.onclick = async function () {
        logDebug("Unload CSS button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadCSS' });
                if (response?.code) {
                    // Get the Stylesheet Manager rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const cssRule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Stylesheet Manager');
                    let savePath = '';
                    if (cssRule && cssRule.savePath) {
                        savePath = cssRule.savePath.replace('fileName', 'style');
                        logDebug("Using savePath for CSS:", savePath);
                    }
                    saveText('style.css', response.code, 'css', savePath);
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
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { greeting: 'loadCSS', code: contents },
                    function (response) {
                        logDebug("Load CSS response received:", response);
                    }
                );
            } else {
                throw new Error('Content script injection failed for CSS loading');
            }
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
                    // Get the Stylesheet Manager rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const cssRule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Stylesheet Manager');
                    let savePath = '';
                    if (cssRule && cssRule.savePath) {
                        savePath = cssRule.savePath.replace('fileName', 'styleAlt');
                        logDebug("Using savePath for Alt CSS:", savePath);
                    }
                    saveText('styleAlt.css', response.code, 'css', savePath);
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

if(loadAltCSSBtn) {
    loadAltCSSBtn.onclick = async function () {
        logDebug("Load Alt CSS button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { greeting: 'loadAltCSS', code: contents },
                    function (response) {
                        logDebug("Load Alt CSS response received:", response);
                    }
                );
            } else {
                throw new Error('Content script injection failed for Alt CSS loading');
            }
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
                    // Get the Stylesheet Manager rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const cssRule = rulesList.find(r => r.AppArea === 'Stylesheets' && r.RuleName === 'Stylesheet Manager');
                    let savePath = '';
                    if (cssRule && cssRule.savePath) {
                        savePath = cssRule.savePath.replace('fileName', 'styleJET');
                        logDebug("Using savePath for JET CSS:", savePath);
                    }
                    saveText('styleJET.css', response.code, 'css', savePath);
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
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { greeting: 'loadJETCSS', code: contents },
                    function (response) {
                        logDebug("Load JET CSS response received:", response);
                    }
                );
            } else {
                throw new Error('Content script injection failed for JET CSS loading');
            }
        } catch (err) {
            logDebug("Error loading JET CSS:", err);
        }
    }
}

// XSL Document Handlers
if (unloadGlobalXSLBtn) {
    unloadGlobalXSLBtn.onclick = async () => {
        logDebug("Unload Global XSL button clicked.");
        try {
            const response = await sendMessageToBackground({ greeting: 'unloadGlobalXSL' });
            if (response?.code) {
                // Get the Global XSL rule from rulesList.json to get the savePath
                const rulesList = await fetchRulesList();
                const xslRule = rulesList.find(r => r.AppArea === 'Documents' && r.RuleName === 'Global XSL');
                let savePath = '';
                if (xslRule && xslRule.savePath) {
                    savePath = xslRule.savePath.replace('fileName', 'globalXSL');
                    logDebug("Using savePath for Global XSL:", savePath);
                }
                saveText('globalXSL.xsl', response.code, 'xsl', savePath);
            }
        } catch (error) {
            logDebug("Error during unloadGlobalXSL:", error);
        }
    };
}

if (loadGlobalXSLBtn) {
    loadGlobalXSLBtn.onclick = async () => {
        logDebug("Load Global XSL button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            const response = await sendMessageToBackground({ greeting: 'loadGlobalXSL', code: contents });
            logDebug("Load Global XSL response received:", response);
        } catch (error) {
            logDebug("Error during loadGlobalXSL:", error);
        }
    };
}

if (unloadXSLBtn) {
    unloadXSLBtn.onclick = async () => {
        logDebug("Unload XSL button clicked.");
        try {
            const response = await sendMessageToBackground({ greeting: 'unloadXSL' });
            if (response?.code) {
                // Get the Document XSL rule from rulesList.json to get the savePath
                const rulesList = await fetchRulesList();
                const xslRule = rulesList.find(r => r.AppArea === 'Documents' && r.RuleName === 'Global XSL');
                let savePath = '';
                if (xslRule && xslRule.savePath) {
                    savePath = xslRule.savePath.replace('fileName', 'file');
                    logDebug("Using savePath for XSL:", savePath);
                }
                saveText('file.xsl', response.code, 'xsl', savePath);
            }
        } catch (error) {
            logDebug("Error during unloadXSL:", error);
        }
    };
}

if (loadXSLBtn) {
    loadXSLBtn.onclick = async () => {
        logDebug("Load XSL button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            const response = await sendMessageToBackground({ greeting: 'loadXSL', code: contents });
            logDebug("Load XSL response received:", response);
        } catch (error) {
            logDebug("Error during loadXSL:", error);
        }
    };
}

// SOAP Interface Handlers
if (unloadXMLBtn) {
    unloadXMLBtn.onclick = async () => {
        logDebug("Unload XML button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadXML' });
                if (response?.code) {
                    // Get the SOAP interface rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const soapRule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'SOAP');
                    let savePath = '';
                    if (soapRule && soapRule.savePath) {
                        savePath = soapRule.savePath.replace('fileName', 'interface');
                        logDebug("Using savePath for XML:", savePath);
                    }
                    saveText('interface.xml', response.code, 'xml', savePath);
                }
            }
        } catch (error) {
            logDebug("Error unloading XML:", error);
        }
    };
}

if (loadXMLBtn) {
    loadXMLBtn.onclick = async () => {
        logDebug("Load XML button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(tab.id, { 
                    greeting: 'loadXML',
                    code: contents
                }, response => {
                    logDebug("Load XML response received:", response);
                });
            }
        } catch (error) {
            logDebug("Error loading XML:", error);
        }
    };
}

// REST Interface Handlers 
if (unloadJSONBtn) {
    unloadJSONBtn.onclick = async () => {
        logDebug("Unload JSON button clicked.");
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadJSON' });
                if (response?.code) {
                    // Get the REST interface rule from rulesList.json to get the savePath
                    const rulesList = await fetchRulesList();
                    const restRule = rulesList.find(r => r.AppArea === 'Interfaces' && r.RuleName === 'REST');
                    let savePath = '';
                    if (restRule && restRule.savePath) {
                        savePath = restRule.savePath.replace('fileName', 'interface');
                        logDebug("Using savePath for JSON:", savePath);
                    }
                    saveText('interface.json', response.code, 'json', savePath);
                }
            }
        } catch (error) {
            logDebug("Error unloading JSON:", error);
        }
    };
}

if (loadJSONBtn) {
    loadJSONBtn.onclick = async () => {
        logDebug("Load JSON button clicked.");
        try {
            const [fileHandle] = await safeShowOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (await ensureContentScript(tab.id)) {
                chrome.tabs.sendMessage(tab.id, {
                    greeting: 'loadJSON',
                    code: contents
                }, response => {
                    logDebug("Load JSON response received:", response);
                });
            }
        } catch (error) {
            logDebug("Error loading JSON:", error);
        }
    };
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
