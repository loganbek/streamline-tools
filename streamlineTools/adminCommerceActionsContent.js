// ADMIN COMMERCE ACTIONS CONTENT

// VARS
var code = "";
var filename;

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

injectJs(chrome.extension.getURL('adminCommerceRulesInjected.js'));

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
            // chrome.storage.sync.get(['commerceFileName'], function(result) {
            //     console.log('Value currently is ' + result.key);
            //     if (result.key !== undefined) {
            //         filename = result.key;
            //     }
            // });
            // EDITOR PAGE CODE
            if (document.getElementsByClassName("bottom-bar")[0].innerHTML.length > 0) {
                let fileString = document.getElementsByClassName("bottom-bar")[0].innerHTML;
                fileStringArray = fileString.split("&gt;");
                console.log(fileStringArray);
                console.log(fileStringArray[fileStringArray.length - 1]);
                fileString = camelCase(fileStringArray[fileStringArray.length - 1]);
                console.log(fileString);
                let lc = fileString[0].toLowerCase();
                console.log(fileString);
                fileString = lc + fileString.substring(1);
                console.log(fileString);

                // ACTION SPECIFIC LOGIC (BEFORE/AFTER + action_id)
                // LABEL.AFTER/BEFORE.ACTION_ID

                // BEFORE / AFTER
                let fullTitle = document.title;
                console.log(fullTitle);

                if (document.title.includes("After")) {
                    fileString += ".afterFormulas";
                } else if (document.title.includes("Before")) {
                    fileString += ".beforeFormulas";
                }

                // ACTION_ID
                // console.log(document.url);
                // body > table > tbody > tr > td > form > input[type=hidden]:nth-child(10)
                let actionElements = document.getElementsByName("action_id");
                console.log(actionElements);
                console.log(actionElements[0]);
                console.log(actionElements[0].value);
                fileString += "." + actionElements[0].value;
                console.log(fileString);
                filename = fileString;
            };
            sendResponse({
                filename: filename,
                code: code
            });
        } else if (request.greeting == "load") {
            let loadEvent = new CustomEvent("loadCode", { detail: request.code });
            window.dispatchEvent(loadEvent);
        } else if (request.greeting == "filename") {
            sendResponse({
                filename: filename
            });
        } else if (request.greeting == "commerceFilename") {
            sendResponse({
                filename: "commerceRulesFileNameFromCS"
            });
        }
    });

// EDITOR PAGE CODE
// if (document.getElementsByClassName("bottom-bar")[0].innerHTML.length > 0) {
//     let fileString = document.getElementsByClassName("bottom-bar")[0].innerHTML;
//     fileStringArray = fileString.split("&gt;");
//     console.log(fileStringArray);
//     console.log(fileStringArray[fileStringArray.length - 1]);
//     fileString = camelCase(fileStringArray[fileStringArray.length - 1]);
//     console.log(fileString);
//     let lc = fileString[0].toLowerCase();
//     console.log(fileString);
//     fileString = lc + fileString.substring(1);
//     console.log(fileString);

//     // ACTION SPECIFIC LOGIC (BEFORE/AFTER + action_id)
//     // LABEL.AFTER/BEFORE.ACTION_ID

//     // BEFORE / AFTER
//     let fullTitle = document.getElementsByTagName("title");
//     console.log(fullTitle);

//     if (document.title.includes("After")) {
//         fileString += ".afterFormulas";
//     } else if (document.title.includes("Before")) {
//         fileString += ".beforeFormulas";
//     }

//     // ACTION_ID
//     console.log(document.url);
// };

// TO CAMELCASE FUNCTION
function camelCase(str) {
    return (str.slice(0, 1).toLowerCase() + str.slice(1))
        .replace(/([-_ ]){1,}/g, ' ')
        .split(/[-_ ]/)
        .reduce((cur, acc) => {
            return cur + acc[0].toUpperCase() + acc.substring(1);
        });
}

// VARNAME PAGE CODE
// if (document.getElementsByName('varName').length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm rules");
//         console.log(filename);
//         // console.log(result.variable_name);
//     });
// }