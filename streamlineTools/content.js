// CONTENT_DEBUG FLAG
var CONTENT_DEBUG = false;

function logDebug(message, ...args) {
    if (CONTENT_DEBUG) {
        console.log("[CONTENT_DEBUG]", message, ...args);
    }
}

/* STUB | PRICING + UTIL CONTENT SCRIPT */

if(typeof commentHeader === "undefined"){
  var commentHeader = "// ";
  logDebug("commentHeader initialized", commentHeader);
}

if(typeof code === "undefined"){
  var code = "";
  logDebug("code initialized", code);
}

if(typeof testCode === "undefined"){
  var testCode = "";
  logDebug("testCode initialized", testCode);
}

// Listen for the PassToBackground event
window.addEventListener(
  "PassToBackground",
  function (evt) {
    code = evt.detail;
    logDebug("PassToBackground event received", code);
  },
  false
);

// Listen for the PassCommentHeader event
window.addEventListener(
  "PassCommentHeader",
  function (evt) {
    commentHeader = evt.detail;
    logDebug("PassCommentHeader event received", commentHeader);
  },
  false
);

// Listen for the code event
window.addEventListener(
  "PassCodeToBackground",
  function (evt) {
    code = evt.detail;
    logDebug("PassCodeToBackground event received", code);
  },
  false
);

// Listen for the testcode event
window.addEventListener(
  "PassTestCodeToBackground",
  function (evt) {
    testCode = evt.detail;
    logDebug("PassTestCodeToBackground event received", testCode);
  },
  false
);

// Listen for the unloadCode event
window.addEventListener(
  "unloadCode",
  function (evt) {
    code = evt.detail;
    logDebug("unloadCode event received", code);
  },
  false
);

function injectJs(link) {
  logDebug("Injecting script", link);
  const scr = document.createElement("script");
  scr.type = "text/javascript";
  scr.src = link;
  document.getElementsByTagName("head")[0].appendChild(scr);
}

injectJs(chrome.runtime.getURL("injected.js"));

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

function newFunction(filename) {
  if (filename === "") {
    filename = "nofilename";
  }
  logDebug("newFunction processed filename", filename);
  return filename;
}

// COMMAN API LISTENER TODO: FINISH
// PARTIAL PIPING CMDS

chrome.runtime.onMessage.addListener(function (message) {
  const { direction } = message;
  logDebug("Message received for direction", direction);

  if (direction === "unload_bml") {
    logDebug("unload_bml received - content.js");
  } else if (direction === "load_bml") {
    logDebug("load_bml received - content.js");
  }
});
