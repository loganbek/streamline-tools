const DEBUG = true;

function logDebug(message, ...args) {
    if (DEBUG) {
        console.log("[HEADER_FOOTER_DEBUG]", message, ...args);
    }
}

// Message listener for popup interactions
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    logDebug("Message received:", request);

    switch (request.greeting) {
        case 'unloadHeaderHTML': {
            let headerHTMLCode = document.querySelector('textarea[name="header"]').value || "";
            logDebug("Unloading header code", headerHTMLCode);
            sendResponse({ code: headerHTMLCode });
            break;
        }
        case 'loadHeaderHTML': {
            let headerHTMLCode = request.code;
            logDebug("Loading header code", headerHTMLCode);
            sendResponse({ status: "Header loaded successfully" });
            break;
        }
        case 'unloadFooterHTML': {
            let footerHTMLCode = document.querySelector('textarea[name="footer"]').value || "";
            logDebug("Unloading footer code", footerHTMLCode);
            sendResponse({ code: footerHTMLCode });
            break;
        }

        case 'loadFooterHTML': {
            let footerHTMLCode = request.code;
            logDebug("Loading footer code", footerHTMLCode);
            sendResponse({ status: "Footer loaded successfully" });
            break;
        }
    }
    return true;
});

logDebug("Header/Footer content script loaded");
