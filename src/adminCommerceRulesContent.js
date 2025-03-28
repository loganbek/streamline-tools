// ADMIN COMMERCE RULES CONTENT

let ADMIN_COMMERCE_RULES_CONTENT_DEBUG = true;

function logDebug(message, ...optionalParams) {
  if (ADMIN_COMMERCE_RULES_CONTENT_DEBUG) {
    console.log("[ADMIN_COMMERCE_RULES_CONTENT_DEBUG]", message, ...optionalParams);
  }
}

// VARS
if (typeof code === "undefined") {
  var code = "";
}
if (typeof filename === "undefined") {
  var filename = "";
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

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.runtime.getURL('adminCommerceRulesInjected.js'))

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // let filename2 = document.querySelectorAll("input[id^=x-auto]")[1].value;
    // alert(filename2);
    // let ruleName = document.querySelector("input[name='variable_name']").value;
    // alert(ruleName);
    // let ruleType = window.name;
    // alert(ruleType);
    // let filename = ruleName + "." + ruleType;
    // alert(filename);
    // let filename = "commerceRuleName";
    // console.log(sender.tab
      // ? 'from a content script:' + sender.tab.url
      // : 'from the extension')
    // console.log(request.greeting
      // ? 'greeting: ' + request.greeting
      // : 'nogreeting')
    if (request.greeting == 'unload') {
      const unloadEvent = new CustomEvent('unloadCode', { detail: request.code })
      window.dispatchEvent(unloadEvent)
      // chrome.storage.sync.get(['commerceFileName'], function(result) {
      //     // console.log('Value currently is ' + result.key);
      //     if (result.key !== undefined) {
      //         filename = result.key;
      //     }
      // });
      // EDITOR PAGE CODE
      if (document.getElementsByClassName('bottom-bar')[0].innerHTML.length > 0) {
        let fileString = document.getElementsByClassName('bottom-bar')[0].innerHTML
        fileStringArray = fileString.split('&gt;')
        // console.log(fileStringArray)
        // console.log(fileStringArray[fileStringArray.length - 1])
        fileString = camelCase(fileStringArray[fileStringArray.length - 1])
        // console.log(fileString)
        const lc = fileString[0].toLowerCase()
        // console.log(fileString)
        fileString = lc + fileString.substring(1)
        // console.log(fileString)
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

// EDITOR PAGE CODE
if (document.getElementsByClassName('bottom-bar')[0].innerHTML.length > 0) {
  let fileString = document.getElementsByClassName('bottom-bar')[0].innerHTML
  fileStringArray = fileString.split('&gt;')
  // console.log(fileStringArray)
  // console.log(fileStringArray[fileStringArray.length - 1])
  fileString = camelCase(fileStringArray[fileStringArray.length - 1])
  // console.log(fileString)
  const lc = fileString[0].toLowerCase()
  // console.log(fileString)
  fileString = lc + fileString.substring(1)
  // console.log(fileString)
};

// TO CAMELCASE FUNCTION
function camelCase (str) {
  return (str.slice(0, 1).toLowerCase() + str.slice(1))
    .replace(/([-_ ]){1,}/g, ' ')
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1)
    })
}
