// let commentHeader = "";
// let code = "";
// let testCode = "";

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

injectJs(chrome.extension.getURL('adminConfigInjected.js'));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let filename = document.getElementById('variableName').value;
        if (filename === "") {
            filename = "nofilename";
        }
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.greeting ?
            "greeting: " + request.greeting :
            "nogreeting");
        if (request.greeting == "unload") {
            let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
            window.dispatchEvent(unloadEvent);
            // if (!code.startsWith(commentHeader)) {
            //     code = commentHeader + "\n\n" + code;
            // }
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