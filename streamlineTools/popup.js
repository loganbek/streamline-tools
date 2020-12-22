'use strict';

// VARS
let fileName;
let commentHeader;
let url;
let bmSiteSubDomain;
var bmSiteType;
let header;

// FLAGS
let unloaded = false;
let unloadedTest = false;

// BUTTONS
let unloadButton = document.getElementById('unload');
let loadButton = document.getElementById('load');
let unloadTestButton = document.getElementById('unloadTest');
let loadTestButton = document.getElementById('loadTest');
let optionsButton = document.getElementById('options');
let logsButton = document.getElementById('logs');

// chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
//     document.write(`<h3>The tabs you're on are:</h3>`);
//     document.write('<ul>');
//     for (let i = 0; i < tabs.length; i++) {
//       document.write(`<li>${tabs[i].url}</li>`);
//     }
//     document.write('</ul>');
//   });

// CHROME TABS
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tab = tabs[0];
    // console.log("TAB");
    // alert(tab);
    let url = tab.url;
    // console.log(tab.url);
    let full = url;
    let parts = full.split('.');
    let sub = parts[0];
    let domain = parts[1];
    let type = parts[2];
    console.log(sub);
    let bmSiteParts = sub.split('//');
    let bmSite = bmSiteParts[1];
    console.log(bmSite);
    bmSiteSubDomain = bmSite;
    console.log(domain);
    console.log(type);
    bmSiteType = "commerce";
    console.log(bmSiteType);
    if (url !== undefined) {

        //BML SITE TYPE TODO
        // COMMERCE + UTIL HEADER
        // .innerHTML.includes("Util");



        // header = document.querySelector(".x-panel-header-text");
        // isUtil = header.innerHTML.includes("Util");
        // isCommerce = header.innerHTML.includes("Commerce");

        // if (header && header.innerHTML.includes("Commerce")) {
        //     bmSiteType = "commerce";
        // } else if (header && header.innerHTML.includes("Util")) {
        //     bmSiteType = "util"
        // } else {
        //     bmSiteType = "configuration"
        // }

        // if (document.querySelector(".xpanel-header-text")) {
        //     header = document.querySelector(".x-panel-header-text");
        //     isUtil = header.innerHTML.includes("Util");
        //     isCommerce = header.innerHTML.includes("Commerce");
        //     if (isCommerce) {
        //         bmSiteType = "commerce";
        //     } else if (isUtil) {
        //         bmSiteType = "util";
        //     } else {
        //         bmSiteType = "configuration"
        //     }
        //     // TODO fix configuration
        // }

        //TEST BML DISABLING
        if (url.includes("bigmachines.com/admin/commerce/rules") || url.includes("bigmachines.com/admin/configuration/rules")) {

            // alert(url.includes("bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp"));
            // INITIAL content.js LOADING
            // executeContentScript("adminCommerceContent.js");
            // unloadTestButton.style.visibility = "hidden";
            // loadTestButton.style.visibility = "hidden";
            unloadTestButton.disabled = true;
            loadTestButton.disabled = true;
        }
        if (url.includes("bigmachines.com/admin/commerce/rules")) {
            executeContentScript("adminCommerceContent.js");
        }
        if (url.includes("bigmachines.com/admin/configuration/rules")) {
            bmSiteType = "configuration";
            executeContentScript("adminConfigContent.js");
        }
    }
    if (url.includes("bigmachines.com/spring/")) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "filename" }, function(response) {
            if (response !== undefined) {
                console.log(response.filename);
                fileName = response.filename;
            }
        });
        executeContentScript("content.js");
    }
});

function executeContentScript(contentScriptName) {
    chrome.tabs.executeScript({
        file: contentScriptName
    });
}

// TODO: LOG LINKING
logsButton.disabled = true;

// chrome.tabs.query({
//     active: true,
//     lastFocusedWindow: true
// }, function(tabs) {
//     // and use that tab to fill in out title and url
//     var tab = tabs[0];
//     console.log("url :", tab.url);
//     // alert(tab.url);
//     url = tab.url;
// });

// alert(url);

