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
            sendResponse({
                filename: filename,
                code: code
            });
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

if (document.querySelector(".varName")) {
    filename = document.querySelector(".varName").value;
    console.log(filename);
}

if (window.document.querySelector(".varName")) {
    filename = window.document.querySelector(".varName");
    console.log(filename);
}

// #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]

if (document.querySelector('[name="variable_name"]')) {
    filename = document.querySelector('[name="variable_name"]');
}

if (window.document.querySelector('[name="variable_name"]')) {
    filename = window.document.querySelector('[name="variable_name"]');
}

chrome.storage.sync.set({ 'filename': 'filename' }, function() {
    console.log("you saved me!!");
    console.log(result.variable_name);
});


chrome.storage.sync.get(['filename'], function(result) {
    if (result.variable_name == undefined) {
        console.log("I am retrieved!!");
        console.log(result.variable_name);
    }
});