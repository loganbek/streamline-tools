// ADMIN COMMERCE CONTENT

// function injectJs(link) {
//     let scr = document.createElement('script');
//     scr.type = "text/javascript";
//     scr.src = link;
//     document.getElementsByTagName('head')[0].appendChild(scr);
// }

// injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // let filename = document.getElementById('variableName').value;
//         // if (filename === "") {
//         //     filename = "nofilename";
//         // }
//         let filename = "addVendor_quote.beforeModify";
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(request.greeting ?
//             "greeting: " + request.greeting :
//             "nogreeting");
//         if (request.greeting == "unload") {
//             let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
//             window.dispatchEvent(unloadEvent);
//             // if (!code.startsWith(commentHeader)) {
//             //     code = commentHeader + "\n\n" + code;
//             // }
//             sendResponse({
//                 filename: filename,
//                 code: code
//             });
//         } else if (request.greeting == "load") {
//             let loadEvent = new CustomEvent("loadCode", { detail: request.code });
//             window.dispatchEvent(loadEvent);
//             // } else if (request.greeting == "filename") {
//             //     sendResponse({
//             //         filename: filename
//             //     });
//         }
//         // return true; - DOESNT FIX
//     });

// let commentHeader = "";
// let code = "";
// let testCode = "";
var code = "";
var testCode = "";
// var filename = filename || "";
var filename;
var filenameAfter;
var filenameBefore;

// if (document.getElementById("#x-auto-3-input")) {
//     filename = document.getElementById("#x-auto-3-input").value;
//     // document.querySelector("#x-auto-3-input")
//     console.log(filename);
// }

// if (window.document.getElementById("#x-auto-3-input")) {
//     filename = window.document.getElementById("#x-auto-3-input").value;
//     console.log(filename)
// }

//Listen for the PassToBackground event
window.addEventListener("PassToBackground", function(evt) {
    code = evt.detail;
}, false);

//Listen for the PassCommentHeader event
window.addEventListener("PassCommentHeader", function(evt) {
    commentHeader = evt.detail;
}, false);

//Listen for the code event
window.addEventListener("PassCodeToBackground", function(evt) {
    code = evt.detail;
}, false);

//Listen for the testcode event
window.addEventListener("PassTestCodeToBackground", function(evt) {
    testCode = evt.detail;
}, false);

//Listen for the unloadCode event
window.addEventListener("unloadCode", function(evt) {
    code = evt.detail;
}, false);

function injectJs(link) {
    let scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr);
}

injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

// var x = (x === undefined) ? your_default_value : x;
// let filename2 = (filename2 === undefined) ? document.querySelectorAll("input[id^=x-auto]")[1].value : filename2;
// alert(filename2);
// let ruleName = (ruleName === undefined) ? document.querySelector("input[name='variable_name']").value : ruleName;
// alert(ruleName);
// var ruleNameSelector = document.querySelector("input[name='variable_name']").value;
// var ruleName = (typeof ruleName === 'undefined') ? document.querySelector("input[name='variable_name']").value : ruleName;
// alert(ruleName);
// let ruleType = (ruleType === undefined) ? window.name : ruleType;
// alert(ruleType);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // let filename2 = document.querySelectorAll("input[id^=x-auto]")[1].value;
        // alert(filename2);
        // let ruleName = document.querySelector("input[name='variable_name']").value;
        // alert(ruleName);
        // let ruleType = window.name;
        // alert(ruleType);
        // let filename = ruleName + "." + ruleType;
        // alert(filename);
        // let filename = "commerceRuleName";
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.greeting ?
            "greeting: " + request.greeting :
            "nogreeting");
        if (request.greeting == "unload") {
            let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
            window.dispatchEvent(unloadEvent);
            // if (document.getElementsByName('varName').length > 0) {
            //     filename = document.getElementsByName('varName')[0].value;
            // }
            // if (!document.title.includes("After") && !document.title.includes("Before")) {
            chrome.storage.sync.get(['commerceFileName'], function(result) {
                console.log('Value currently is ' + result.key);
                if (result.key !== undefined) {
                    filename = result.key;
                }
            });
            // }
            // ACTIONS BEFORE/AFTER FORMULAS FN
            // if (document.title.includes("After")) {
            //     // SYNC
            //     // var filenameAfter;
            //     // chrome.storage.sync.get(['commerceFileName'], function(result) {
            //     //     filenameAfter = result.commerceFileName;
            //     //     console.log(filenameAfter);
            //     // });
            //     // console.log(filenameAfter);
            //     // console.log("includes after");
            //     // console.log(filename);
            //     // filename = filename + ".afterFormulas";
            //     // console.log(filename);
            //     // chrome.storage.sync.get(['commerceFileName'], function(result) {
            //     //     console.log('Value currently is ' + result.key);
            //     //     if (result.key !== undefined) {
            //     //         filename = result.key;
            //     //     }
            //     //     var filenameAfterFinal = filename + ".afterFormulas";
            //     //     console.log(filenameAfterFinal);
            //     //     filename = filenameAfterFinal;
            //     // });

            //     // var filenameAfterFinal = filename + ".afterFormulas";
            //     // console.log(filenameAfterFinal);
            //     // chrome.storage.sync.set({ 'commerceFileName': filenameAfterFinal }, function() {
            //     //     console.log("you saved me!! comm action after");
            //     //     console.log(filenameAfterFinal);
            //     // });
            //     // filename = filenameAfterFinal;
            // } else if (document.title.includes("Before")) {
            //     // SYNC
            //     // var filenameBefore;
            //     // chrome.storage.sync.get(['commerceFileName'], function(result) {
            //     //     filenameBefore = result.commerceFileName;
            //     //     console.log(filenameBefore);
            //     // });
            //     // console.log(filenameBefore);
            //     console.log("includes before");
            //     // chrome.storage.sync.get(['commerceFileName'], function(result) {
            //     //     console.log('Value currently is ' + result.key);
            //     //     if (result.key !== undefined) {
            //     //         filename = result.key;
            //     //     }
            //     //     var filenameBeforeFinal = filename + ".beforeFormulas";
            //     //     console.log(filenameBeforeFinal);
            //     //     filename = filenameBeforeFinal;
            //     // });
            //     // console.log(filename);
            //     // filename = filename + ".beforeFormulas";
            //     // console.log(filename);
            //     // var filenameBeforeFinal = filename + ".beforeFormulas";
            //     // console.log(filenameBeforeFinal);
            //     // chrome.storage.sync.set({ 'commerceFileName': filenameBeforeFinal }, function() {
            //     //     console.log("you saved me!! comm action before");
            //     //     console.log(filenameBeforeFinal);
            //     // });
            //     // filename = filenameBeforeFinal;
            //     beforeFileName = filename + ".beforeFormulas";
            //     console.log(beforeFileName);
            //     sendResponse({
            //         filename: beforeFileName,
            //         code: code
            //     });
            //     // break;
            // } else {
            sendResponse({
                filename: filename,
                code: code
            });
            // }
        } else if (request.greeting == "unloadTest") {
            let unloadTestEvent = new CustomEvent("unloadTestCode", { detail: request.code });
            window.dispatchEvent(unloadTestEvent);
            sendResponse({
                filename: filename,
                testCode: testCode
            });
        } else if (request.greeting == "load") {
            let loadEvent = new CustomEvent("loadCode", { detail: request.code });
            window.dispatchEvent(loadEvent);
        } else if (request.greeting == "loadTest") {
            console.log(request.code);
            let loadTestEvent = new CustomEvent("loadTestCode", { detail: request.code });
            window.dispatchEvent(loadTestEvent);
        } else if (request.greeting == "filename") {
            sendResponse({
                filename: filename
            });
            // return true;
        }
        // return true;
    });


