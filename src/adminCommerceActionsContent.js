// STUB | ADMIN COMMERCE ACTIONS CONTENT

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
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.greeting == 'unload') {
      const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
      window.dispatchEvent(unloadEvent)

      if (document.getElementsByClassName('bottom-bar')[0].innerHTML.length > 0) {
        let fileString = document.getElementsByClassName('bottom-bar')[0].innerHTML
        fileStringArray = fileString.split('&gt;')
        fileString = camelCase(fileStringArray[fileStringArray.length - 1])
        const lc = fileString[0].toLowerCase()
        fileString = lc + fileString.substring(1)

        // ACTION SPECIFIC LOGIC (BEFORE/AFTER + action_id)
        // LABEL.AFTER/BEFORE.ACTION_ID

        // BEFORE / AFTER
        const fullTitle = document.title

        if (document.title.includes('After')) {
          fileString += '.afterFormulas'
        } else if (document.title.includes('Before')) {
          fileString += '.beforeFormulas'
        }

        // ACTION_ID
        const actionElements = document.getElementsByName('action_id')
        fileString += '.' + actionElements[0].value
        filename = fileString
      };
      sendResponse({
        filename: filename,
        code: code
      })
    } else if (request.greeting == 'load') {
      const loadEvent = new CustomEvent('loadCode', { detail: request.code })
      window.dispatchEvent(loadEvent)
    } else if (request.greeting == 'filename') {
      sendResponse({
        filename: filename
      })
    } else if (request.greeting == 'commerceFilename') {
      sendResponse({
        filename: 'commerceRulesFileNameFromCS'
      })
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
