const POPUP_DEBUG = true;

function logDebug(message, ...args) {
    if (POPUP_DEBUG) {
        console.log("[POPUP_DEBUG]", message, ...args);
    }
}

'use strict'

// Buttons
const unloadHeaderBtn = document.getElementById('unloadHead');
const loadHeaderBtn = document.getElementById('loadHead');
const unloadFooterBtn = document.getElementById('unloadFooter');
const loadFooterBtn = document.getElementById('loadFooter');
const optionsButton = document.getElementById('options');
const logsButton = document.getElementById('logs');

// Initialize
logDebug("Initializing header/footer extension...");

// Check if we're on the correct page
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;
    
    if (!url.includes('bigmachines.com/admin/ui/branding/edit_header_footer.jsp')) {
        document.body.innerHTML = '<p>This popup is only available on the Header/Footer edit page.</p>';
        return;
    }

    // Enable downloads shelf
    chrome.downloads.setShelfEnabled(true);
    
    // Disable logs button
    logsButton.disabled = true;
});

// Unload Header handler
unloadHeaderBtn.onclick = async function () {
    logDebug("Unload Header button clicked");
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { greeting: 'unloadHeader' });
        if (response?.code) {
            await saveText('header.html', response.code);
        } else {
            throw new Error('Failed to unload header');
        }
    } catch (err) {
        logDebug("Error unloading header:", err);
        alert('Failed to unload header. Please try again.');
    }
}

// Load Header handler
loadHeaderBtn.onclick = async function () {
    logDebug("Load Header button clicked");
    try {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { greeting: 'loadHeader', code: contents },
                function (response) {
                    logDebug("Load Header response received:", response);
                }
            );
        });
    } catch (err) {
        logDebug("Error loading header file:", err);
        alert('Failed to load header file. Please try again.');
    }
}

// Unload Footer handler
async function handleFileOperation(operation, fileName) {
    logDebug(`${operation} button clicked`);
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (operation.startsWith('unload')) {
            const response = await chrome.tabs.sendMessage(tab.id, { greeting: operation });
            if (response?.code) {
                await saveText(fileName, response.code);
            } else {
                throw new Error(`Failed to ${operation}`);
            }
        } else {
            const [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const contents = await file.text();
            await chrome.tabs.sendMessage(tab.id, { greeting: operation, code: contents });
            logDebug(`${operation} response received`);
        }
    } catch (err) {
        logDebug(`Error in ${operation}:`, err);
        alert(`Failed to ${operation}. Please try again.`);
    }
}

// Header handlers (assuming these elements exist in the file)
unloadHeaderBtn.onclick = () => handleFileOperation('unloadHeader', 'header.html');
loadHeaderBtn.onclick = () => handleFileOperation('loadHeader', 'header.html');

// Footer handlers
unloadFooterBtn.onclick = () => handleFileOperation('unloadFooter', 'footer.html');
loadFooterBtn.onclick = () => handleFileOperation('loadFooter', 'footer.html');

// File save helper
function saveText(filename, text) {
    logDebug("Saving file:", filename);
    const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Options handler
optionsButton.onclick = function () {
    logDebug("Options button clicked");
    window.location = chrome.runtime.getURL('options/options.html');
}

// Set footer version info
const manifest = chrome.runtime.getManifest();
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('footer').innerHTML = `<p>${manifest.name} v${manifest.version}</p>`;
});
