/* STUB | PRICING + UTIL CONTENT SCRIPT */

// let commentHeader;
// try {
  // if (!commentHeader) {
    // commentHeader = "";
  // }
// } catch (e) {
  // console.log(e);
// }
// let commentHeader = ''
// let code = "";
// let testCode = "";

if(typeof commentHeader === "undefined"){
  var commentHeader = "";
}

if(typeof code === "undefined"){
  var code = "";
}

if(typeof testCode === "undefined"){
  var testCode = "";
}

// Listen for the PassToBackground event
window.addEventListener(
  "PassToBackground",
  function (evt) {
    code = evt.detail;
  },
  false
);

// Listen for the PassCommentHeader event
window.addEventListener(
  "PassCommentHeader",
  function (evt) {
    commentHeader = evt.detail;
  },
  false
);

// Listen for the code event
window.addEventListener(
  "PassCodeToBackground",
  function (evt) {
    code = evt.detail;
  },
  false
);

// Listen for the testcode event
window.addEventListener(
  "PassTestCodeToBackground",
  function (evt) {
    testCode = evt.detail;
  },
  false
);

// Listen for the unloadCode event
window.addEventListener(
  "unloadCode",
  function (evt) {
    code = evt.detail;
  },
  false
);

function injectJs(link) {
  const scr = document.createElement("script");
  scr.type = "text/javascript";
  scr.src = link;
  document.getElementsByTagName("head")[0].appendChild(scr);
}

injectJs(chrome.runtime.getURL("injected.js"));

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let filename = document.getElementById("variableName").value;
  filename = newFunction(filename);
  /* console.log(sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension')
    console.log(request.greeting
      ? 'greeting: ' + request.greeting
      : 'nogreeting') */
  if (request.greeting == "unload") {
    const unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
    window.dispatchEvent(unloadEvent);
    // console.log('CH')
    // console.log(contentHeader)
    if (code != null) {
      if (!code.startsWith(commentHeader)) {
        code = commentHeader + "\n\n" + code;
      } else {
        code = code;
      }
    }
    sendResponse({
      filename: filename,
      code: code,
    });
  } else if (request.greeting == "unloadTest") {
    const unloadTestEvent = new CustomEvent("unloadTestCode", {
      detail: request.code,
    });
    window.dispatchEvent(unloadTestEvent);
    sendResponse({
      filename: filename,
      testCode: testCode,
    });
  } else if (request.greeting == "load") {
    const loadEvent = new CustomEvent("loadCode", { detail: request.code });
    window.dispatchEvent(loadEvent);
  } else if (request.greeting == "loadTest") {
    console.log(request.code);
    const loadTestEvent = new CustomEvent("loadTestCode", {
      detail: request.code,
    });
    window.dispatchEvent(loadTestEvent);
  } else if (request.greeting == "filename") {
    sendResponse({
      filename: filename,
    });
  }
});

function newFunction(filename) {
  if (filename === "") {
    filename = "nofilename";
  }
  return filename;
}

// COMMAN API LISTENER TODO: FINISH
// PARTIAL PIPING CMDS

// FIXME
chrome.runtime.onMessage.addListener(function (message) {
  const { direction } = message;
  direction === "unload_bml"
    ? "unload_bml received - content.js"
    : "load_bml received - content.js";
  console.log(direction);
});
