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

// CHROME TABS
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tab = tabs[0];
    let url = tab.url;
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

        // UNLOAD/LOAD TEST BML DISABLING
        if (url.includes("bigmachines.com/admin/commerce/rules") || url.includes("bigmachines.com/admin/configuration/rules") || url.includes("bigmachines.com/admin/commerce/actions")) {
            unloadTestButton.disabled = true;
            loadTestButton.disabled = true;
        }
        if (url.includes("bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp")) {
            executeContentScript("adminCommerceActionsContent.js");
        } else if (url.includes("bigmachines.com/admin/commerce/rules")) {
            executeContentScript("adminCommerceRulesContent.js")
        } else if (url.includes("bigmachines.com/admin/configuration/rules")) {
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

// CS
function executeContentScript(contentScriptName) {
    chrome.tabs.executeScript({
        file: contentScriptName
    });
}

// TODO: EXTERNAL LOG LINKING
logsButton.disabled = true;

// DOWNLOAD FILENAME
chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    suggest({
        filename: "bigmachines/" + bmSiteSubDomain + "/" + bmSiteType + "/" + item.filename,
        conflictAction: 'overwrite'
    });
});

// UNLOAD ONCLICK
unloadButton.onclick = function(params) {
    console.log("unload clicked");
    let unloaded = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unload" }, function(response) {
            if (response.code && response.filename) {
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