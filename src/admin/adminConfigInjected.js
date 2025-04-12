/**
 * Streamline Tools - Admin Config Injected Script
 *
 * This script is injected into Oracle CPQ Cloud admin configuration pages
 * to handle BML code operations directly in the page context. It provides
 * functionality for loading and unloading BML code in configuration rules
 * and handles modal dialogs and UI interactions.
 *
 * @version 1.0.0
 * @license Unlicense
 */

function simulatedClick(target, options) {

  var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {},
      opts = { // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 2,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

  //Merge the options with the defaults
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      opts[key] = options[key];
    }
  }

  // document.ELEMENT_NODE

  // var items = document.getElementsByTagName("*");
  // for (var i = 0; i < items.length; i++) {
  //   // simulatedClick(items) 
  //   items.callCallbacks
  // }

  // document.body.callCallbacks

  //Pass in the options
  event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
  );

  //Fire the event
  // target.dispatchEvent(event);
  }

// GLOBAL CLICK LISTNER

// var toggleModalPass = false
document.addEventListener('click', function (evnt) {
  // console.log(evnt.target.id)
  // console.log('global click')
  // Arrive.unbindAllArrive()
  // evnt.trigger("dblclick")
  // console.log(evnt)
  // evnt.

  // console.log('removing loading dialog...')
  // bodyModalHook[0].querySelector('ext-el-mask').remove()
  // console.log('dialog removed')
  // console.log("activeElement global click listener")
  // console.log(document.activeElement)
  // for ()
  // bodyModalHook[0].src += ''

  const bodyElement2 = document.getElementsByTagName('body')
  // console.log('bodyElement2')
  // console.log(bodyElement2)

  // console.log(bodyElement2[0])
  // bodyModalHook = bodyElement[0].getElementsByClassName(
  //   '.x-window x-component x-window-maximized x-masked'
  // )
  bodyModalHook2 = bodyElement2[0].getElementsByClassName(
    ' x-window x-component  x-window-maximized'
  )
  // console.log('bodyModalHook2')
  // console.log(bodyModalHook2)
  // window.click()
  if (bodyModalHook2[0] && bodyModalHook2[0].querySelectorAll('.ext-el-mask') != null) {
    bodyModalHook2[0].querySelectorAll('.ext-el-mask').forEach(e => e.parentNode.removeChild(e))
  }
  if (bodyModalHook2[0] && bodyModalHook2[0].querySelector('.ext-el-mask')) {
    bodyModalHook2[0].querySelector('.ext-el-mask').remove()
    
  }
  // if (bodyModalHook2[0] && bodyModalHook2[0].querySelector('.ext-el-mask-msg')) {
  //   bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg').forEach(e => e.parentNode.removeChild(e))
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg").outerHTML=" "
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg").remove()
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg").style="display:none;"
    // console.log(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg'))
    // simulatedClick(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0])
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].click()
    // bodyModalHook2[0].click()
    // // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].parentNode.click()
    // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").outerHTML=" "
    // // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").
    // // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].innerHTML = " "

    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].remove()
    // var intervalID = setInterval(simulatedClick(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0]), 2000); 
    
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].innerHTML = ""
    // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").outerHTML=" "
    
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].HTML = ""
    // console.log(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg'))
    
  // }

  // if (bodyModalHook2[0] && bodyModalHook2[0].querySelector('.ext-el-mask-msg3')) {
  //   bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg3').forEach(e => e.parentNode.removeChild(e))
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg").outerHTML=" "
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg").remove()
    // bodyModalHook2[0].querySelector("#x-auto-122 > div.ext-el-mask-msg3").style="display:none;"
    // console.log(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg'))
    // simulatedClick(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0])
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].click()
    // bodyModalHook2[0].click()
    // // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].parentNode.click()
    // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").outerHTML=" "
    // // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").
    // // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].innerHTML = " "

    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].remove()
    // var intervalID = setInterval(simulatedClick(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0]), 2000); 
    
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].innerHTML = ""
    // bodyModalHook2[0].querySelector("div.ext-el-mask-msg").outerHTML=" "
    
    // bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg')[0].HTML = ""
    // console.log(bodyModalHook2[0].querySelectorAll('.ext-el-mask-msg'))
    
  // }
  
  // bodyModalHook2[0].click()
  // setTimeout(() => {
  //   // console.log(bodyModalHook2[0].querySelectorAll('.ext-el-mask'))

  //   // closeLoadingDialog()
  // }, 5000);
  // bodyModalHook2[0].click()
  // document.body.click
  // buttonCollection = document.getElementsByClassName('x-btn-text ')
  // console.log(buttonCollection)
  // // // oop through collection and check for "Validate"
  // for (const item of buttonCollection) {
  //   if (item.innerText === 'Validate') {
  //     // console.log('found validate button')
  //     validateButton = item
  //     validateButton.id = 'valid'
  //     // console.log(item)
  //   }
  // }

  // simulatedClick(validateButton)
  // validateButton.click
  // console.log(validateButton)

  // if (toggleModalPass) {
  if (
    bodyModalHook2[0] &&
      bodyModalHook2[0].querySelectorAll('.ext-el-mask') != null
  ) {
    bodyModalHook2[0]
      .querySelectorAll('.ext-el-mask')
      .forEach(e => e.parentNode.removeChild(e))
  }

  // if (
  //   bodyModalHook2[0] &&
  //     bodyModalHook2[0].querySelectorAll('.ext-el-mask3') != null
  // ) {
  //   bodyModalHook2[0]
  //     .querySelectorAll('.ext-el-mask3')
  //     .forEach(e => e.parentNode.removeChild(e))
  // }
      // simulatedClick(document.querySelector('#x-auto-122 > div.x-window-bwrap'))
  
  //   toggleModalPass = false
  // } else {
  //   toggleModalPass = true
  //   document.body.click
  // }
  // const event = new MouseEvent('dblclick', {
  //   bubbles: true,
  //   cancelable: true,
  //   view: window,
  //   detail: 2
  // })

  // iframeDocument.attachEvent("onload", function () {
  //     this.contentWindow.document.ondblclick = function() { alert('it work\'s'); }
  // });

  // #frame_x-auto-171-area
  // #ConfigRuleEditor
  // document.querySelector("#area_search_replace > div.button > a:nth-child(7)").animate

  // document.querySelector("#area_search_replace > div.button > a:nth-child(7)").remove
  // document.querySelector("#area_search_replace > div.button > a:nth-child(7)").removeChild
  // document.querySelector("#frame_x-auto-171-area").simulatedClick
  // document.querySelector("#x-auto-145 > div.x-window-bwrap").simulatedClick
  // document.querySelector("#x-auto-145 > div.x-window-bwrap").callCallbacks
  // document.querySelector("#area_search_replace > div.button > a:nth-child(7)").callCallbacks

  // document.getElementsByTagName('input')[0].focus()
  // simulatedClick(document.getElementsByTagName('input')[0])
  // document.getElementById("#frame_x-auto-171-area'").focus();

  // document.getElementsByTagName('iframe')[0].focus()
  // simulatedClick(document.getElementsByTagName('iframe')[0])

  //     document.getElementsByTagName('iframe').reloadIFrame

  //     document.getElementsByTagName('iframe').reload
  //     document.getElementById('#frame_x-auto-171-area').contentWindow.location.reloadIFrame;

  // iframe.contentWindow.location.reload();

  // var iframe = document.getElementById('youriframe');
  // iframe.src = iframe.src;
  // try focus

  // function reloadIFrame () {
  //   // console.log('reloading..')
  //   document.getElementById('#frame_x-auto-171-area').contentWindow.location.reload()
  // }

  // document.head.removeChild(document.getElementById('configInject'));
