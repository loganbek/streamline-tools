// Listen for messages
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     // If the received message has the expected format...
//     if (msg.text === 'report_back') {
//         // Call the specified callback, passing
//         // the web-page's DOM content as argument
//         sendResponse(document.all[0].outerHTML);
//     }
// });

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            chrome.tabs.executeScript(tabId, {code:'var w = window; console.log(w);'});
            // jsonPath(window.jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
            sendResponse({ farewell: "goodbye" });
    });