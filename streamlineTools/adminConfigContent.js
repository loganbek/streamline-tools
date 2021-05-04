// let commentHeader = "";
// let code = "";
// let testCode = "";
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
  // frameList = window.frames;
  // console.log("frameList ->" + frameList);
  // // console.log("frameList.editAreas.value -> " + frameList.editAreas.value);
  // console.log("frameList.editAreas -> " + frameList.editAreas);
  // console.log("frameList.textArea -> " + frameList.textArea);
  // // console.log("frameList.textArea.value -> " + frameList.textArea.value);
  // console.log("frameList" + frameList.value);
  // // console.log("frameList.querySelector" + frameList.querySelector("#textarea"));
  // // #textarea
  // console.log(frameList.contentWindow);
  // console.log(document.getElementsByTagName("iframe")[0].contentWindow); // <- build on this
  // console.log(document.querySelector("#frame_x-auto-143-area"));
  // detail: frame_bm_script.editArea.textarea.value
  // /html/body/div[1]/div[3]/div[2]/textarea
  // document.querySelector("#textarea")
  // [attribute*="value"]
  // console.log()
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

// Listen for the unloadCode event
// window.addEventListener("unloadCode", function(evt) {
//     code = evt.detail;
// }, false);

function injectJs (link) {
  const scr = document.createElement('script')
  scr.type = 'text/javascript'
  scr.src = link
  document.getElementsByTagName('head')[0].appendChild(scr)
}

injectJs(chrome.extension.getURL('adminConfigInjected.js'))

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // comm rules var name
    // document.getElementById('x-auto-214-input').value;
    // TODO WILD CARD
    // let filename = document.getElementById('x-auto-3-input').value;
    // let filename = document.querySelectorAll("input[id*=x-auto-]");
    // let filename = document.getElementsByName("varName").value;
    // console.log(document.getElementById("#x-auto-3-input").value);
    // if (document.getElementById("#x-auto-3-input")) {
    //     filename = document.getElementById("#x-auto-3-input").value;
    //     console.log(filename);
    // }
    // let filename = "configHardCodeFileName";
    // var wldCardStrSelector = "x-auto-" + "*" + "-input";
    // var contentWindow = document.querySelectorAll(wldCardStrSelector);
    // var contentWindow = document.querySelectorAll('.page-iframe');
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
      // if (!code.startsWith(commentHeader)) {
      //     code = commentHeader + "\n\n" + code;
      // }
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

      // WIP: LOAD TRIALS
      // console.log("parent.editArea.textarea.value = code;" + "parent.editArea.textareaFocused = true");
      textarea = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
      // textarea.value = code;

      // TODO config-modal fix on LOAD

      // SIMULATE CLICK TRIALS - WIP
      // console.log("simulateClickTrials");
      // simulateClick(textarea);
      // simulateClick(elem);

      // textarea.onchange();

      // windowHook = window;
      // simulateClick(windowHook);
      // simulateClick(window);
      // simulateClick(textarea.parent.elem);

      // SIMULATE CLICK W/ INTERVAL
      // var interval = setInterval(function() {
      //     // document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").click();
      // }, 5000);

      // textarea.parent.click;
      // textarea.parent.click();

      // var elem = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea");
      // console.log(elem);

      // $elem.trigger('click');
      // you do a $('#textid').focus();

      // var iContentBody = $(".iframe-content").contents().find("body");
      // console.log("iContentBody");
      // console.log(iContentBody);
      // var endLetterSequenceNo = iContentBody.find(".iframe-content p").text();

      // elem.click;
      // elem.click();

      // elem.focus();

      // var closestElem = getClosest(elem, '#editor');
      // var closestResult = getClosest(elem, "#result");
      // // var closestSelection = getClosest(elem, "#selection_field_text"); <- BREAKING
      // // var closestContentHighlight = getClosest(elem, "#content_highlight"); <- BREAKING

      // var closestContainer = getClosest(elem, "#container");

      // var closestBody = getClosest(elem, "body");
      // console.log(closestContentHighlight);
      // #container
      // document.querySelector("#editor").click;
      // document.querySelector("#editor").click();

      // var x = event.clientX; // Get the horizontal coordinate
      // var y = event.clientY; // Get the vertical coordinate
      // var coor = "X coords: " + x + ", Y coords: " + y;
      // console.log(coor);

      // var cX = event.clientX;
      // var sX = event.screenX;
      // var cY = event.clientY;
      // var sY = event.screenY;
      // var coords1 = "client - X: " + cX + ", Y coords: " + cY;
      // var coords2 = "screen - X: " + sX + ", Y coords: " + sY;

      //             <div id="selection_field" class="" style="display: block; font-family: monospace; font-size: 10pt; line-height: 15px; top: 15px; width: 2468px;"><span></span><strong></strong><span>
      // </span></div>

      // var closestCursor = getClosest("#cursor_pos"); // errors

      // console.log(closestSelection);
      // console.log(closestContainer);
      // console.log(closestResult);
      // console.log(closestElem);
      // console.log(closestBody);
      // console.log(closestCursor);

      // closestCursor.click;
      // closestCursor.click();
      // closestElem.click;
      // closestContentHighlight.click;
      // closestContentHighlight.click();

      // closestSelection.click;
      // closestSelection.click();

      // closestBody.click;
      // closestBody.click();

      // closestContainer.click;
      // closestContainer.click();

      // closestContainer.focus();

      // elem.click;
      // elem.click();

      // document.getElementById('elementId').dispatchEvent(new MouseEvent("click",{bubbles: true, cancellable: true}));

      // closestElem.dispatchEvent(new MouseEvent("click"), { bubbles: true, cancellable: true });
      // closestResult.dispatchEvent(new MouseEvent("click"), { bubbles: true, cancellable: true });

      // closestElem.click();
      // closestElem.click;

      // closestResult.click();
      // closestResult.click;
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