if(document.getElementsByClassName('configInject')){
  const configInjectClassElements = document.getElementsByClassName('configInject')
  // console.log(configInjectClassElements)
  for (w = 0; w < configInjectClassElements.length + 1; w++) {
    // console.log(document.head.removeChild(configInjectClassElements[w]))
    // console.log(configInjectClassElements[w])
    // document.head.removeChild(configInjectClassElements[w])
  }
}
  // document.head.removeChild(document.getElementById('configInject'));
  // document.head.removeChild

  // e.firstElementChild can be used.
  // var child = head.lastElementChild;
  // while (child) {
  //   if(child.id === "configInject")  {}
  //   head.removeChild(child);
  //     child = e.lastElementChild;
  // }

  // const buttonEl = document.querySelector('#frame_x-auto-171-area').contentWindow.location.reload();
  // document.dispatchEvent(event)

  // Arrive.unbindAllArrive()
})

window.addEventListener('load', function () {
  main()
})

window.addEventListener('unloadCode', function (evt) {
  // document.getElementsByRegex = function (pattern) {
  //   const arrElements = [] // to accumulate matching elements
  //   const re = new RegExp(pattern) // the regex to match with

  //   function findRecursively (aNode) {
  //     // recursive function to traverse DOM
  //     if (!aNode) {
  //       return
  //     }
  //     if (aNode.id !== undefined && aNode.id.search(re) != -1) {
  //       arrElements.push(aNode)
  //     } // FOUND ONE!
  //     for (const idx in aNode.childNodes) {
  //       // search children...
  //       findRecursively(aNode.childNodes[idx])
  //     }
  //   }

  //   findRecursively(document) // initiate recursive matching
  //   return arrElements // return matching elements
  // }

  textAreaCode = document
    .getElementsByTagName('iframe')[1]
    .contentDocument.querySelector('#textarea').value
  // console.log(textAreaCode)
  if (textAreaCode) {
    code = textAreaCode
  } else {
    code = '\n'
  }
  // console.log(textAreaCode)
  // console.log(code)
  const event = new CustomEvent('PassCodeToBackground', {
    detail: code
  })
  window.dispatchEvent(event)
})

