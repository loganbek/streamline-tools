/* ANCHOR ADMIN CONFIG CONTENT */

let ADMIN_CONFIG_CONTENT_DEBUG = true;

function logDebug(message, ...optionalParams) {
  if (ADMIN_CONFIG_CONTENT_DEBUG) {
    console.log("[ADMIN_CONFIG_CONTENT_DEBUG]", message, ...optionalParams);
  }
}

// let code
// let testCode
var code = ''
var testCode = ''
var filename = filename || ''

logDebug("Initial filename:", filename);

if (document.getElementById('#x-auto-3-input')) {
  filename = document.getElementById('#x-auto-3-input').value
  logDebug("Filename from document element:", filename);
}

if (window.document.getElementById('#x-auto-3-input')) {
  filename = window.document.getElementById('#x-auto-3-input').value
  logDebug("Filename from window document element:", filename);
}

window.addEventListener('unloadCode', function (evt) {
  detail1 = '@#$@#'
  const event = new CustomEvent('PassCodeToBackground', { detail: detail1 })
  window.dispatchEvent(event)
  logDebug("Unload code event dispatched with detail:", detail1);
})

// Listen for the PassToBackground event
window.addEventListener(
  'PassToBackground',
  function (evt) {
    code = evt.detail
    logDebug("PassToBackground event received with detail:", code);
  },
  false
)

// Listen for the PassCommentHeader event
window.addEventListener(
  'PassCommentHeader',
  function (evt) {
    commentHeader = evt.detail
    logDebug("PassCommentHeader event received with detail:", commentHeader);
  },
  false
)

// Listen for the code event
window.addEventListener(
  'PassCodeToBackground',
  function (evt) {
    code = evt.detail
    logDebug("PassCodeToBackground event received with detail:", code);
  },
  false
)

// Listen for the testcode event
window.addEventListener(
  'PassTestCodeToBackground',
  function (evt) {
    testCode = evt.detail
    logDebug("PassTestCodeToBackground event received with detail:", testCode);
  },
  false
)

function injectJs (link) {
  const scr = document.createElement('script')
  scr.id = 'configInject'
  scr.type = 'text/javascript'
  scr.src = link
  scr.class = 'configInject'
  
  document.getElementsByTagName('head')[0].appendChild(scr)
  logDebug("Injected script with link:", link);
}

if(!document.getElementById("adminConfig")){
  injectJs(chrome.runtime.getURL('adminConfigInjected.js'))
  logDebug("Injected adminConfigInjected.js script.");
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  logDebug("Received message with greeting:", request.greeting);
  if (request.greeting == 'unload') {
    const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
    window.dispatchEvent(unloadEvent)
    logDebug("Unload event dispatched with code:", request.code);
    sendResponse({
      filename: filename,
      code: code
    })
    logDebug("Unload response sent with filename and code.");
  } else if (request.greeting == 'unloadTest') {
    const unloadTestEvent = new CustomEvent('unloadTestCode', {
      detail: request.code
    })
    window.dispatchEvent(unloadTestEvent)
    logDebug("Unload test event dispatched with code:", request.code);
    sendResponse({
      filename: filename,
      testCode: testCode
    })
    logDebug("Unload test response sent with filename and testCode.");
  } else if (request.greeting == 'load') {
    if (document.getElementById('configInject')) {
      document.getElementById('configInject').remove()
      logDebug("Removed existing configInject script.");
    }
    const loadEvent = new CustomEvent('loadCode', { detail: request.code })
    window.dispatchEvent(loadEvent)
    logDebug("Load event dispatched with code:", request.code);
    const elem = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    logDebug("Textarea element found:", elem);
    textarea = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
  } else if (request.greeting == 'loadTest') {
    const loadTestEvent = new CustomEvent('loadTestCode', {
      detail: request.code
    })
    window.dispatchEvent(loadTestEvent)
    logDebug("Load test event dispatched with code:", request.code);
  } else if (request.greeting == 'filename') {
    sendResponse({
      filename: filename
    })
    logDebug("Filename response sent:", filename);
  }
})

if (document.querySelector('#x-auto-3-input')) {
  filename = document.querySelector('#x-auto-3-input').value
  // console.log('lone 151 - filename - ' + filename)
}
