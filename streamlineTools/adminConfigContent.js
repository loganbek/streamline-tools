/* ANCHOR ADMIN CONFIG CONTENT */

// let code
// let testCode
var code = ''
var testCode = ''
var filename = filename || ''

if (document.getElementById('#x-auto-3-input')) {
  filename = document.getElementById('#x-auto-3-input').value
  // document.querySelector("#x-auto-3-input")
  // console.log('line 12 - filename - ' + filename)
}

if (window.document.getElementById('#x-auto-3-input')) {
  filename = window.document.getElementById('#x-auto-3-input').value
  // console.log('line 17 - filename - ' + filename)
}

window.addEventListener('unloadCode', function (evt) {
  detail1 = '@#$@#'
  const event = new CustomEvent('PassCodeToBackground', { detail: detail1 })
  window.dispatchEvent(event)
  // console.log('line 24 - event -' + event)
})

// Listen for the PassToBackground event
window.addEventListener(
  'PassToBackground',
  function (evt) {
    code = evt.detail
    // console.log('line 32 - evt.detail' + evt.detail)
  },
  false
)

// Listen for the PassCommentHeader event
window.addEventListener(
  'PassCommentHeader',
  function (evt) {
    commentHeader = evt.detail
    // console.log('line 42 - commentHeader' + commentHeader)
  },
  false
)

// Listen for the code event
window.addEventListener(
  'PassCodeToBackground',
  function (evt) {
    code = evt.detail
    // console.log('line 48 - code' + code)
  },
  false
)

// Listen for the testcode event
window.addEventListener(
  'PassTestCodeToBackground',
  function (evt) {
    testCode = evt.detail
    // console.log('line 62 - testCode' + testCode)
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
}

// console.log("script present")
// console.log(document.getElementById("adminConfig"))


if(!document.getElementById("adminConfig")){
  injectJs(chrome.runtime.getURL('adminConfigInjected.js'))
}

// function isLoadedScript(lib) {
//   return document.querySelectorAll('[src="' + lib + '"]').length > 0
// }

// var len = $('script[src="<external JS>"]').length;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting == 'unload') {
    const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
    window.dispatchEvent(unloadEvent)
    sendResponse({
      filename: filename,
      code: code
    })
  } else if (request.greeting == 'unloadTest') {
    const unloadTestEvent = new CustomEvent('unloadTestCode', {
      detail: request.code
    })
    window.dispatchEvent(unloadTestEvent)
    sendResponse({
      filename: filename,
      testCode: testCode
    })
  } else if (request.greeting == 'load') {
    if (document.getElementById('configInject')) {
      document.getElementById('configInject').remove()
    }
    const loadEvent = new CustomEvent('loadCode', { detail: request.code })
    window.dispatchEvent(loadEvent)
    const elem = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    // console.log(elem)
    textarea = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
  } else if (request.greeting == 'loadTest') {
    // console.log(request.code)
    const loadTestEvent = new CustomEvent('loadTestCode', {
      detail: request.code
    })
    window.dispatchEvent(loadTestEvent)
  } else if (request.greeting == 'filename') {
    sendResponse({
      filename: filename
    })
    // return true;
  }
  // return true;
})

// function getElementsStartsWithId (id) {
//   const children = document.body.getElementsByTagName('*')
//   const elements = []
//   let child
//   for (let i = 0, length = children.length; i < length; i++) {
//     child = children[i]
//     if (child.id.substr(0, id.length) == id) {
//       elements.push(child)
//     }
//   }
//   return elements
// }

if (document.querySelector('#x-auto-3-input')) {
  filename = document.querySelector('#x-auto-3-input').value
  // console.log('lone 151 - filename - ' + filename)
}