// Listen for the load code event
window.addEventListener(
  'loadCode',
  function (evt) {
    code = evt.detail
    // console.log(document.getElementById('x-auto-3-input'))
    textarea = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    textarea.value = code
    // console.log('loadCode listener')
    modalHookTest = document.getElementsByClassName(
      'x-window x-component x-window-maximized x-masked'
    )

    // console.log(modalHookTest)

    const bodyElement = document.getElementsByTagName('body')
    // console.log(bodyElement[0])
    // bodyModalHook = bodyElement[0].getElementsByClassName(
    //   '.x-window x-component x-window-maximized x-masked'
    // )
    bodyModalHook = bodyElement[0].getElementsByClassName(
      ' x-window x-component  x-window-maximized'
    )
    // console.log(bodyModalHook)

    // loadingDiv = htmlToElement(
    //   '<div class="ext-el-mask" style="display: block;"><div class="ext-el-mask-msg" style="display: block; left: 955px; top: 726px;"><div>Loading...</div></div></div>'
    // )

    // document.arrive('.ext-el-mask', function () {
    //   // console.log('removing loading dialog...')
    //   // console.log('inside arrive')
    //   // bodyModalHook[0].querySelector('.ext-el-mask').remove()
    //   // console.log('dialog removed')
    //   // frame reload
    //   // bodyModalHook[0].src += ''
    //   // Arrive.unbindAllArrive() // prob move into click handler
    //   Arrive.unbindAllArrive()
    // })

    // document.arrive('.ext-el-mask', function () {
    //   // console.log('removing loading dialog...')
    //   // console.log('inside arrive')
    //   // bodyModalHook[0].querySelector('.ext-el-mask').remove()
    //   // console.log('dialog removed')
    //   // frame reload
    //   // bodyModalHook[0].src += ''
    //   // Arrive.unbindAllArrive() // prob move into click handler
    //   Arrive.unbindAllArrive()
    // })

    // document.arrive('.ext-el-mask-msg', function () {
    //   // console.log('removing loading dialog...')
    //   // console.log('inside arrive')
    //   // bodyModalHook[0].querySelector('.ext-el-mask').remove()
    //   // console.log('dialog removed')
    //   // frame reload
    //   // bodyModalHook[0].src += ''
    //   // Arrive.unbindAllArrive() // prob move into click handler
    //   Arrive.unbindAllArrive()
    // })

    // document.arrive('.ext-el-mask-msg3', function () {
    //   // console.log('removing loading dialog...')
    //   // console.log('inside arrive')
    //   // bodyModalHook[0].querySelector('.ext-el-mask').remove()
    //   // console.log('dialog removed')
    //   // frame reload
    //   // bodyModalHook[0].src += ''
    //   // Arrive.unbindAllArrive() // prob move into click handler
    //   Arrive.unbindAllArrive()
    // })

    // let editorHook = document.getElementById('editor')

    // // console.log(editorHook)
    const loadingDiv = htmlToElement(
      '<div id ="configModalLoad" class="ext-el-mask" style="display: block;"><div id ="configModalLoadMsg" class="ext-el-mask-msg" style="display: block; left: 655px; top: 626px;"><div>Loading...</div></div></div>'
    )

    // const loadingDiv2 = htmlToElement('<div class="ext-el-mask-msg" style="display: block; left: 409px; top: 505px;"><div>Loading...</div></div>')
    // var loadingDiv = htmlToElement('<div class="ext-el-mask"  style="display: block; left: 655px; top: 626px;"><img src="/img/spinner_progress.gif" /></div>')
    // var _loadingImage = "/img/spinner_progress.gif";closeLoadingDialog();

    // const loadingDiv = htmlToElement('<div class="ext-el-mask-msg" style="color:black;font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;font-size: 8pt;visibility: visible;margin: 0;z-index: 101;position: absolute;border: 1px solid;background: repeat-x 0 -16px;padding: 2px;border-color: #6593cf;background-color: #c3daf9;background-image: url(../images/default/box/tb-blue.gif);display: block;left: 409px;top: 505px;"><div>Loading...</div></div>')


    // if (bodyModalHook[0]) {
    //   if (bodyModalHook[0].innerHTML.includes('<div class="ext-el-mask-msg" style="display: block; left: 409px; top: 505px;"><div>Loading...</div></div>')) {
    //     bodyModalHook[0].querySelectorAll('.ext-el-mask-msg').forEach(e => e.parentNode.removeChild(e))
    //   } else {
    //     bodyModalHook[0].appendChild(loadingDiv)
    //   }


      if(bodyModalHook[0] && (!bodyModalHook[0].innerHTML.includes('<div class="ext-el-mask" id ="configModalLoad" style="display: block;"><div class="ext-el-mask-msg" id="configModalLoadMsg" style="display: block; left: 655px; top: 626px;"><div>Loading...</div></div></div>'))){
        bodyModalHook[0].appendChild(loadingDiv)
      }
//       const currModal = document.querySelector('.ext-el-mask-msg')

      // logan test update local
      // document.querySelector("#editor").appendChild(loadingDiv)

      // document.querySelector("html > body > div:nth-of-type(2)")
//       // console.log(document.getElementsByTagName("iframe")[0]).click
      // console.log(document.getElementsByTagName("iframe")[1]).click


      // console.log("activeElement post loadingDiv append")
      // console.log(document.activeElement);

      // console.log(document.getElementsByTagName("iframe").document)
      // console.log(document.getElementsByTagName("iframe").contentDocument)
      // console.log(document.activeElement.contentDocument)
      // console.log(document.activeElement.contentDocument.innerHTML)

      

//       // console.log(document.activeElement.contentDocument.html.body)
      // console.log(document.activeElement.contentDocument.querySelector('#ext-el-mask-msg'))
      // console.log(document.activeElement.contentDocument.querySelector('#ext-el-mask'))
      // console.log(document.activeElement.document)

      // document.activeElement.getElementsByClassName('ext-el-mask-msg')[0].click
      // document.activeElement.getElementsByClassName('ext-el-mask')[0].click

//       document.activeElement.document.loadingDiv.click
//       document.activeElement.document.getElementsByClassName('ext-el-mask-msg')[0].click
//       document.activeElement.document.getElementsByClassName('ext-el-mask')[0].click
      // document.querySelector("html > body > div:nth-of-type(5)").appendChild(loadingDiv)
      // document.bodyCPQJS.openPopup("test1234", "test1234")
      // document.querySelector("#result").appendChild(loadingDiv)
      // body > table.page-content

      // console.log(document.getElementById('#frame_x-auto-171-area').contentWindow)

      // document.getElementsByTagName('iframe')[0].document.querySelector("#editor")

    // if (bodyModalHook[0]) {
    //   if (bodyModalHook[0].innerHTML.includes('<div class="ext-el-mask-msg" style="display: block; left: 409px; top: 505px;"><div>Loading...</div></div>')) {
    //     bodyModalHook[0].querySelectorAll('.ext-el-mask-msg').forEach(e => e.parentNode.removeChild(e))
    //   } else {
    //     bodyModalHook[0].appendChild(loadingDiv2)
    //   }
    //   const currModal = document.querySelector('.ext-el-mask-msg')
      // document.querySelector('.ext-el-mask-msg').remove
      // if (current.previousElementSibling.className === 'ext-el-mask-msg') {
      //       const prevSiblings = current.previousElementSibling
      //       // console.log(prevSiblings)
        //   // console.log("sib")
        //   }
    // }

    // color: black;
    // font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    // font-size: 8pt;
    // visibility: visible;
    // margin: 0;
    // z-index: 101;
    // position: absolute;
    // border: 1px solid;
    // background: repeat-x 0 -16px;
    // padding: 2px;
    // border-color: #6593cf;
    // background-color: #c3daf9;
    // background-image: url(../images/default/box/tb-blue.gif);
    // display: block;
    // left: 409px;
    // top: 505px;




  // }
    // if (bodyModalHook[0]) {
    //   if (bodyModalHook[0].innerHTML.includes('<div class="ext-el-mask" style="display: block;"><div class="ext-el-mask-msg" style="display: block; left: 655px; top: 626px;"><div>Loading...</div></div></div>')) {
    //     bodyModalHook[0].querySelectorAll('.ext-el-mask').forEach(e => e.parentNode.removeChild(e))
    //   } else {
    //     bodyModalHook[0].appendChild(loadingDiv)
    //   }
    //   // maybe check sibling and remove
    //   const current = document.querySelector('.ext-el-mask')
    //   if (current.previousElementSibling.className === 'ext-el-mask') {
    //     const prevSiblings = current.previousElementSibling
    //     // console.log(prevSiblings)
    //   // console.log("sib")
    //   }
    //   // document.body.click
    // }

    
    
    // var intervalID = setInterval(simulatedClick(bodyModalHook[0]), 5000); 

    const event = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    // const buttonEl = document.querySelector('.ext-el-mask');
    // buttonEl.dispatchEvent(event);
    // if(toggleModalPass){
    //   document.body.click
    // }

    // if(bodyModalHook[0]){
    // // bodyModalHook[0].click()
    // // }
    // setTimeout(() => {
    //   // console.log(bodyModalHook[0].querySelectorAll('.ext-el-mask'))

    //   // document.body.click()
    // }, 500);
    // if(bodyModalHook[0]){
    // // bodyModalHook[0].click()
    // }

    // document.body.click()
    document.querySelector('#area_search_replace > div.button > a:nth-child(7)')
    divXWindow = document.getElementsByClassName('x-toolbar-right')
    const elem = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    // console.log(elem)
    buttonCollection = document.getElementsByClassName('x-btn-text ')
    // oop through collection and check for "Validate"
    // for (const item of buttonCollection) {
    //   if (item.innerText === 'Validate') {
    //     // console.log('found validate button')
    //     validateButton = item
    //   }
    // }

    // focusMethod = function getFocus() {
    //   document.getElementById("bodyModalHook[0]").focus();
    // }
    // validateButton.click();
  },
  false //
)

