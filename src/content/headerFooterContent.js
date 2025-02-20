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
        case 'unloadHeader':
            const headerCode = document.querySelector('#header_content').value;
            logDebug("Unloading header code");
            sendResponse({ code: headerCode });
            break;

        case 'loadHeader':
            logDebug("Loading header code");
            document.querySelector('#header_content').value = request.code;
            sendResponse({ status: "Header loaded successfully" });
            break;

        case 'unloadFooter':
            const footerCode = document.querySelector('#footer_content').value;
            logDebug("Unloading footer code");
            sendResponse({ code: footerCode });
            break;

        case 'loadFooter':
            logDebug("Loading footer code");
            document.querySelector('#footer_content').value = request.code;
            sendResponse({ status: "Footer loaded successfully" });
            break;
    }
    return true;
});

logDebug("Header/Footer content script loaded");