// OLD CONTENT SCRIPT MANIFEST
// "content_scripts": [{
//     "matches": [
//         "*://*.bigmachines.com/*"
//     ],
//     "js": [
//         "jsonpath-1.0.2.js",
//         "content.js"
//     ],
//     "all_frames": true
// }],

// filename = document.querySelector("#x-auto-3-input").value;

// chrome.storage.sync.set({ 'filename': 'filename' }, function() {
//     console.log("you saved me!!");
//     console.log(result.variable_name);
// });

// chrome.storage.sync.get(['filename'], function(result) {
//     if (result.variable_name == undefined) {
//         console.log("I am retrieved!!");
//         console.log(result.variable_name);
//     }
// });

if (document.querySelector('#x-auto-3-input')) {
  filename = document.querySelector('#x-auto-3-input').value
}

chrome.storage.sync.set({ filename: 'filename' }, function () {
  console.log('you saved me!!')
  // console.log(result.variable_name);
})

chrome.storage.sync.get(['filename'], function (result) {
  if (result.variable_name == undefined) {
    console.log('I am retrieved!!')
    console.log(result.variable_name)
  }
})

/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
const getClosest = function (elem, selector) {
  // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
              const matches = (this.document || this.ownerDocument).querySelectorAll(s)
              let i = matches.length
              while (--i >= 0 && matches.item(i) !== this) {}
              return i > -1
            }
  }

  // Get closest match
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem
  }

  return null
}

/**
 * Get all of an element's parent elements up the DOM tree
 * @param  {Node}   elem     The element
 * @param  {String} selector Selector to match against [optional]
 * @return {Array}           The parent elements
 */
const getParents = function (elem, selector) {
  // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
              const matches = (this.document || this.ownerDocument).querySelectorAll(s)
              let i = matches.length
              while (--i >= 0 && matches.item(i) !== this) {}
              return i > -1
            }
  }

  // Setup parents array
  const parents = []

  // Get matching parent elements
  for (; elem && elem !== document; elem = elem.parentNode) {
    // Add matching parents to array
    if (selector) {
      if (elem.matches(selector)) {
        parents.push(elem)
      }
    } else {
      parents.push(elem)
    }
  }

  return parents
}

/**
 * Get all of an element's parent elements up the DOM tree until a matching parent is found
 * @param  {Node}   elem     The element
 * @param  {String} parent   The selector for the parent to stop at
 * @param  {String} selector The selector to filter against [optionals]
 * @return {Array}           The parent elements
 */
const getParentsUntil = function (elem, parent, selector) {
  // Element.matches() polyfill
  if (!Element.prototype.matches) {
    Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function (s) {
              const matches = (this.document || this.ownerDocument).querySelectorAll(s)
              let i = matches.length
              while (--i >= 0 && matches.item(i) !== this) {}
              return i > -1
            }
  }

  // Setup parents array
  const parents = []

  // Get matching parent elements
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (parent) {
      if (elem.matches(parent)) break
    }

    if (selector) {
      if (elem.matches(selector)) {
        parents.push(elem)
      }
      break
    }

    parents.push(elem)
  }

  return parents
}

// var elem = document.querySelector('#some-element');
// var parents = getParents(elem, '.some-class');
// var allParents = getParents(elem.parentNode);

// var elem = document.querySelector('#example');
// var parents = getClosest(elem.parentNode, '[data-sample]');

// var elem = document.querySelector('#some-element');
// var parentsUntil = getParentsUntil(elem, '.some-class');
// var parentsUntilByFilter = getParentsUntil(elem, '.some-class', '[data-something]');
// var allParentsUntil = getParentsUntil(elem);
// var allParentsExcludingElem = getParentsUntil(elem.parentNode);

/**
 * Simulate a click event.
 * @public
 * @param {Element} elem  the element to simulate a click on
 */
const simulateClick = function (elem) {
  // Create our event (with options)
  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  })
  // If cancelled, don't dispatch our event
  const canceled = !elem.dispatchEvent(evt)
}
