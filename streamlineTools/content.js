// Listen for messages
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     // If the received message has the expected format...
//     if (msg.text === 'report_back') {
//         // Call the specified callback, passing
//         // the web-page's DOM content as argument
//         sendResponse(document.all[0].outerHTML);
//     }
// });

// window.addEventListener("getChromeData", function (evt) {
//     var request = evt.detail;
//     var response = { requestId: request.id };
//     // do Chrome things with request.data, add stuff to response.data
//     window.dispatchEvent(new CustomEvent("sendChromeData", { detail: response }));
// }, false);

function fetchLocal(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest
        xhr.onload = function() {
            resolve(new Response(xhr.responseText, { status: xhr.status }))
        }
        xhr.onerror = function() {
            reject(new TypeError('Local request failed'))
        }
        xhr.open('GET', url)
        xhr.send(null)
    })
}

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                // alert(rawFile.status);
                // alert(rawFile);
                alert(allText);

            }
        }
    }
    rawFile.send(null);
}

let fileURL = "file:/Users/loganbek/Downloads/getVolumePricing.bml";
let url = chrome.runtime.getURL(fileURL);
// alert(url);

// let localFile = fetchLocal(fileURL);
// alert(localFile);

localFile2 = readTextFile(fileURL);
// alert(localFile2);

let code = "nocode";
let testCode = "PLACEHOLDER TEST CODE";

//Listen for the PassToBackground event
window.addEventListener("PassToBackground", function(evt) {
    // alert(evt);
    // chrome.runtime.sendMessage(evt.detail);
    code = evt.detail;
    // alert(code);
}, false);

//Listen for the code event
window.addEventListener("PassCodeToBackground", function(evt) {
    // alert(evt);
    // chrome.runtime.sendMessage(evt.detail);
    code = evt.detail;
    // alert(code);
}, false);


//Listen for the unloadCode event
window.addEventListener("unloadCode", function(evt) {
    // alert(evt);
    // chrome.runtime.sendMessage(evt.detail);
    code = evt.detail;
    // alert(code);
}, false);

// //Listen for the test code event
// window.addEventListener("PassTestToBackground", function (evt) {
//     // alert(evt);
//     // chrome.runtime.sendMessage(evt.detail);
//     testCode = evt.detail;
//     // alert(code);
// }, false);

// alert(frame_bm_script.editArea.textarea.value);

function injectJs(link) {
    let scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr);
    //document.body.appendChild(scr);
}

injectJs(chrome.extension.getURL('injected.js'));
// injectJs(chrome.extension.getURL('loadInjected.js'));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        let filename = document.getElementById('variableName').value;
        if (!filename) {
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
            sendResponse({
                filename: filename,
                code: code
                    // header: header,
                    // footer: footer
            });
            // } else if (request.greeting == "unloadTest") {
            //     sendResponse({
            //         filename: filename,
            //         testCode: testCode
            //     });
        } else if (request.greeting == "load") {
            console.log(request.code);
            // injectJs(chrome.extension.getURL('loadInjected.js'));
            let event = new CustomEvent("loadCode", { detail: request.code });
            window.dispatchEvent(event);
            // sendResponse({
            //     filename: filename,
            // });
        } else if (request.greeting == "filename") {
            sendResponse({
                filename: filename
            })
        }
    });