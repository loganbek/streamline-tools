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

chrome.tabs.sendMessage(tab.id, { greeting: "hello" }, function (response) {
    // innerText does not let the attacker inject HTML elements.
    document.getElementById("resp").innerText = response.farewell;
});