function main () {
  const textArea = document.getElementById('textarea')
  // console.log(textArea)
  code = document.querySelector('#textarea').value
  // alert(code)

  const event = new CustomEvent('PassToBackground', { code })
  window.dispatchEvent(event)
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement (html) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.firstChild
}

// var td = htmlToElement('<td>foo</td>'),
//   div = htmlToElement('<div><span>nested</span> <span>stuff</span></div>')

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList}
 */
function htmlToElements (html) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content.childNodes
}

/*
 * arrive.js
 * v2.4.1
 * https://github.com/uzairfarooq/arrive
 * MIT licensed
 *
 * Copyright (c) 2014-2017 Uzair Farooq
 */

// var Arrive = (function (e, t, n) {
//   'use strict'
//   function r (e, t, n) {
//     l.addMethod(t, n, e.unbindEvent),
//     l.addMethod(t, n, e.unbindEventWithSelectorOrCallback),
//     l.addMethod(t, n, e.unbindEventWithSelectorAndCallback)
//   }
//   function i (e) {
//     ;(e.arrive = f.bindEvent),
//     r(f, e, 'unbindArrive'),
//     (e.leave = d.bindEvent),
//     r(d, e, 'unbindLeave')
//   }
//   if (e.MutationObserver && typeof HTMLElement !== 'undefined') {
//     let o = 0
//     var l = (function () {
//       const t =
//           HTMLElement.prototype.matches ||
//           HTMLElement.prototype.webkitMatchesSelector ||
//           HTMLElement.prototype.mozMatchesSelector ||
//           HTMLElement.prototype.msMatchesSelector
//       return {
//         matchesSelector: function (e, n) {
//           return e instanceof HTMLElement && t.call(e, n)
//         },
//         addMethod: function (e, t, r) {
//           const i = e[t]
//           e[t] = function () {
//             return r.length == arguments.length
//               ? r.apply(this, arguments)
//               : typeof i === 'function'
//                 ? i.apply(this, arguments)
//                 : n
//           }
//         },
//         callCallbacks: function (e, t) {
//           t && t.options.onceOnly && t.firedElems.length == 1 && (e = [e[0]])
//           for (var n, r = 0; (n = e[r]); r++) { n && n.callback && n.callback.call(n.elem, n.elem) }
//           t &&
//               t.options.onceOnly &&
//               t.firedElems.length == 1 &&
//               t.me.unbindEventWithSelectorAndCallback.call(
//                 t.target,
//                 t.selector,
//                 t.callback
//               )
//         },
//         checkChildNodesRecursively: function (e, t, n, r) {
//           for (var i, o = 0; (i = e[o]); o++) {
//             n(i, t, r) && r.push({ callback: t.callback, elem: i }),
//             i.childNodes.length > 0 &&
//                   l.checkChildNodesRecursively(i.childNodes, t, n, r)
//           }
//         },
//         mergeArrays: function (e, t) {
//           let n
//           const r = {}
//           for (n in e) e.hasOwnProperty(n) && (r[n] = e[n])
//           for (n in t) t.hasOwnProperty(n) && (r[n] = t[n])
//           return r
//         },
//         toElementsArray: function (t) {
//           return (
//             n === t || (typeof t.length === 'number' && t !== e) || (t = [t]),
//             t
//           )
//         }
//       }
//     })()
//     const c = (function () {
//       const e = function () {
//         ;(this._eventsBucket = []),
//         (this._beforeAdding = null),
//         (this._beforeRemoving = null)
//       }
//       return (
//         (e.prototype.addEvent = function (e, t, n, r) {
//           const i = {
//             target: e,
//             selector: t,
//             options: n,
//             callback: r,
//             firedElems: []
//           }
//           return (
//             this._beforeAdding && this._beforeAdding(i),
//             this._eventsBucket.push(i),
//             i
//           )
//         }),
//         (e.prototype.removeEvent = function (e) {
//           for (
//             var t, n = this._eventsBucket.length - 1;
//             (t = this._eventsBucket[n]);
//             n--
//           ) {
//             if (e(t)) {
//               this._beforeRemoving && this._beforeRemoving(t)
//               const r = this._eventsBucket.splice(n, 1)
//               r && r.length && (r[0].callback = null)
//             }
//           }
//         }),
//         (e.prototype.beforeAdding = function (e) {
//           this._beforeAdding = e
//         }),
//         (e.prototype.beforeRemoving = function (e) {
//           this._beforeRemoving = e
//         }),
//         e
//       )
//     })()
//     const a = function (t, r) {
//       const i = new c()
//       const o = this
//       const a = { fireOnAttributesModification: !1 }
//       return (
//         i.beforeAdding(function (n) {
//           let i
//           let l = n.target
//             ;(l === e.document || l === e) &&
//               (l = document.getElementsByTagName('html')[0]),
//           (i = new MutationObserver(function (e) {
//             r.call(this, e, n)
//           }))
//           const c = t(n.options)
//           i.observe(l, c), (n.observer = i), (n.me = o)
//         }),
//         i.beforeRemoving(function (e) {
//           e.observer.disconnect()
//         }),
//         (this.bindEvent = function (e, t, n) {
//           t = l.mergeArrays(a, t)
//           for (let r = l.toElementsArray(this), o = 0; o < r.length; o++) { i.addEvent(r[o], e, t, n) }
//         }),
//         (this.unbindEvent = function () {
//           const e = l.toElementsArray(this)
//           i.removeEvent(function (t) {
//             for (let r = 0; r < e.length; r++) { if (this === n || t.target === e[r]) return !0 }
//             return !1
//           })
//         }),
//         (this.unbindEventWithSelectorOrCallback = function (e) {
//           let t
//           const r = l.toElementsArray(this)
//           const o = e
//             ;(t =
//               typeof e === 'function'
//                 ? function (e) {
//                     for (let t = 0; t < r.length; t++) {
//                       if ((this === n || e.target === r[t]) && e.callback === o) { return !0 }
//                     }
//                     return !1
//                   }
//                 : function (t) {
//                   for (let i = 0; i < r.length; i++) {
//                     if ((this === n || t.target === r[i]) && t.selector === e) { return !0 }
//                   }
//                   return !1
//                 }),
//           i.removeEvent(t)
//         }),
//         (this.unbindEventWithSelectorAndCallback = function (e, t) {
//           const r = l.toElementsArray(this)
//           i.removeEvent(function (i) {
//             for (let o = 0; o < r.length; o++) {
//               if (
//                 (this === n || i.target === r[o]) &&
//                   i.selector === e &&
//                   i.callback === t
//               ) { return !0 }
//             }
//             return !1
//           })
//         }),
//         this
//       )
//     }
//     const s = function () {
//       function e (e) {
//         const t = { attributes: !1, childList: !0, subtree: !0 }
//         return e.fireOnAttributesModification && (t.attributes = !0), t
//       }
//       function t (e, t) {
//         e.forEach(function (e) {
//           const n = e.addedNodes
//           const i = e.target
//           const o = []
//           n !== null && n.length > 0
//             ? l.checkChildNodesRecursively(n, t, r, o)
//             : e.type === 'attributes' &&
//                 r(i, t, o) &&
//                 o.push({ callback: t.callback, elem: i }),
//           l.callCallbacks(o, t)
//         })
//       }
//       function r (e, t) {
//         return l.matchesSelector(e, t.selector) &&
//             (e._id === n && (e._id = o++), t.firedElems.indexOf(e._id) == -1)
//           ? (t.firedElems.push(e._id), !0)
//           : !1
//       }
//       const i = { fireOnAttributesModification: !1, onceOnly: !1, existing: !1 }
//       f = new a(e, t)
//       const c = f.bindEvent
//       return (
//         (f.bindEvent = function (e, t, r) {
//           n === r ? ((r = t), (t = i)) : (t = l.mergeArrays(i, t))
//           const o = l.toElementsArray(this)
//           if (t.existing) {
//             for (var a = [], s = 0; s < o.length; s++) {
//               for (let u = o[s].querySelectorAll(e), f = 0; f < u.length; f++) { a.push({ callback: r, elem: u[f] }) }
//             }
//             if (t.onceOnly && a.length) return r.call(a[0].elem, a[0].elem)
//             setTimeout(l.callCallbacks, 1, a)
//           }
//           c.call(this, e, t, r)
//         }),
//         f
//       )
//     }
//     const u = function () {
//       function e () {
//         const e = { childList: !0, subtree: !0 }
//         return e
//       }
//       function t (e, t) {
//         e.forEach(function (e) {
//           const n = e.removedNodes
//           const i = []
//           n !== null &&
//               n.length > 0 &&
//               l.checkChildNodesRecursively(n, t, r, i),
//           l.callCallbacks(i, t)
//         })
//       }
//       function r (e, t) {
//         return l.matchesSelector(e, t.selector)
//       }
//       const i = {}
//       d = new a(e, t)
//       const o = d.bindEvent
//       return (
//         (d.bindEvent = function (e, t, r) {
//           n === r ? ((r = t), (t = i)) : (t = l.mergeArrays(i, t)),
//           o.call(this, e, t, r)
//         }),
//         d
//       )
//     }
//     var f = new s()
//     var d = new u()
//     t && i(t.fn),
//     i(HTMLElement.prototype),
//     i(NodeList.prototype),
//     i(HTMLCollection.prototype),
//     i(HTMLDocument.prototype),
//     i(Window.prototype)
//     const h = {}
//     return r(f, h, 'unbindAllArrive'), r(d, h, 'unbindAllLeave'), h
//   }
// })(window, typeof jQuery === 'undefined' ? null : jQuery, void 0)
