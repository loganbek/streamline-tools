'use strict';

let fileName;
let commentHeader;

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "filename" }, function(response) {
        console.log(response.filename);
        fileName = response.filename;
    });
});


let unloaded = false;
let unloadedTest = false;

let unloadButton = document.getElementById('unload');
let loadButton = document.getElementById('load');
let unloadTestButton = document.getElementById('unloadTest');
let loadTestButton = document.getElementById('loadTest');

chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
    suggest({
        filename: item.filename,
        conflictAction: 'overwrite'
    });
});

unloadButton.onclick = function(params) {
    console.log("unload clicked");

    let unloaded = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unload" }, function(response) {
            console.log(response.filename);
            console.log(response.code);
            if (response.code && response.filename) {
                saveText(response.filename + ".bml", response.code);
            }
        });
    });

}


let fileHandle;
loadButton.addEventListener('click', async(e) => {
    fileHandle = await window.chooseFileSystemEntries();
    console.log(fileHandle)
    const file = await fileHandle.getFile();
    const contents = await file.text();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "load", code: contents }, function(response) {
            console.log(response);
        });
    });

});

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
    fileHandle2 = await window.chooseFileSystemEntries(options);
    console.log(fileHandle2)
    const file = await fileHandle2.getFile();
    const contents = await file.text();


    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "loadTest", code: contents }, function(response) {
            console.log(response);
        });
    });
});

function saveText(filename, text) {
    let tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:bml/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
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