// TEST BUTTON HIDING
// if (url !== undefined) {
//     alert(url.includes("bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp"));
//     if (url.includes("bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp")) {
//         unloadTestButton.style.visibility = "hidden";
//         loadTestButton.style.visibility = "hidden";
//         unloadTestButton.disabled = true;
//         loadTestButton.disabled = true;
//     }
// }

// unloadTestButton.disabled = true;
// loadTestButton.disabled = true;

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    suggest({
        filename: "bigmachines/" + bmSiteSubDomain + "/" + bmSiteType + "/" + item.filename,
        conflictAction: 'overwrite'
    });
});

// UNLOAD ONCLICK
unloadButton.onclick = function(params) {
    console.log("unload clicked");
    // if (document.querySelector(".xpanel-header-text")) {
    //     header = document.querySelector(".x-panel-header-text");
    //     isUtil = header.innerHTML.includes("Util");
    //     isCommerce = header.innerHTML.includes("Commerce");
    //     if (isCommerce) {
    //         bmSiteType = "commerce";
    //     } else if (isUtil) {
    //         bmSiteType = "util";
    //     } else {
    //         bmSiteType = "configuration"
    //     }
    //     // TODO fix configuration
    // }
    let unloaded = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unload" }, function(response) {
            console.log(response.filename);
            console.log(response.code);

            //             WIP COMMERCE RULES FN
            if (tabs[0].url.includes("bigmachines.com/admin/commerce/rules")) {
                chrome.storage.sync.get(['commerceFileName'], function(result) {
                    if (result.commerceFileName !== undefined) {
                        console.log("I am retrieved!!");
                        console.log(result.commerceFileName);
                        // response.filename = result.commerceFileName;
                        saveText(result.commerceFileName + ".bml", response.code);
                    }
                });
            } else if (response.code && response.filename) {
                saveText(response.filename + ".bml", response.code);
            }
        });
    });

}

// LOAD ONCLICK
let fileHandle;
loadButton.addEventListener('click', async(e) => {
    // fileHandle = await window.chooseFileSystemEntries();
    [fileHandle] = await window.showOpenFilePicker();
    console.log(fileHandle);
    const file = await fileHandle.getFile();
    const contents = await file.text();
    console.log(contents);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "load", code: contents }, function(response) {
            console.log(response);
        });
    });

});

// let fileHandle;
// butOpenFile.addEventListener('click', async () => {
//   [fileHandle] = await window.showOpenFilePicker();
//   const file = await fileHandle.getFile();
//   const contents = await file.text();
//   textArea.value = contents;
// });

// UNLOAD TEST ONCLICK
unloadTestButton.onclick = function(params) {
    console.log("unloadTest clicked");
    let unloadedTest = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unloadTest" }, function(response) {
            console.log(response.filename);
            console.log(response.testCode);
            if (response.testCode && response.filename) {
                saveText(response.filename + ".test" + ".bml", response.testCode);
            }
        });
    });
}

// LOAD TEST ONCLICK
let fileHandle2;
loadTestButton.addEventListener('click', async(e) => {
    const options = {
        types: [{
            accept: {
                'bml/plain': '.test.bml'
            }
        }, ],
        excludeAcceptAllOption: true
    };
    //    [fileHandle2] = await window.showOpenFilePicker(options);
    [fileHandle2] = await window.showOpenFilePicker();
    console.log(fileHandle2);
    const file = await fileHandle2.getFile();
    const contents = await file.text();


    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "loadTest", code: contents }, function(response) {
            console.log(response);
        });
    });
});

// FILE SAVE
function saveText(filename, text) {
    let tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:bml/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

// OPTIONS HANDLER
optionsButton.onclick = function(params) {
    // alert("optionsClicked");
    window.location = '/options.html';
}


// const options = {
//     types: [
//       {
//         description: 'Text Files',
//         accept: {
//           'text/plain': ['.txt', '.text'],
//           'text/html': ['.html', '.htm']
//         }
//       },
//       {
//         description: 'Images',
//         accept: {
//           'image/*': ['.png', '.gif', '.jpeg', '.jpg']
//         }
//       }
//     ],

// const options = {
//     types: [
//       {
//         accept: {
//           'image/svg+xml': '.svg'
//         }
//       },
//     ],
//     excludeAcceptAllOption: true
//   };