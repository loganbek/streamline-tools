// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
    //   // chrome.storage.sync.set({ color: '#3aa757' }, function () {
    //   //   console.log('The color is green.');
    //   // });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostSuffix: 'bigmachines.com' },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

// // Regex-pattern to check URLs against. 
// // It matches URLs like: http[s]://[...]stackoverflow.com[...]
// var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?bigmachines\.com/;

// // A function to use as callback
// function doStuffWithDom(domContent) {
//   console.log('I received the following DOM content:\n' + domContent);
// }

// // When the browser-action button is clicked...
// chrome.browserAction.onInstalled.addListener(function (tab) {
//   // ...check the URL of the active tab against our pattern and...
//   if (urlRegex.test(tab.url)) {
//     // ...if it matches, send a message specifying a callback too
//     chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDom);
//   }
// });

// chrome.browserAction.setBadgeText(object details, function callback)

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });

// chrome.browserAction.setBadgeText({text: 'ON'});
// chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if (request.contentScriptQuery == 'fetchUrl') {
//             // WARNING: SECURITY PROBLEM - a malicious web page may abuse
//             // the message handler to get access to arbitrary cross-origin
//             // resources.
//             fetch(request.url)
//                 .then(response => response.text())
//                 .then(text => sendResponse(text))
//                 .catch(error => ...)
//             return true; // Will respond asynchronously.
//         }
//     });