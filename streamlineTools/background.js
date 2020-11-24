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
                // pageUrl: { pathContains: 'bigmachines.com/spring' },
                // pageUrl: { urlMatches: 'bigmachines.com/spring|bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp|bigmachines.com/admin/configuration/rules/edit_rule.jsp' },
                pageUrl: { urlMatches: 'bigmachines.com/spring|bigmachines.com/admin/commerce/rules/|bigmachines.com/admin/configuration/rules/' },
                // pageUrl: { urlContains: 'bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp' },
                // pageUrl: { hostSuffix: 'bigmachines.com' },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

// chrome.storage.sync.set({ 'filename': 'testFileName' }, function() {
//     console.log("you saved me!!");
// });

// chrome.storage.sync.get(['filename'], function(result) {
//             if (result.variable_name == undefined) {
//                 console.log("I am retrieved!!");
//             }
//         }

// var rule1 = {
//     conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: 'www.google.com', schemes: ['https'] },
//             css: ["input[type='password']"]
//         })
//     ],
//     actions: [new chrome.declarativeContent.ShowPageAction()]
// };

// var rule2 = {
//     conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: 'www.google.com', schemes: ['https'] },
//             css: ["input[type='password']"]
//         }),
//         new chrome.declarativeContent.PageStateMatcher({
//             css: ["video"]
//         })
//     ],
//     actions: [new chrome.declarativeContent.ShowPageAction()]
// };

// chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//         chrome.declarativeContent.onPageChanged.addRules([rule2]);
//     });
// });

// chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//       chrome.declarativeContent.onPageChanged.addRules([rule2]);
//     });
//   });

// CSS Matching
// PageStateMatcher.css conditions must be compound selectors, meaning that you can't include combinators like whitespace or ">" in your selectors. This helps Chrome match the selectors more efficiently.

// Compound Selectors (OK)	Complex Selectors (Not OK)
// a	div p
// iframe.special[src^='http']	p>span.highlight
// ns|*	p + ol
// #abcd:checked	p::first-line
// CSS conditions only match displayed elements: if an element that matches your selector is display:none or one of its parent elements is display:none, it doesn't cause the condition to match. Elements styled with visibility:hidden, positioned off-screen, or hidden by other elements can still make your condition match.



// Matches if the conditions of the UrlFilter are fulfilled for the top-level URL of the page.

// string	(optional) hostContains	
// Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.

// string	(optional) hostEquals	
// Matches if the host name of the URL is equal to a specified string.

// string	(optional) hostPrefix	
// Matches if the host name of the URL starts with a specified string.

// string	(optional) hostSuffix	
// Matches if the host name of the URL ends with a specified string.

// string	(optional) pathContains	
// Matches if the path segment of the URL contains a specified string.

// string	(optional) pathEquals	
// Matches if the path segment of the URL is equal to a specified string.

// string	(optional) pathPrefix	
// Matches if the path segment of the URL starts with a specified string.

// string	(optional) pathSuffix	
// Matches if the path segment of the URL ends with a specified string.

// string	(optional) queryContains	
// Matches if the query segment of the URL contains a specified string.

// string	(optional) queryEquals	
// Matches if the query segment of the URL is equal to a specified string.

// string	(optional) queryPrefix	
// Matches if the query segment of the URL starts with a specified string.

// string	(optional) querySuffix	
// Matches if the query segment of the URL ends with a specified string.

// string	(optional) urlContains	
// Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.

// string	(optional) urlEquals	
// Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.

// string	(optional) urlMatches	
// Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.

// string	(optional) originAndPathMatches	
// Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.

// string	(optional) urlPrefix	
// Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.

// string	(optional) urlSuffix	
// Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.

// array of string	(optional) schemes	
// Matches if the scheme of the URL is equal to any of the schemes specified in the array.

// array of integer or array of integer	(optional) ports	
// Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.

// chrome.browserAction.setBadgeText({ text: 'ON' });
// chrome.browserAction.setBadgeBackgroundColor({ color: '#4688F1' })

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

// Commerce Functions - "https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}}&token=cplHV3EHCvzBzOvLBAgOhoKF4m8";
// Util Functions - "https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274172483%27,folder_id:%274133367%27,process_id:%27-1%27,doc_id:%27-1%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274172483%27,folder_id:%274133367%27,process_id:%27-1%27,doc_id:%27-1%27}}&token=cplHV3EHCvzBzOvLBAgOhoKF4m8";