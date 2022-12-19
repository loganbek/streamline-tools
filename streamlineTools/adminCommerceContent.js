/* STUB | ADMIN COMMERCE CONTENT */

let code = ''
let testCode = ''
// var filename = filename || "";
let filename
let filenameAfter
let filenameBefore

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

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('adminCommerceInjected.js'))

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension')
    console.log(request.greeting
      ? 'greeting: ' + request.greeting
      : 'nogreeting')
    if (request.greeting == 'unload') {
      const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
      window.dispatchEvent(unloadEvent)

      chrome.storage.sync.get(['commerceFileName'], function (result) {
        console.log('Value currently is ' + result.key)
        if (result.key !== undefined) {
          filename = result.key
        }
      })

      sendResponse({
        filename: filename,
        code: code
      })
      // }
    } else if (request.greeting == 'unloadTest') {
      const unloadTestEvent = new CustomEvent('unloadTestCode', { detail: request.code })
      window.dispatchEvent(unloadTestEvent)
      sendResponse({
        filename: filename,
        testCode: testCode
      })
    } else if (request.greeting == 'load') {
      const loadEvent = new CustomEvent('loadCode', { detail: request.code })
      window.dispatchEvent(loadEvent)
    } else if (request.greeting == 'loadTest') {
      console.log(request.code)
      const loadTestEvent = new CustomEvent('loadTestCode', { detail: request.code })
      window.dispatchEvent(loadTestEvent)
    } else if (request.greeting == 'filename') {
      sendResponse({
        filename: filename
      })
    } else if (request.greeting == 'commerceFilename') {
      sendResponse({
        filename: 'commerceFileNameFromCS'
      })
    }

    //  :nth-child(3) > td.form-input > input[type=hidden]
    console.log(filename)

    console.log(commActionFileName);
    chrome.storage.sync.set({ commerceFileName: filename }, function () {
      console.log('you saved me!! comm action')
      console.log(filename)
    })
  })
