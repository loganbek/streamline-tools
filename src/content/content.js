const CONTENT_DEBUG = true;

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
window.addEventListener(
  "PassToBackground",
  function (evt) {
    code = evt.detail;
    logDebug("PassToBackground event received", code);
  },
  false
);

window.addEventListener(
  "PassCommentHeader",
  function (evt) {
    commentHeader = evt.detail;
    logDebug("PassCommentHeader event received", commentHeader);
  },
  false
);

window.addEventListener(
  "PassCodeToBackground",
  function (evt) {
    code = evt.detail;
    logDebug("PassCodeToBackground event received", code);
  },
  false
);

window.addEventListener(
  "PassTestCodeToBackground",
  function (evt) {
    testCode = evt.detail;
    logDebug("PassTestCodeToBackground event received", testCode);
  },
  false
);

window.addEventListener(
  "unloadCode",
  function (evt) {
    code = evt.detail;
    logDebug("unloadCode event received", code);
  },
  false
);

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

  let filename = document.getElementById("variableName")?.value || "nofilename";
  filename = processFilename(filename);
  logDebug("Filename processed", filename);

  switch (request.greeting) {
    case "unload":
      logDebug("Processing unload request");
      const unloadEvent = new CustomEvent("unloadCode", {
        detail: request.code,
      });
      window.dispatchEvent(unloadEvent);

      if (code && !code.startsWith(commentHeader)) {
        code = commentHeader + "\n\n" + code;
      }

      const isUtil = document
        .querySelector('span[id^="ext-gen"]')
        ?.innerHTML.includes("Util");
      const foldername = isUtil ? "util" : "comm";

      sendResponse({
        filename: filename,
        foldername: foldername,
        code: code,
      });
      logDebug("Unload response sent", filename, code);
      break;

    case "unloadTest":
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
      break;

    case "load":
      logDebug("Processing load request", request.code);
      const loadEvent = new CustomEvent("loadCode", { detail: request.code });
      window.dispatchEvent(loadEvent);
      break;

    case "loadTest":
      logDebug("Processing loadTest request", request.code);
      const loadTestEvent = new CustomEvent("loadTestCode", {
        detail: request.code,
      });
      window.dispatchEvent(loadTestEvent);
      break;

    case "filename":
      sendResponse({ filename: filename });
      logDebug("Filename request handled", filename);
      break;

    case "unloadHeader":
      const headerCode = document.querySelector("#header_content")?.value || "";
      logDebug("Unloading header code");
      sendResponse({ code: headerCode });
      break;

    case "loadHeader":
      logDebug("Loading header code");
      if (document.querySelector("#header_content")) {
        document.querySelector("#header_content").value = request.code;
      }
      sendResponse({ status: "Header loaded successfully" });
      break;

    case "unloadHeaderHTML":
      const headerHTMLCode =
        document.getElementsByName("header")[0].childNodes[0] || "";
      logDebug("Unloading header HTML code");
      sendResponse({ code: headerHTMLCode });
      break;

    case "unloadFooterHTML":
      const footerHTMLCode =
        document.getElementsByName("footer")[0].childNodes[0] || "";
      logDebug("Unloading footer HTML code");
      sendResponse({ code: footerHTMLCode });
      break;

    case "unloadFooter":
      const footerCode = document.querySelector("#footer_content")?.value || "";
      logDebug("Unloading footer code");
      sendResponse({ code: footerCode });
      break;

    case "loadFooter":
      logDebug("Loading footer code");
      if (document.querySelector("#footer_content")) {
        document.querySelector("#footer_content").value = request.code;
      }
      sendResponse({ status: "Footer loaded successfully" });
      break;

    default:
      logDebug("Unknown request received", request.greeting);
  }
  return true;
});

// Function to process filename
function processFilename(filename) {
  if (!filename) {
    filename = "nofilename";
  }
  logDebug("processFilename processed filename", filename);
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

logDebug("Content script loaded");

// Message listener for popupHeaderFooterHTML.js interactions
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  logDebug("Message received:", request);

  switch (request.greeting) {
      case 'unloadHeaderHTML': {
        let headerHTMLCode = document.querySelector('textarea[name="header"]')?.value || "";
        // const headerHTMLCode = document.querySelector('textarea[name="header"]')?.value || "";
        logDebug("Unloading header code", headerHTMLCode);
        sendResponse({ code: headerHTMLCode });
        break;
      }
      case 'loadHeaderHTML': {
          let headerHTMLCode = request.code;
          logDebug("Loading header code", headerHTMLCode);
          sendResponse({ status: "Header loaded successfully" });
          break;
      }
      case 'unloadFooterHTML': {
          let footerHTMLCode = document.querySelector('textarea[name="footer"]')?.value || "";
          logDebug("Unloading footer code", footerHTMLCode);
          sendResponse({ code: footerHTMLCode });
          break;
      }

      case 'loadFooterHTML': {
          let footerHTMLCode = request.code;
          logDebug("Loading footer code", footerHTMLCode);
          sendResponse({ status: "Footer loaded successfully" });
          break;
      }
  }
  return true;
});

/**
 * Dynamically fetch rule configurations from rulesList.json.
 * @returns {Promise<Object[]>} The parsed rules list.
 */
async function fetchRulesList() {
    try {
        const response = await fetch(chrome.runtime.getURL('rulesList.json'));
        if (!response.ok) {
            throw new Error(`Failed to fetch rulesList.json: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        logDebug("Error fetching rulesList.json:", error);
        return []; // Return an empty array to prevent further errors
    }
}

/**
 * Process incoming messages dynamically based on rulesList.json.
 */
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    logDebug("Message received", request);

    const rulesList = await fetchRulesList();
    const rule = rulesList.find(r => r.RuleName === request.rule?.RuleName);

    if (!rule) {
        logDebug("No matching rule found for request:", request.rule);
        return;
    }

    switch (request.greeting) {
        case 'unload':
            logDebug("Processing unload request for rule:", rule.RuleName);
            {
                let unloadCode = '';
                if (rule.RuleName === "Header & Footer") {
                  if (request.greeting === "unloadHeader") {
                    unloadCode = document.querySelector(rule.codeSelector1)?.value || '';
                  } else if (request.greeting === "unloadFooter") {
                    unloadCode = document.querySelector(rule.codeSelector2)?.value || '';
                  }
                } else {
                  unloadCode = document.querySelector(rule.codeSelector)?.value || '';
                }
                sendResponse({ filename: rule.fileName, code: unloadCode });
            }
            break;

        case 'load':
            logDebug("Processing load request for rule:", rule.RuleName);
            {
                const loadElement = document.querySelector(rule.codeSelector);
                if (loadElement) {
                    loadElement.value = request.code;
                }
            }
            break;

        default:
            logDebug("Unknown request received", request.greeting);
    }
    return true;
});