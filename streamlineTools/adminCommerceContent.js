// ADMIN COMMERCE CONTENT

function injectJs(link) {
    let scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr);
}

injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

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
            // window.dispatchEvent(unloadEvent);
            // if (!code.startsWith(commentHeader)) {
            //     code = commentHeader + "\n\n" + code;
            // }
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
        }
    });