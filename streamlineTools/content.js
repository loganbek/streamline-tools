// Listen for messages
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     // If the received message has the expected format...
//     if (msg.text === 'report_back') {
//         // Call the specified callback, passing
//         // the web-page's DOM content as argument
//         sendResponse(document.all[0].outerHTML);
//     }
// });

// chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(response) {
//     // JSON.parse does not evaluate the attacker's scripts.
//     var resp = JSON.parse(response.farewell);
//   });

// chrome.tabs.sendMessage(tab.id, { greeting: "hello" }, function (response) {
//     // innerText does not let the attacker inject HTML elements.
//     document.getElementById("resp").innerText = response.farewell;
// });


// Inform the background page that 
// this tab should have a page-action.
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction',
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // First, validate the message's structure.
    if ((msg.from === 'popup') && (msg.subject === 'unload')) {
        // Collect the necessary data. 
        // (For your specific requirements `document.querySelectorAll(...)`
        //  should be equivalent to jquery's `$(...)`.)
        var info = {
            // total: document.querySelectorAll('*').length,
            total: '1'
            //     inputs: document.querySelectorAll('input').length,
            //     buttons: document.querySelectorAll('button').length,
        };

        // Directly respond to the sender (popup), 
        // through the specified callback.
        response(info);
    }
});