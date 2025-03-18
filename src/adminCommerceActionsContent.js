/**
 * Streamline Tools - Admin Commerce Actions Content Script
 *
 * This content script is injected into Oracle CPQ Cloud admin commerce actions pages
 * to handle BML code operations for commerce actions including loading, unloading,
 * and validation. It communicates with the background script and injects the
 * commerce-actions-specific functionality.
 *
 * @version 1.0.0
 * @license Unlicense
 */

let ADMIN_COMMERCE_ACTIONS_CONTENT_DEBUG = true;

// Function to log debug messages
function logDebug (message, ...optionalParams) {
  if (ADMIN_COMMERCE_ACTIONS_CONTENT_DEBUG) {
    console.log("[ADMIN_COMMERCE_ACTIONS_CONTENT_DEBUG]", message, ...optionalParams);
  }
}
// Initialize variables
if (typeof code === "undefined") {
  var code = "";
}
if (typeof filename === "undefined") {
  var filename = "";
}

// Function to extract filename from a string
function getFilename (str) {
  const re = /\/([^/]+)\.js$/
  const match = re.exec(str)
  return match[1]
}

// Listen for the PassToBackground event
window.addEventListener('PassToBackground', function (evt) {
  code = evt.detail
}, false)

// Listen for the PassCommentHeader event
window.addEventListener('PassCommentHeader', function (evt) {
  commentHeader = evt.detail
}, false)

// Listen for the code event
window.addEventListener('PassCodeToBackground', function (evt) {
  code = evt.detail
}, false)

// Listen for the testcode event
window.addEventListener('PassTestCodeToBackground', function (evt) {
  testCode = evt.detail
}, false)

// Listen for the unloadCode event
window.addEventListener('unloadCode', function (evt) {
  code = evt.detail
}, false)

// Function to inject a JavaScript file into the document
function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

// Inject the adminCommerceRulesInjected.js script
injectJs(chrome.runtime.getURL('adminCommerceRulesInjected.js'))

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  logDebug("Received message with greeting:", request.greeting);
  if (request.greeting == 'unload') {
    const unloadEvent = new CustomEvent('unloadCode', { detail: request.code });
    window.dispatchEvent(unloadEvent);
    logDebug("Unload event dispatched with code:", request.code);
    sendResponse({
      filename: filename,
      code: code
    });
    logDebug("Unload response sent with filename and code.");
  } else if (request.greeting == 'unloadTest') {
    const unloadTestEvent = new CustomEvent('unloadTestCode', {
      detail: request.code
    });
    window.dispatchEvent(unloadTestEvent);
    logDebug("Unload test event dispatched with code:", request.code);
    sendResponse({
      filename: filename,
      testCode: testCode
    });
    logDebug("Unload test response sent with filename and testCode.");
  } else if (request.greeting == 'load') {
    if (document.getElementById('configInject')) {
      document.getElementById('configInject').remove();
      logDebug("Removed existing configInject script.");
    }
    const loadEvent = new CustomEvent('loadCode', { detail: request.code });
    window.dispatchEvent(loadEvent);
    logDebug("Load event dispatched with code:", request.code);
    const elem = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea');
    logDebug("Textarea element found:", elem);
    textarea = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea');
  } else if (request.greeting == 'loadTest') {
    const loadTestEvent = new CustomEvent('loadTestCode', {
      detail: request.code
    });
    window.dispatchEvent(loadTestEvent);
    logDebug("Load test event dispatched with code:", request.code);
  } else if (request.greeting == 'filename') {
    sendResponse({
      filename: filename
    });
    logDebug("Filename response sent:", filename);
  } else if (request.greeting == 'commerceFilename') {
    sendResponse({
      filename: 'commerceRulesFileNameFromCS'
    });
  }
})

// Function to convert a string to camelCase
function camelCase (str) {
  return (str.slice(0, 1).toLowerCase() + str.slice(1))
    .replace(/([-_ ]){1,}/g, ' ')
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1)
    })
}
