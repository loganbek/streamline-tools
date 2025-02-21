const POPUP_DEBUG = true;

function logDebug(message, ...args) {
    if (POPUP_DEBUG) {
        console.log("[POPUP_DEBUG]", message, ...args);
    }
}

'use strict'

// Buttons
const unloadHeaderBtn = document.getElementById('unloadHeader');
const loadHeaderBtn = document.getElementById('loadHeader');
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
unloadHeaderBtn.onclick = function () {
    logDebug("Unload Header button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadHeader' }, function (response) {
            if (response && response.code) {
                saveText('header.html', response.code);
            }
        });
    });
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
    }
}

// Unload Footer handler
unloadFooterBtn.onclick = function () {
    logDebug("Unload Footer button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadFooter' }, function (response) {
            if (response && response.code) {
                saveText('footer.html', response.code);
            }
        });
    });
}

// Load Footer handler
loadFooterBtn.onclick = async function () {
    logDebug("Load Footer button clicked");
    try {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const contents = await file.text();
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { greeting: 'loadFooter', code: contents },
                function (response) {
                    logDebug("Load Footer response received:", response);
                }
            );
        });
    } catch (err) {
        logDebug("Error loading footer file:", err);
    }
}

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
    window.location = '/options.html';
}

// Set footer version info
const manifest = chrome.runtime.getManifest();
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('footer').innerHTML = `<p>${manifest.name} v${manifest.version}</p>`;
});
