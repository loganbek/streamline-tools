let code = ''
let testCode = ''
var filename = filename || ''

if (document.getElementById('#x-auto-3-input')) {
  filename = document.getElementById('#x-auto-3-input').value
  // document.querySelector("#x-auto-3-input")
  // console.log(filename)
}

if (window.document.getElementById('#x-auto-3-input')) {
  filename = window.document.getElementById('#x-auto-3-input').value
  // console.log(filename)
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
    // // console.log(filename)
    if (filename === '') {
      filename = 'setSupplierDescriptionBeforeReady'
    }
    // console.log(sender.tab
      // ? 'from a content script:' + sender.tab.url
      // : 'from the extension')
    // console.log(request.greeting
      // ? 'greeting: ' + request.greeting
      // : 'nogreeting')
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
      // console.log(elem)
      textarea = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
      // TODO config-modal fix on LOAD
      displayConfigModal()
    } else if (request.greeting == 'loadTest') {
      // console.log(request.code)
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
//   // console.log('you saved me!!')
//   // // console.log(result.variable_name);
// })

// chrome.storage.sync.get(['filename'], function (result) {
//   if (result.variable_name == undefined) {
//     // console.log('I am retrieved!!')
//     // console.log(result.variable_name)
//   }
// })

function displayConfigModal(){

    // MODAL FROM CONFIG

  // HTML

  // ```html
  // <div class="ext-el-mask-msg" style="display: block; left: 1014px; top: 694px;"><div>Loading...</div></div>
  // ```

  // CSS

  //   ```css
  // .ext-el-mask {
  //     background-color: #ccc;
  // }
  // .ext-el-mask-msg {
  //     border-color:#6593cf;
  //     background-color:#c3daf9;
  //     background-image:url(../images/default/box/tb-blue.gif);
  // }
  // .ext-el-mask-msg div {
  //     background-color: white;
  //     border-color:#a3bad9;
  //     color:#222;
  //     font:normal 11px tahoma, arial, helvetica, sans-serif;
  // }
  // .x-mask-loading div {
  //     background-color:#fbfbfb;
  //     background-image:url(../images/default/grid/loading.gif);
  // }
  // ```

  // CONFIG MODAL STEPS

  // 1) BUILD MODAL DOM

  // document.body.onload = addElement

  // function addElement () {
  //   // create a new div element
  //   const newDiv = document.createElement("div");

  //   // and give it some content
  //   const newContent = document.createTextNode("Hi there and greetings!");

  //   // add the text node to the newly created div
  //   newDiv.appendChild(newContent);

  //   // add the newly created element and its content into the DOM
  //   const currentDiv = document.getElementById("div1");
  //   document.body.insertBefore(newDiv, currentDiv);
  // }

  // 2) BM PAGE DOM SELECTOR
  // configLoadingModalHook = getElementById('temp')
   
  // 3) APPEND CHILD/DISPLAY
  // configLoadingModalHook.appendChild()

}


// MB OUTSIDE displayConfigModal()

// CONFIG MODAL LISTENER + REMOVAL

// LISTEN FOR CLICK EVENT 

  // ONCLICK() REMOVE 
  // configLoadingModalHook.removeChild()