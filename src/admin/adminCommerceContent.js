/**
 * Streamline Tools - Admin Commerce Content Script
 *
 * This content script is injected into Oracle CPQ Cloud admin commerce pages
 * to handle BML code operations including loading, unloading, and validation.
 * It communicates with the background script and injects the commerce-specific
 * functionality.
 *
 * @version 1.0.0
 * @license Unlicense
 */

let ADMIN_COMMERCE_CONTENT_DEBUG = true;

function logDebug(message, ...optionalParams) {
  if (ADMIN_COMMERCE_CONTENT_DEBUG) {
    console.log("[ADMIN_COMMERCE_CONTENT_DEBUG]", message, ...optionalParams);
  }
}

// Initialize variables
if (typeof code === "undefined") {
  var code = "";
}
if (typeof testCode === "undefined") {
  var testCode = "";
}
if (typeof filename === "undefined") {
  var filename = "";
}
if (typeof filenameAfter === "undefined") {
  var filenameAfter = "";
}
if (typeof filenameBefore === "undefined") {
  var filenameBefore = "";
}

window.addEventListener('PassToBackground', function (evt) {
  code = evt.detail
  logDebug("PassToBackground event received with detail:", code);
}, false)

// Listen for the PassCommentHeader event
window.addEventListener('PassCommentHeader', function (evt) {
  commentHeader = evt.detail
  logDebug("PassCommentHeader event received with detail:", commentHeader);
}, false)

// Listen for the code event
window.addEventListener('PassCodeToBackground', function (evt) {
  code = evt.detail
  logDebug("PassCodeToBackground event received with detail:", code);
}, false)

// Listen for the testcode event
window.addEventListener('PassTestCodeToBackground', function (evt) {
  testCode = evt.detail
  logDebug("PassTestCodeToBackground event received with detail:", testCode);
}, false)

// Listen for the unloadCode event
window.addEventListener('unloadCode', function (evt) {
  code = evt.detail
  logDebug("UnloadCode event received with detail:", code);
}, false)

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
  logDebug("Injected script with link:", link);
}

injectJs(chrome.runtime.getURL('adminCommerceInjected.js'))

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    logDebug("Received message with greeting:", request.greeting);
    if (request.greeting == 'unload') {
      const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
      window.dispatchEvent(unloadEvent)
      logDebug("Unload event dispatched with code:", request.code);

      chrome.storage.sync.get(['commerceFileName'], function (result) {
        if (result.key !== undefined) {
          filename = result.key
        }
        logDebug("Commerce filename from storage:", filename);
      })

      sendResponse({
        filename: filename,
        code: code
      })
      logDebug("Unload response sent with filename and code.");
    } else if (request.greeting == 'unloadTest') {
      const unloadTestEvent = new CustomEvent('unloadTestCode', { detail: request.code })
      window.dispatchEvent(unloadTestEvent)
      logDebug("Unload test event dispatched with code:", request.code);
      sendResponse({
        filename: filename,
        testCode: testCode
      })
      logDebug("Unload test response sent with filename and testCode.");
    } else if (request.greeting == 'load') {
      const loadEvent = new CustomEvent('loadCode', { detail: request.code })
      window.dispatchEvent(loadEvent)
      logDebug("Load event dispatched with code:", request.code);
    } else if (request.greeting == 'loadTest') {
      const loadTestEvent = new CustomEvent('loadTestCode', { detail: request.code })
      window.dispatchEvent(loadTestEvent)
      logDebug("Load test event dispatched with code:", request.code);
    } else if (request.greeting == 'filename') {
      sendResponse({
        filename: filename
      })
      logDebug("Filename response sent:", filename);
    } else if (request.greeting == 'commerceFilename') {
      sendResponse({
        filename: 'commerceFileNameFromCS'
      })
      logDebug("Commerce filename response sent.");
    }

    chrome.storage.sync.set({ commerceFileName: filename }, function () {
      logDebug("Commerce filename saved to storage:", filename);
    })
  })
