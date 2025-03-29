//adminDocumentsContent.js 
let ADMIN_DOCUMENTS_CONTENT_DEBUG = true;

function logDebug(message, ...optionalParams) {
    if (ADMIN_DOCUMENTS_CONTENT_DEBUG) {
        console.log(message, optionalParams);
    }
}

function logError(message, ...optionalParams) {
    console.error(message, optionalParams);
}

// Add message passing for the .ace_text-layer element. This element's textContent property contains the full code of the document.
// This is a workaround for the fact that the Ace editor does not provide a way to get the full code of the document.
//        chrome.scripting.executeScript({
//     target: { tabId: tabs[0].id },
//     files: ['adminDocumentsContent.js'],
// }, () => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: 'initializeDocumentHandlers' }, (response) => {
//         if (chrome.runtime.lastError) {
//             logDebug("Error initializing document handlers:", chrome.runtime.lastError);
//         } else {
//             logDebug("Document handlers initialized:", response);
//         }
//     });
// });

// Listen for the initializeDocumentHandlers event
window.addEventListener('initializeDocumentHandlers', function (evt) {
    logDebug("Initialize document handlers event received:", evt);
    initializeDocumentHandlers();
});

// Initialize document handlers
function initializeDocumentHandlers() {
    logDebug("Initializing document handlers...");
    // Add event listeners for document handlers here
}

