// CONTENT_DEBUG FLAG
var CONTENT_DEBUG = true;

function logDebug(message, ...args) {
    if (CONTENT_DEBUG) {
        console.log("[CONTENT_DEBUG]", message, ...args);
    }
}

// Initialize variables
if (typeof commentHeader === "undefined") {
  var commentHeader = "// ";
  logDebug("commentHeader initialized", commentHeader);
}

if (typeof code === "undefined") {
  var code = "";
  logDebug("code initialized", code);
}

if (typeof testCode === "undefined") {
  var testCode = "";
  logDebug("testCode initialized", testCode);
}

// Event listeners for custom events
window.addEventListener("PassToBackground", function (evt) {
  code = evt.detail;
  logDebug("PassToBackground event received", code);
}, false);

window.addEventListener("PassCommentHeader", function (evt) {
  commentHeader = evt.detail;
  logDebug("PassCommentHeader event received", commentHeader);
}, false);

window.addEventListener("PassCodeToBackground", function (evt) {
  code = evt.detail;
  logDebug("PassCodeToBackground event received", code);
}, false);

window.addEventListener("PassTestCodeToBackground", function (evt) {
  testCode = evt.detail;
  logDebug("PassTestCodeToBackground event received", testCode);
}, false);

window.addEventListener("unloadCode", function (evt) {
  code = evt.detail;
  logDebug("unloadCode event received", code);
}, false);

// Function to inject a script into the page
function injectJs(link) {
  logDebug("Injecting script", link);
  const scr = document.createElement("script");
  scr.type = "text/javascript";
  scr.src = link;
  document.getElementsByTagName("head")[0].appendChild(scr);
}

// Inject the main script
injectJs(chrome.runtime.getURL("injected.js"));

// Message listener for communication with background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  logDebug("Message received", request);

  let filename = document.getElementById("variableName").value;
  filename = newFunction(filename);
  logDebug("Filename processed", filename);

  if (request.greeting == "unload") {
    logDebug("Processing unload request");
    const unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
    window.dispatchEvent(unloadEvent);

    if (code != null) {
      if (!code.startsWith(commentHeader)) {
        code = commentHeader + "\n\n" + code;
      }
    }

    let isUtil = document.querySelector('span[id^="ext-gen"]').innerHTML.includes("Util");

    if(isUtil){
      foldername = "util"
    } else {
      foldername = "comm"
    }

    sendResponse({
      filename: filename,
      foldername: foldername,
      code: code,
    });
    logDebug("Unload response sent", filename, code);
  } else if (request.greeting == "unloadTest") {
    logDebug("Processing unloadTest request");
    const unloadTestEvent = new CustomEvent("unloadTestCode", {
      detail: request.code,
    });
    window.dispatchEvent(unloadTestEvent);

    sendResponse({
      filename: filename,
      testCode: testCode,
    });
    logDebug("UnloadTest response sent", filename, testCode);
  } else if (request.greeting == "load") {
    logDebug("Processing load request", request.code);
    const loadEvent = new CustomEvent("loadCode", { detail: request.code });
    window.dispatchEvent(loadEvent);
  } else if (request.greeting == "loadTest") {
    logDebug("Processing loadTest request", request.code);
    const loadTestEvent = new CustomEvent("loadTestCode", {
      detail: request.code,
    });
    window.dispatchEvent(loadTestEvent);
  } else if (request.greeting == "filename") {
    sendResponse({
      filename: filename,
    });
    logDebug("Filename request handled", filename);
  }
});

// Function to process filename
function newFunction(filename) {
  if (filename === "") {
    filename = "nofilename";
  }
  logDebug("newFunction processed filename", filename);
  return filename;
}

// Command API listener
chrome.runtime.onMessage.addListener(function (message) {
  const { direction } = message;
  logDebug("Message received for direction", direction);

  if (direction === "unload_bml") {
    logDebug("unload_bml received - content.js");
  } else if (direction === "load_bml") {
    logDebug("load_bml received - content.js");
  }
});
