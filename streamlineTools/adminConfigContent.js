let code = ''
let testCode = ''
var filename = filename || ''

if (document.getElementById('#x-auto-3-input')) {
  filename = document.getElementById('#x-auto-3-input').value
  // document.querySelector("#x-auto-3-input")
  console.log(filename)
}

if (window.document.getElementById('#x-auto-3-input')) {
  filename = window.document.getElementById('#x-auto-3-input').value
  console.log(filename)
}

window.addEventListener('unloadCode', function (evt) {
  detail1 = '@#$@#'
  const event = new CustomEvent('PassCodeToBackground', { detail: detail1 })
  window.dispatchEvent(event)
})

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

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('adminConfigInjected.js'))

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log(filename)
    if (filename === '') {
      filename = 'setSupplierDescriptionBeforeReady'
    }
    console.log(sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension')
    console.log(request.greeting
      ? 'greeting: ' + request.greeting
      : 'nogreeting')
    if (request.greeting == 'unload') {
      const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
      window.dispatchEvent(unloadEvent)
      sendResponse({
        filename: filename,
        code: code
      })
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
      const elem = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
      console.log(elem)
      textarea = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
      // TODO config-modal fix on LOAD

      /
    } else if (request.greeting == 'loadTest') {
      console.log(request.code)
      const loadTestEvent = new CustomEvent('loadTestCode', { detail: request.code })
      window.dispatchEvent(loadTestEvent)
    } else if (request.greeting == 'filename') {
      sendResponse({
        filename: filename
      })
      // return true;
    }
    // return true;
  })

function getElementsStartsWithId (id) {
  const children = document.body.getElementsByTagName('*')
  const elements = []
  let child
  for (let i = 0, length = children.length; i < length; i++) {
    child = children[i]
    if (child.id.substr(0, id.length) == id) { elements.push(child) }
  }
  return elements
}



if (document.querySelector('#x-auto-3-input')) {
  filename = document.querySelector('#x-auto-3-input').value
}

// chrome.storage.sync.set({ filename: 'filename' }, function () {
//   console.log('you saved me!!')
//   // console.log(result.variable_name);
// })

// chrome.storage.sync.get(['filename'], function (result) {
//   if (result.variable_name == undefined) {
//     console.log('I am retrieved!!')
//     console.log(result.variable_name)
//   }
// })