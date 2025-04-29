const CONTENT_DEBUG = true;
import domOps from './domOperations';

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
domOps.addEventListener(window, "PassToBackground", function (evt) {
  code = evt.detail;
  logDebug("PassToBackground event received", code);
}, false);

domOps.addEventListener(window, "PassCommentHeader", function (evt) {
  commentHeader = evt.detail;
  logDebug("PassCommentHeader event received", commentHeader);
}, false);

domOps.addEventListener(window, "PassCodeToBackground", function (evt) {
  code = evt.detail;
  logDebug("PassCodeToBackground event received", code);
}, false);

domOps.addEventListener(window, "PassTestCodeToBackground", function (evt) {
  testCode = evt.detail;
  logDebug("PassTestCodeToBackground event received", testCode);
}, false);

domOps.addEventListener(window, "unloadCode", function (evt) {
  code = evt.detail;
  logDebug("unloadCode event received", code);
}, false);

// Function to inject a script into the page
function injectJs(link) {
  // Skip script injection in test environment
  if (process.env.NODE_ENV === 'test') {
    logDebug("Skipping script injection in test environment");
    return;
  }
  
  logDebug("Injecting script", link);
  const scr = domOps.createElement("script");
  scr.type = "text/javascript";
  scr.src = link;
  domOps.appendChild(domOps.getHead(), scr);
}

// Inject the main script only in non-test environment
if (process.env.NODE_ENV !== 'test') {
  injectJs(chrome.runtime.getURL("injected.js"));
}

// Single consolidated message listener for all interactions
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  logDebug("Message received", request);

  try {
    // Handle command API messages
    if (request.direction) {
      logDebug("Command API message received for direction:", request.direction);
      return true;
    }

    // Get matching rule from rulesList.json
    const rulesList = await fetchRulesList();
    
    // Handle rule-specific request if provided
    if (request.rule?.RuleName) {
      const rule = rulesList.find((r) => r.RuleName === request.rule.RuleName);
      if (!rule) {
        logDebug("No matching rule found for request:", request.rule);
        sendResponse({ error: "Rule not found" });
        return true;
      }
      return handleRuleSpecificMessage(rule, request, sendResponse);
    }

    // Find matching rule based on URL for general requests
    const rule = rulesList.find(r => {
      if (!r.URL) return false;
      const urlPattern = r.URL.replace(/\*/g, '');
      return window.location.href.includes(urlPattern);
    });

    if (!rule) {
      logDebug("No matching rule found for URL:", window.location.href);
      // Still handle special cases even if no rule matches
      if (request.greeting.includes("HTML") || request.greeting.includes("CSS") || request.greeting.includes("XML")) {
        handleSpecialCaseMessages(request, sendResponse);
        return true;
      }
      sendResponse({ error: "No matching rule found for this page" });
      return true;
    }

    // Get filename using the rule's selector
    let filename = "";
    if (rule.fileNameSelector) {
      try {
        const filenameElement = domOps.querySelector(rule.fileNameSelector);
        filename = filenameElement ? filenameElement.value : "nofilename";
        if (rule.fileNameSelector2) {
          const filename2Element = domOps.querySelector(rule.fileNameSelector2);
          if (filename2Element) {
            filename = filename2Element.value;
          }
        }
      } catch (error) {
        logDebug("Error getting filename:", error);
        filename = "nofilename";
      }
    }
    
    logDebug("Processing for rule:", rule.RuleName, "filename:", filename);

    switch (request.greeting) {
      case "unload": {
        const unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
        domOps.dispatchEvent(window, unloadEvent);

        // Get code using the rule's selector
        let code = "";
        try {
          if (rule.codeSelector) {
            const codeElement = domOps.querySelector(rule.codeSelector);
            code = codeElement ? codeElement.value : "";
            if (rule.codeSelector2) {
              const code2Element = domOps.querySelector(rule.codeSelector2);
              if (code2Element) {
                code = code2Element.value;
              }
            }
          }
        } catch (error) {
          logDebug("Error getting code:", error);
          sendResponse({ error: "Failed to get code from page" });
          return true;
        }

        if (code && !code.startsWith(commentHeader)) {
          code = commentHeader + "\n\n" + code;
        }

        sendResponse({
          filename: filename,
          code: code,
          rule: rule
        });
        break;
      }

      case "load": {
        if (!rule.codeSelector) {
          logDebug("No code selector found for rule", rule);
          sendResponse({ error: "No code selector found for this rule" });
          return true;
        }

        const loadEvent = new CustomEvent("loadCode", { detail: request.code });
        domOps.dispatchEvent(window, loadEvent);

        try {
          const codeElement = domOps.querySelector(rule.codeSelector);
          if (codeElement) {
            codeElement.value = request.code;
          }

          if (rule.codeSelector2) {
            const code2Element = domOps.querySelector(rule.codeSelector2);
            if (code2Element) {
              code2Element.value = request.code;
            }
          }
        } catch (error) {
          logDebug("Error setting code:", error);
          sendResponse({ error: "Failed to set code on page" });
          return true;
        }

        sendResponse({ status: "Code loaded successfully" });
        break;
      }

      case "unloadTest":
      case "loadTest": {
        if (!rule.hasTest || rule.hasTest === "FALSE") {
          sendResponse({ error: "This rule does not support test operations" });
          return true;
        }
        
        const eventName = request.greeting === "unloadTest" ? "unloadTestCode" : "loadTestCode";
        const testEvent = new CustomEvent(eventName, { detail: request.code });
        domOps.dispatchEvent(window, testEvent);

        if (request.greeting === "unloadTest") {
          sendResponse({
            filename: filename,
            testCode: testCode
          });
        }
        break;
      }

      case "filename":
        sendResponse({ filename: filename });
        break;

      default:
        // Handle special cases
        if (request.greeting.includes("HTML") || request.greeting.includes("CSS") || request.greeting.includes("XML")) {
          handleSpecialCaseMessages(request, sendResponse);
        } else {
          logDebug("Unknown request received", request.greeting);
          sendResponse({ error: "Unknown request type" });
        }
    }
  } catch (error) {
    logDebug("Error processing message:", error);
    sendResponse({ error: "Internal error processing request" });
  }
  return true;
});

