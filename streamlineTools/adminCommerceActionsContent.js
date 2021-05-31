// STUB | ADMIN COMMERCE ACTIONS CONTENT

// VARS
let code = ''
let filename

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

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('adminCommerceRulesInjected.js'))

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

      if (document.getElementsByClassName('bottom-bar')[0].innerHTML.length > 0) {
        let fileString = document.getElementsByClassName('bottom-bar')[0].innerHTML
        fileStringArray = fileString.split('&gt;')
        console.log(fileStringArray)
        console.log(fileStringArray[fileStringArray.length - 1])
        fileString = camelCase(fileStringArray[fileStringArray.length - 1])
        console.log(fileString)
        const lc = fileString[0].toLowerCase()
        console.log(fileString)
        fileString = lc + fileString.substring(1)
        console.log(fileString)

        // ACTION SPECIFIC LOGIC (BEFORE/AFTER + action_id)
        // LABEL.AFTER/BEFORE.ACTION_ID

        // BEFORE / AFTER
        const fullTitle = document.title
        console.log(fullTitle)

        if (document.title.includes('After')) {
          fileString += '.afterFormulas'
        } else if (document.title.includes('Before')) {
          fileString += '.beforeFormulas'
        }

        // ACTION_ID
        // console.log(document.url);
        // body > table > tbody > tr > td > form > input[type=hidden]:nth-child(10)
        const actionElements = document.getElementsByName('action_id')
        console.log(actionElements)
        console.log(actionElements[0])
        console.log(actionElements[0].value)
        fileString += '.' + actionElements[0].value
        console.log(fileString)
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

function camelCase (str) {
  return (str.slice(0, 1).toLowerCase() + str.slice(1))
    .replace(/([-_ ]){1,}/g, ' ')
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1)
    })
}