//OLD CONTENT SCRIPT MANIFEST
// "content_scripts": [{
//     "matches": [
//         "*://*.bigmachines.com/*"
//     ],
//     "js": [
//         "jsonpath-1.0.2.js",
//         "content.js"
//     ],
//     "all_frames": true
// }],

// ```html <input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" readonly="" disabled="" style="width: 260px;">```

// if (document.querySelector("#x-auto-3-input")) {
//     filename = document.querySelector("#x-auto-3-input").value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
// }


// let elements = document.getElementsByClassName("varName");
// console.log(elements);

// if (elements[0]) {
//     console.log(elements[0].value);
//     console.log(elements[0].nodeValue);
//     filename = elements[0].value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
//     console.log(filename);
// }

// if (window.document.querySelector(".varName")) {
//     filename = window.document.querySelector(".varName");
//     console.log(filename);
// }

// #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]

// WIP COMMERCE FN TRIALS

// if (document.getElementsByName('varName')[0]) {
// filename = document.getElementsByName('varName')[0].value;
// console.log(filename);
// }

// if (document.querySelector('[name="variable_name"]')) {
//     filename = document.querySelector('[name="variable_name"]');
// }

// if (window.document.querySelector('[name="variable_name"]')) {
//     filename = window.document.querySelector('[name="variable_name"]');
// }
// if (document.getElementsByName('varName').length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm rules");
//         console.log(filename);
//         // console.log(result.variable_name);
//     });
// }

// if ((document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== null) && (document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== undefined)) {
//     filename = document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]").value;
//     // commActionFileName = commActionFileNameElement.innertext;
//     // #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]
//     console.log(filename);

//     // console.log(commActionFileName);
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filename);
//     });
// }

if (document.getElementsByName('varName').length > 0) {
    filename = document.getElementsByName('varName')[0].value;
    chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
        console.log("you saved me!! comm rules");
        console.log(filename);
        // console.log(result.variable_name);
    });
}

if ((document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== null) && (document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== undefined)) {
    filename = document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]").value;
    // commActionFileName = commActionFileNameElement.innertext;
    // #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]
    console.log(filename);

    // console.log(commActionFileName);
    chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
        console.log("you saved me!! comm action");
        console.log(filename);
    });
}

// // ACTIONS BEFORE/AFTER FORMULAS FN
// if (document.title.includes("After")) {
//     // SYNC
//     // var filenameAfter;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameAfter = result.commerceFileName;
//         console.log(filenameAfter);
//     });
//     console.log(filenameAfter);
//     var filenameAfterFinal = filenameAfter + ".afterFormulas";
//     console.log(filenameAfterFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameAfterFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameAfterFinal);
//     });
// }
// if (document.title.includes("Before")) {
//     // SYNC
//     // var filenameBefore;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameBefore = result.commerceFileName;
//         console.log(filenameBefore);
//     });
//     console.log(filenameBefore);
//     var filenameBeforeFinal = filenameBefore + ".beforeFormulas";
//     console.log(filenameBeforeFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameBeforeFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameBeforeFinal);
//     });
// }