// Helper function to handle rule-specific messages
function handleRuleSpecificMessage(rule, request, sendResponse) {
  switch (request.greeting) {
    case "unload": {
      logDebug("Processing unload request for rule:", rule.RuleName);
      let unloadCode = "";
      if (rule.RuleName === "Header & Footer") {
        if (request.headerType === "header") {
          unloadCode = domOps.querySelector(rule.codeSelector1)?.value || "";
        } else if (request.headerType === "footer") {
          unloadCode = domOps.querySelector(rule.codeSelector2)?.value || "";
        }
      } else {
        unloadCode = domOps.querySelector(rule.codeSelector)?.value || "";
      }
      sendResponse({ filename: rule.fileName, code: unloadCode });
      return true;
    }
    case "load": {
      logDebug("Processing load request for rule:", rule.RuleName);
      const loadElement = domOps.querySelector(rule.codeSelector);
      if (loadElement) {
        loadElement.value = request.code;
        sendResponse({ status: "Code loaded successfully" });
      } else {
        sendResponse({ error: "Element not found" });
      }
      return true;
    }
    default:
      logDebug("Unknown rule-specific request received", request.greeting);
      sendResponse({ error: "Unknown request type" });
      return true;
  }
}

// Helper function to handle special case messages (HTML/CSS/XML)
function handleSpecialCaseMessages(request, sendResponse) {
  const selectorMap = {
    HeaderHTML: 'textarea[name="header"]',
    FooterHTML: 'textarea[name="footer"]',
    CSS: 'textarea[name="css"]',
    AltCSS: 'textarea[name="alternate_css"]',
    JETCSS: 'textarea[name="jet_css"]',
    GlobalXSL: 'textarea[name="global_xsl"]',
    XML: 'textarea[name="xml"]'
  };

  const type = Object.keys(selectorMap).find(key => request.greeting.includes(key));
  if (!type) return;

  const selector = selectorMap[type];
  if (request.greeting.startsWith("unload")) {
    const code = domOps.querySelector(selector)?.value || "";
    logDebug(`Unloading ${type} code`);
    sendResponse({ code });
  } else if (request.greeting.startsWith("load")) {
    logDebug(`Loading ${type} code`);
    const element = domOps.querySelector(selector);
    if (element) {
      element.value = request.code;
    }
    sendResponse({ status: `${type} loaded successfully` });
  }
}

/**
 * Dynamically fetch rule configurations from rulesList.json.
 * @returns {Promise<Object[]>} The parsed rules list.
 */
async function fetchRulesList() {
  try {
    const response = await fetch(chrome.runtime.getURL("rulesList.json"));
    if (!response.ok) {
      throw new Error(
        `Failed to fetch rulesList.json: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    logDebug("Error fetching rulesList.json:", error);
    return []; // Return an empty array to prevent further errors
  }
}

// Export domOps for testing
if (process.env.NODE_ENV === 'test') {
  module.exports = { domOps };
}
