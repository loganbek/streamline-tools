// let commentHeader = "";
// let code = "";
// let testCode = "";
var code = "";
var testCode = "";

window.addEventListener('unloadCode', function(evt) {
    // frameList = window.frames;
    // console.log("frameList ->" + frameList);
    // // console.log("frameList.editAreas.value -> " + frameList.editAreas.value);
    // console.log("frameList.editAreas -> " + frameList.editAreas);
    // console.log("frameList.textArea -> " + frameList.textArea);
    // // console.log("frameList.textArea.value -> " + frameList.textArea.value);
    // console.log("frameList" + frameList.value);
    // // console.log("frameList.querySelector" + frameList.querySelector("#textarea"));
    // // #textarea
    // console.log(frameList.contentWindow);
    // console.log(document.getElementsByTagName("iframe")[0].contentWindow); // <- build on this
    // console.log(document.querySelector("#frame_x-auto-143-area"));
    // detail: frame_bm_script.editArea.textarea.value
    // /html/body/div[1]/div[3]/div[2]/textarea
    // document.querySelector("#textarea")
    // [attribute*="value"]
    // console.log()
    detail1 = "@#$@#";
    let event = new CustomEvent("PassCodeToBackground", { detail: detail1 });
    window.dispatchEvent(event);
})

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
// window.addEventListener("unloadCode", function(evt) {
//     code = evt.detail;
// }, false);

function injectJs(link) {
    let scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr);
}

injectJs(chrome.extension.getURL('adminConfigInjected.js'));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // comm rules var name
        // document.getElementById('x-auto-214-input').value;
        //TODO WILD CARD
        // let filename = document.getElementById('x-auto-3-input').value;
        // let filename = document.querySelectorAll("input[id*=x-auto-]");
        // let filename = document.getElementsByName("varName").value;
        // let filename = document.getElementById("#x-auto-3-input").value;
        let filename = "configHardCodeFileName";
        // var wldCardStrSelector = "x-auto-" + "*" + "-input";
        // var contentWindow = document.querySelectorAll(wldCardStrSelector);
        // var contentWindow = document.querySelectorAll('.page-iframe');
        console.log(filename);
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

function getElementsStartsWithId(id) {
    var children = document.body.getElementsByTagName('*');
    var elements = [],
        child;
    for (var i = 0, length = children.length; i < length; i++) {
        child = children[i];
        if (child.id.substr(0, id.length) == id)
            elements.push(child);
    }
    return elements;
}


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