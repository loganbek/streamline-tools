# OLD CODE
  
  ```js
  console.log(document.getElementsByTagName('iframe')[1])
  console.log('CONTENT DOCUMENT')
  console.log(document.getElementsByTagName('iframe')[1].contentDocument)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.innerHTML)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.html)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.body.querySelector('#textarea').parent)
  console.log('CONTENT WINDOW')
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.window)
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.innerHTML)
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.html)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea').value)


  // ----------------------------------------------------------------

// if (document.getElementsByName('varName')[0]) {
//     filename = document.getElementsByName('varName')[0].value;
//     alert(filename);
// }
// GRAB COMM RULES VARNAME
// filenameElements = document.getElementsByName('varName');
// if (filenameElements.length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     // STORE
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me from background!!");
//         console.log(filename);
//         console.log(result.variable_name);
//     });
// }
// GRAB COMM ACTIONS VAR NAME
// #general > table > tbody > tr:nth-child(3) > td.form-input
// commActionFileNameElement = document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input");
// commActionFileName = commActionFileNameElement.innertext;
console.log(commActionFileNameElement);
console.log(commActionFileName);
// var rule1 = {
//     conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: 'www.google.com', schemes: ['https'] },
//             css: ["input[type='password']"]
//         })
//     ],
//     actions: [new chrome.declarativeContent.ShowPageAction()]
// };

// var rule2 = {
//     conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//             pageUrl: { hostEquals: 'www.google.com', schemes: ['https'] },
//             css: ["input[type='password']"]
//         }),
//         new chrome.declarativeContent.PageStateMatcher({
//             css: ["video"]
//         })
//     ],
//     actions: [new chrome.declarativeContent.ShowPageAction()]
// };

// chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//         chrome.declarativeContent.onPageChanged.addRules([rule2]);
//     });
// });

// chrome.runtime.onInstalled.addListener(function(details) {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
//       chrome.declarativeContent.onPageChanged.addRules([rule2]);
//     });
//   });

// CSS Matching
// PageStateMatcher.css conditions must be compound selectors, meaning that you can't include combinators like whitespace or ">" in your selectors. This helps Chrome match the selectors more efficiently.

// Compound Selectors (OK) Complex Selectors (Not OK)
// a div p
// iframe.special[src^='http'] p>span.highlight
// ns|* p + ol
// #abcd:checked p::first-line
// CSS conditions only match displayed elements: if an element that matches your selector is display:none or one of its parent elements is display:none, it doesn't cause the condition to match. Elements styled with visibility:hidden, positioned off-screen, or hidden by other elements can still make your condition match.

// Matches if the conditions of the UrlFilter are fulfilled for the top-level URL of the page.

// string (optional) hostContains
// Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.

// string (optional) hostEquals
// Matches if the host name of the URL is equal to a specified string.

// string (optional) hostPrefix
// Matches if the host name of the URL starts with a specified string.

// string (optional) hostSuffix
// Matches if the host name of the URL ends with a specified string.

// string (optional) pathContains
// Matches if the path segment of the URL contains a specified string.

// string (optional) pathEquals
// Matches if the path segment of the URL is equal to a specified string.

// string (optional) pathPrefix
// Matches if the path segment of the URL starts with a specified string.

// string (optional) pathSuffix
// Matches if the path segment of the URL ends with a specified string.

// string (optional) queryContains
// Matches if the query segment of the URL contains a specified string.

// string (optional) queryEquals
// Matches if the query segment of the URL is equal to a specified string.

// string (optional) queryPrefix
// Matches if the query segment of the URL starts with a specified string.

// string (optional) querySuffix
// Matches if the query segment of the URL ends with a specified string.

// string (optional) urlContains
// Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.

// string (optional) urlEquals
// Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.

// string (optional) urlMatches
// Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.

// string (optional) originAndPathMatches
// Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.

// string (optional) urlPrefix
// Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.

// string (optional) urlSuffix
// Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.

// array of string (optional) schemes
// Matches if the scheme of the URL is equal to any of the schemes specified in the array.

// array of integer or array of integer (optional) ports
// Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.

// chrome.browserAction.setBadgeText({ text: 'ON' });
// chrome.browserAction.setBadgeBackgroundColor({ color: '#4688F1' })

// // Regex-pattern to check URLs against.
// // It matches URLs like: http[s]://[...]stackoverflow.com[...]
// var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?bigmachines\.com/;

// // A function to use as callback
// function doStuffWithDom(domContent) {
//   console.log('I received the following DOM content:\n' + domContent);
// }

// // When the browser-action button is clicked...
// chrome.browserAction.onInstalled.addListener(function (tab) {
//   // ...check the URL of the active tab against our pattern and...
//   if (urlRegex.test(tab.url)) {
//     // ...if it matches, send a message specifying a callback too
//     chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDom);
//   }
// });

/* STUB| FROM BACKGROUND SCRIPT */
// chrome.browserAction.setBadgeText(object details, function callback)

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });

// chrome.browserAction.setBadgeText({text: 'ON'});
// chrome.browserAction.setBadgeBackgroundColor({color: '#4688F1'});

// Commerce Functions - "https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}}&token=cplHV3EHCvzBzOvLBAgOhoKF4m8";
// Util Functions - "https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274172483%27,folder_id:%274133367%27,process_id:%27-1%27,doc_id:%27-1%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274172483%27,folder_id:%274133367%27,process_id:%27-1%27,doc_id:%27-1%27}}&token=cplHV3EHCvzBzOvLBAgOhoKF4m8";

   console.log(bodyModalHook[0].getElementsByTagName('iframe'))
    // TEXT AREA ONCHANGE
    console.log('TEXTAREA ONCHANGE()')
    // function customOnClickEvent (event) {
    //   console.log(document.querySelector('.ext-el-mask'))
    //   document.querySelector('.ext-el-mask').remove()
    // }

    // // *REMOVE MODAL CODE
    // // window.addEventListener('click', customOnClickEvent)

    // // *watch for element creation in the whole HTML document
    // document.arrive('.test-elem', function () {
    //   // *'this' refers to the newly created element
    // })

    // // *this will attach arrive event to all elements in the NodeList
    // document
    //   .getElementsByClassName('.container-1')
    //   .arrive('.test-elem', function () {
    //     // *'this' refers to the newly created element
    //   })
    // // *Make sure to remove listeners when they are no longer needed, it's better for performance:

    // // *unbind all arrive events on document element
    // $(document).unbindArrive()

    // // *unbind all arrive events on document element which are watching for ".test-elem" selector
    // $(document).unbindArrive('.test-elem')

    // // *unbind only a specific callback
    // $(document).unbindArrive(callbackFunc)

    // // *unbind only a specific callback on ".test-elem" selector
    // $(document).unbindArrive('.test-elem', callbackFunc)

    // // *unbind all arrive events
    // Arrive.unbindAllArrive()

    // * MODAL DIV STYLE
    // const modalDiv = document.createElement('div')
    // modalDiv.className = 'ext-el-mask-msg'
    // modalDiv.style.color = 'black'
    // modalDiv.style.fontFamily = 'Helvetica Neue, Helvetica, Ariel, sans-serif'
    // modalDiv.style.visibility = 'visible'
    // modalDiv.style.margin = '0'
    // modalDiv.style.zIndex = '101'
    // modalDiv.style.position = 'absolute'
    // modalDiv.style.border = '1px solid'
    // modalDiv.style.background = 'repeat-x 0 -16px'
    // modalDiv.style.padding = '2px'
    // modalDiv.style.borderColor = '#6593cf'
    // modalDiv.style.backgroundColor = '#c3daf9'
    // modalDiv.style.backgroundImage = 'url(../images/default/box/tb-blue.gif)'
    // modalDiv.style.display = 'block'
    // modalDiv.style.left = '1014px'
    // modalDiv.style.top = '694px'

    // * INNER DIV STYLE
    // const innerDiv = document.createElement('div')
    // modalDiv.style.visibility = 'visible'
    // modalDiv.style.margin = '0'
    // modalDiv.style.padding = '5px 10px 5px 10px'
    // modalDiv.style.border = '1px solid'
    // modalDiv.style.cursor = 'wait'
    // modalDiv.style.backgroundColor = 'white'
    // modalDiv.style.borderColor = '#a3bad9'
    // modalDiv.style.color = '#222'
    // modalDiv.style.font = 'normal 11px tahoma, arial, helvetica, sansCerif'
    // innerDiv.innerText = 'Loading...'

    // textarea.onchange()

    console.log('x-toolbar-right')
    
    console.log(divXWindow)

    // for (const item of divXWindow) {
    //   console.log(item)
    //   item.click()
    // }


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

// function displayConfigModal () {
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
//   const modalDiv = document.createElement('div')

//   modalDiv.className = 'ext-el-mask-msg'
//   // color: black;
//   // font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//   // font-size: 8pt;
//   // visibility: visible;
//   // margin: 0;
//   // z-index: 101;
//   // position: absolute;
//   // border: 1px solid;
//   // background: repeat-x 0 -16px;
//   // padding: 2px;
//   // border-color: #6593cf;
//   // background-color: #c3daf9;
//   // background-image: url(../images/default/box/tb-blue.gif);
//   // display: block;
//   // left: 955px;
//   // top: 726px;
//   modalDiv.style.color = 'black'
//   modalDiv.style.fontFamily = 'Helvetica Neue, Helvetica, Ariel, sans-serif'
//   modalDiv.style.visibility = 'visible'
//   modalDiv.style.margin = '0'
//   modalDiv.style.zIndex = '101'
//   modalDiv.style.position = 'absolute'
//   modalDiv.style.border = '1px solid'
//   modalDiv.style.background = 'repeat-x 0 -16px'
//   modalDiv.style.padding = '2px'
//   modalDiv.style.borderColor = '#6593cf'
//   modalDiv.style.backgroundColor = '#c3daf9'
//   modalDiv.style.backgroundImage = 'url(../images/default/box/tb-blue.gif)'
//   modalDiv.style.display = 'block'
//   modalDiv.style.left = '1014px'
//   modalDiv.style.top = '694px'

//   const innerDiv = document.createElement('div')
//   modalDiv.style.visibility = 'visible'
//   modalDiv.style.margin = '0'
//   modalDiv.style.padding = '5px 10px 5px 10px'
//   modalDiv.style.border = '1px solid'
//   modalDiv.style.cursor = 'wait'
//   modalDiv.style.backgroundColor = 'white'
//   modalDiv.style.borderColor = '#a3bad9'
//   modalDiv.style.color = '#222'
//   modalDiv.style.font = 'normal 11px tahoma, arial, helvetica, sansCerif'
//   innerDiv.innerText = 'Loading...'

//   // document.body.onload = addElement

//   // function addElement () {
//   //   // create a new div element
//   //   const newDiv = document.createElement("div");

//   //   // and give it some content
//   //   const newContent = document.createTextNode("Hi there and greetings!");

//   //   // add the text node to the newly created div
//   //   newDiv.appendChild(newContent);

//   //   // add the newly created element and its content into the DOM
//   //   const currentDiv = document.getElementById("div1");
//   //   document.body.insertBefore(newDiv, currentDiv);
//   // }

//   // 2) BM PAGE DOM SELECTOR
//   // modalHook = getElementById('temp')
//   modalHook = document.getElementsByClassName(
//     'x-window x-component x-window-maximized x-masked'
//   )[0] // new modalHook

//   modalHookTest = document.getElementsByClassName(
//     'x-window x-component x-window-maximized x-masked'
//   )

//   console.log(modalHookTest)

//   // 3) APPEND MODAL
//   // modalHook.appendChild(modalDiv)

//   // MB OUTSIDE displayConfigModal()
//   target = document.getElementById('editor')
//   console.log(target)
//   // CONFIG MODAL CLICK LISTENER
//   target.addEventListener('click', modalClickHAndler, { once: true })
// }

// // TODO FINISH CLICK HANDLER
// function modalClickHAndler () {
//   // REMOVE MODAL
//   modalHook.removeChild()
// }

// let editorHook = document.getElementById('editor')

console.log(editorHook)

// var walker = document.createTreeWalker(
//   editorHook,
//   NodeFilter.SHOW_ELEMENT // only elements
// )
// while (walker.nextNode()) {
//   let current = walker.currentNode
//   console.log(
//     current.tagName,
//     [...current.attributes].map(({ value, name }) => `${name}=${value}`).join()
//   )
// }

  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);
}
  // if (document.title) {
  //     alert(document.title);
  // }
  // if (textArea.value) {
  //     alert(textArea.value);
  //     code = textArea.value;
  // }
  //     document.querySelector("#textarea").value = "test";
  //     document.querySelector("#textarea").textareaFocused = true;
  //     document.getElementById("textarea").value = code;
  //     document.getElementById("textarea").textareaFocused = true;
  // Perform Validation
  // document.getElementById('ext-gen22').click();
  // document.getElementsByClassName('bmx-spellcheck')[0].click();
  // frame_bm_script.editArea.textarea.value = code;
  // frame_bm_script.editArea.textareaFocused = true;
  // frame_bm_script_id.editArea.textarea.value = code;
  // frame_bm_script_id.editArea.textareaFocused = true;


// Listen for the code event
// window.addEventListener("PassCodeToBackground", function(evt) {
//     code = evt.detail;
// }, false);

// Listen for unload code event
// window.addEventListener('unloadCode', function(evt) {
//     //     alert(frame_bm_script.editArea.textarea.value);
//     let code = document.getElementById('textarea');
//     alert(code);
//     let event = new CustomEvent("PassCodeToBackground", { detail: code });
//     window.dispatchEvent(event);
// }, false);


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

// function displayConfigModal () {
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
//   const modalDiv = document.createElement('div')

//   modalDiv.className = 'ext-el-mask-msg'
//   // color: black;
//   // font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
//   // font-size: 8pt;
//   // visibility: visible;
//   // margin: 0;
//   // z-index: 101;
//   // position: absolute;
//   // border: 1px solid;
//   // background: repeat-x 0 -16px;
//   // padding: 2px;
//   // border-color: #6593cf;
//   // background-color: #c3daf9;
//   // background-image: url(../images/default/box/tb-blue.gif);
//   // display: block;
//   // left: 955px;
//   // top: 726px;
//   modalDiv.style.color = 'black'
//   modalDiv.style.fontFamily = 'Helvetica Neue, Helvetica, Ariel, sans-serif'
//   modalDiv.style.visibility = 'visible'
//   modalDiv.style.margin = '0'
//   modalDiv.style.zIndex = '101'
//   modalDiv.style.position = 'absolute'
//   modalDiv.style.border = '1px solid'
//   modalDiv.style.background = 'repeat-x 0 -16px'
//   modalDiv.style.padding = '2px'
//   modalDiv.style.borderColor = '#6593cf'
//   modalDiv.style.backgroundColor = '#c3daf9'
//   modalDiv.style.backgroundImage = 'url(../images/default/box/tb-blue.gif)'
//   modalDiv.style.display = 'block'
//   modalDiv.style.left = '1014px'
//   modalDiv.style.top = '694px'

//   const innerDiv = document.createElement('div')
//   modalDiv.style.visibility = 'visible'
//   modalDiv.style.margin = '0'
//   modalDiv.style.padding = '5px 10px 5px 10px'
//   modalDiv.style.border = '1px solid'
//   modalDiv.style.cursor = 'wait'
//   modalDiv.style.backgroundColor = 'white'
//   modalDiv.style.borderColor = '#a3bad9'
//   modalDiv.style.color = '#222'
//   modalDiv.style.font = 'normal 11px tahoma, arial, helvetica, sansCerif'
//   innerDiv.innerText = 'Loading...'

//   // document.body.onload = addElement

//   // function addElement () {
//   //   // create a new div element
//   //   const newDiv = document.createElement("div");

//   //   // and give it some content
//   //   const newContent = document.createTextNode("Hi there and greetings!");

//   //   // add the text node to the newly created div
//   //   newDiv.appendChild(newContent);

//   //   // add the newly created element and its content into the DOM
//   //   const currentDiv = document.getElementById("div1");
//   //   document.body.insertBefore(newDiv, currentDiv);
//   // }

//   // 2) BM PAGE DOM SELECTOR
//   // modalHook = getElementById('temp')
//   modalHook = document.getElementsByClassName(
//     'x-window x-component x-window-maximized x-masked'
//   )[0] // new modalHook

//   modalHookTest = document.getElementsByClassName(
//     'x-window x-component x-window-maximized x-masked'
//   )

//   console.log(modalHookTest)

//   // 3) APPEND MODAL
//   // modalHook.appendChild(modalDiv)

//   // MB OUTSIDE displayConfigModal()
//   target = document.getElementById('editor')
//   console.log(target)
//   // CONFIG MODAL CLICK LISTENER
//   target.addEventListener('click', modalClickHAndler, { once: true })
// }

// // TODO FINISH CLICK HANDLER
// function modalClickHAndler () {
//   // REMOVE MODAL
//   modalHook.removeChild()
// }

// let editorHook = document.getElementById('editor')

console.log(editorHook)

// var walker = document.createTreeWalker(
//   editorHook,
//   NodeFilter.SHOW_ELEMENT // only elements
// )
// while (walker.nextNode()) {
//   let current = walker.currentNode
//   console.log(
//     current.tagName,
//     [...current.attributes].map(({ value, name }) => `${name}=${value}`).join()
//   )
// }

  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);

  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);
  // if (document.title) {
  //     alert(document.title);
  // }
  // if (textArea.value) {
  //     alert(textArea.value);
  //     code = textArea.value;
  // }

  //     document.querySelector("#textarea").value = "test";
  //     document.querySelector("#textarea").textareaFocused = true;
  //     document.getElementById("textarea").value = code;
  //     document.getElementById("textarea").textareaFocused = true;
  // Perform Validation
  // document.getElementById('ext-gen22').click();
  // document.getElementsByClassName('bmx-spellcheck')[0].click();
  // frame_bm_script.editArea.textarea.value = code;
  // frame_bm_script.editArea.textareaFocused = true;
  // frame_bm_script_id.editArea.textarea.value = code;
  // frame_bm_script_id.editArea.textareaFocused = true;
// Listen for the code event
// window.addEventListener("PassCodeToBackground", function(evt) {
//     code = evt.detail;
// }, false);

// Listen for unload code event
// window.addEventListener('unloadCode', function(evt) {
//     //     alert(frame_bm_script.editArea.textarea.value);
//     let code = document.getElementById('textarea');
//     alert(code);
//     let event = new CustomEvent("PassCodeToBackground", { detail: code });
//     window.dispatchEvent(event);
// }, false);
  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);

  //     document.querySelector("#textarea").value = "test";
  //     document.querySelector("#textarea").textareaFocused = true;
  //     document.getElementById("textarea").value = code;
  //     document.getElementById("textarea").textareaFocused = true;
  // Perform Validation
  // document.getElementById('ext-gen22').click();
  // document.getElementsByClassName('bmx-spellcheck')[0].click();

// // ACTIONS BEFORE/AFTER FORMULAS FN
// if (document.title.includes("After")) {
//     // SYNC
//     // var filenameAfter;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameAfter = result.commerceFileName;
//         console.log(filenameAfter);
//     });
//     console.log(filenameAfter);
//     var filenameAfterFinal = filenameAfter + ".afterFormulas";
//     console.log(filenameAfterFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameAfterFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameAfterFinal);
//     });
// }
// if (document.title.includes("Before")) {
//     // SYNC
//     // var filenameBefore;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameBefore = result.commerceFileName;
//         console.log(filenameBefore);
//     });
//     console.log(filenameBefore);
//     var filenameBeforeFinal = filenameBefore + ".beforeFormulas";
//     console.log(filenameBeforeFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameBeforeFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameBeforeFinal);
//     });
// }

// function injectJs(link) {
//     let scr = document.createElement('script');
//     scr.type = "text/javascript";
//     scr.src = link;
//     document.getElementsByTagName('head')[0].appendChild(scr);
// }

// injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // let filename = document.getElementById('variableName').value;
//         // if (filename === "") {
//         //     filename = "nofilename";
//         // }
//         let filename = "addVendor_quote.beforeModify";
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(request.greeting ?
//             "greeting: " + request.greeting :
//             "nogreeting");
//         if (request.greeting == "unload") {
//             let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
//             window.dispatchEvent(unloadEvent);
//             // if (!code.startsWith(commentHeader)) {
//             //     code = commentHeader + "\n\n" + code;
//             // }
//             sendResponse({
//                 filename: filename,
//                 code: code
//             });
//         } else if (request.greeting == "load") {
//             let loadEvent = new CustomEvent("loadCode", { detail: request.code });
//             window.dispatchEvent(loadEvent);
//             // } else if (request.greeting == "filename") {
//             //     sendResponse({
//             //         filename: filename
//             //     });
//         }
//         // return true; - DOESNT FIX
//     });

// let commentHeader = "";
// let code = "";
// let testCode = "";
// VARNAME PAGE CODE
// if (document.getElementsByName('varName').length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm rules");
//         console.log(filename);
//         console.log(result.variable_name);
//     });
// }

  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);
// if (document.title) {
  //     alert(document.title);
  // }
  // if (textArea.value) {
  //     alert(textArea.value);
  //     code = textArea.value;
  // }
  //     document.querySelector("#textarea").value = "test";
  //     document.querySelector("#textarea").textareaFocused = true;
  //     document.getElementById("textarea").value = code;
  //     document.getElementById("textarea").textareaFocused = true;
  // Perform Validation
  // document.getElementById('ext-gen22').click();
  // document.getElementsByClassName('bmx-spellcheck')[0].click();
// Listen for the code event
// window.addEventListener("PassCodeToBackground", function(evt) {
//     code = evt.detail;
// }, false);

// Listen for unload code event
// window.addEventListener('unloadCode', function(evt) {
//     //     alert(frame_bm_script.editArea.textarea.value);
//     let code = document.getElementById('textarea');
//     alert(code);
//     let event = new CustomEvent("PassCodeToBackground", { detail: code });
//     window.dispatchEvent(event);
// }, false);
// function injectJs(link) {
//     let scr = document.createElement('script');
//     scr.type = "text/javascript";
//     scr.src = link;
//     document.getElementsByTagName('head')[0].appendChild(scr);
// }

// injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // let filename = document.getElementById('variableName').value;
//         // if (filename === "") {
//         //     filename = "nofilename";
//         // }
//         let filename = "addVendor_quote.beforeModify";
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(request.greeting ?
//             "greeting: " + request.greeting :
//             "nogreeting");
//         if (request.greeting == "unload") {
//             let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
//             window.dispatchEvent(unloadEvent);
//             // if (!code.startsWith(commentHeader)) {
//             //     code = commentHeader + "\n\n" + code;
//             // }
//             sendResponse({
//                 filename: filename,
//                 code: code
//             });
//         } else if (request.greeting == "load") {
//             let loadEvent = new CustomEvent("loadCode", { detail: request.code });
//             window.dispatchEvent(loadEvent);
//             // } else if (request.greeting == "filename") {
//             //     sendResponse({
//             //         filename: filename
//             //     });
//         }
//         // return true; - DOESNT FIX
//     });

// let commentHeader = "";
// let code = "";
// let testCode = "";
// // ACTIONS BEFORE/AFTER FORMULAS FN
// if (document.title.includes("After")) {
//     // SYNC
//     // var filenameAfter;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameAfter = result.commerceFileName;
//         console.log(filenameAfter);
//     });
//     console.log(filenameAfter);
//     var filenameAfterFinal = filenameAfter + ".afterFormulas";
//     console.log(filenameAfterFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameAfterFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameAfterFinal);
//     });
// }
// if (document.title.includes("Before")) {
//     // SYNC
//     // var filenameBefore;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameBefore = result.commerceFileName;
//         console.log(filenameBefore);
//     });
//     console.log(filenameBefore);
//     var filenameBeforeFinal = filenameBefore + ".beforeFormulas";
//     console.log(filenameBeforeFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameBeforeFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameBeforeFinal);
//     });
// }

 //     // GRAB COMM FN
    //     // var commerceFileName =

    //     //POPUP UNLOAD QUERY
    //     // chrome.tabs.query({currentWindow: true}), function(tabs){
    //     //     chrome.tabs.sendMessage(tabs[0].id, { greeting: "getCommerceFilename" }, function(response) {
    //     //     consoleonsole.log(response.commerceFileName);
    //     //     });
    //     // });

    //     // SEND COMM FN RESPONSE
    //     sendResponse({
    //         filename: "commerceFilename"
    //     });

    // }
    // return true;
    // return true;
    // }
    // return true;
//   })

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

// ```html <input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" readonly="" disabled="" style="width: 260px;">```

// if (document.querySelector("#x-auto-3-input")) {
//     filename = document.querySelector("#x-auto-3-input").value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
// }

// let elements = document.getElementsByClassName("varName");
console.log(elements);

// if (elements[0]) {
//     console.log(elements[0].value);
//     console.log(elements[0].nodeValue);
//     filename = elements[0].value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
//     console.log(filename);
// }

// if (window.document.querySelector(".varName")) {
//     filename = window.document.querySelector(".varName");
//     console.log(filename);
// }

// #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]

// WIP COMMERCE FN TRIALS

// if (document.getElementsByName('varName')[0]) {
// filename = document.getElementsByName('varName')[0].value;
console.log(filename);
// }

// if (document.querySelector('[name="variable_name"]')) {
//     filename = document.querySelector('[name="variable_name"]');
// }

// if (window.document.querySelector('[name="variable_name"]')) {
//     filename = window.document.querySelector('[name="variable_name"]');
// }
// if (document.getElementsByName('varName').length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm rules");
//         console.log(filename);
//         console.log(result.variable_name);
//     });
// }

// if ((document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== null) && (document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== undefined)) {
//     filename = document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]").value;
//     // commActionFileName = commActionFileNameElement.innertext;
//     // #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]
//     console.log(filename);

//     console.log(commActionFileName);
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filename);
//     });
// }

// if (document.getElementsByName('varName').length > 0) {
//   filename = document.getElementsByName('varName')[0].value
//   chrome.storage.sync.set({ commerceFileName: filename }, function () {
//     console.log('you saved me!! comm rules')
//     console.log(filename)
//     console.log(result.variable_name);
//   })
// }

// if ((document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]') !== null) && (document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]') !== undefined)) {
//   filename = document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]').value
  // commActionFileName = commActionFileNameElement.innertext;
  // #general > table > tbody > tr
  // let elements = document.getElementsByClassName("varName");
  console.log(elements);
  console.log(elements[0].value);
// if (document.title) {
  //     alert(document.title);
  // }
  // if (textArea.value) {
  //     alert(textArea.value);
  //     code = textArea.value;
  // }
  //     document.querySelector("#textarea").value = "test";
  //     document.querySelector("#textarea").textareaFocused = true;
  //     document.getElementById("textarea").value = code;
  //     document.getElementById("textarea").textareaFocused = true;
  // Perform Validation
  // document.getElementById('ext-gen22').click();
  // document.getElementsByClassName('bmx-spellcheck')[0].click();
// Listen for the code event
// window.addEventListener("PassCodeToBackground", function(evt) {
//     code = evt.detail;
// }, false);

// Listen for unload code event
// window.addEventListener('unloadCode', function(evt) {
//     //     alert(frame_bm_script.editArea.textarea.value);
//     let code = document.getElementById('textarea');
//     alert(code);
//     let event = new CustomEvent("PassCodeToBackground", { detail: code });
//     window.dispatchEvent(event);
// }, false);
// function injectJs(link) {
//     let scr = document.createElement('script');
//     scr.type = "text/javascript";
//     scr.src = link;
//     document.getElementsByTagName('head')[0].appendChild(scr);
// }

// injectJs(chrome.extension.getURL('adminCommerceInjected.js'));

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // let filename = document.getElementById('variableName').value;
//         // if (filename === "") {
//         //     filename = "nofilename";
//         // }
//         let filename = "addVendor_quote.beforeModify";
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         console.log(request.greeting ?
//             "greeting: " + request.greeting :
//             "nogreeting");
//         if (request.greeting == "unload") {
//             let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
//             window.dispatchEvent(unloadEvent);
//             // if (!code.startsWith(commentHeader)) {
//             //     code = commentHeader + "\n\n" + code;
//             // }
//             sendResponse({
//                 filename: filename,
//                 code: code
//             });
//         } else if (request.greeting == "load") {
//             let loadEvent = new CustomEvent("loadCode", { detail: request.code });
//             window.dispatchEvent(loadEvent);
//             // } else if (request.greeting == "filename") {
//             //     sendResponse({
//             //         filename: filename
//             //     });
//         }
//         // return true; - DOESNT FIX
//     });

// let commentHeader = "";
// let code = "";
// let testCode = "";
// // ACTIONS BEFORE/AFTER FORMULAS FN
// if (document.title.includes("After")) {
//     // SYNC
//     // var filenameAfter;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameAfter = result.commerceFileName;
//         console.log(filenameAfter);
//     });
//     console.log(filenameAfter);
//     var filenameAfterFinal = filenameAfter + ".afterFormulas";
//     console.log(filenameAfterFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameAfterFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameAfterFinal);
//     });
// }
// if (document.title.includes("Before")) {
//     // SYNC
//     // var filenameBefore;
//     chrome.storage.sync.get(['commerceFileName'], function(result) {
//         filenameBefore = result.commerceFileName;
//         console.log(filenameBefore);
//     });
//     console.log(filenameBefore);
//     var filenameBeforeFinal = filenameBefore + ".beforeFormulas";
//     console.log(filenameBeforeFinal);
//     chrome.storage.sync.set({ 'commerceFileName': filenameBeforeFinal }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filenameBeforeFinal);
//     });
// }

 //     // GRAB COMM FN
    //     // var commerceFileName =

    //     //POPUP UNLOAD QUERY
    //     // chrome.tabs.query({currentWindow: true}), function(tabs){
    //     //     chrome.tabs.sendMessage(tabs[0].id, { greeting: "getCommerceFilename" }, function(response) {
    //     //     consoleonsole.log(response.commerceFileName);
    //     //     });
    //     // });

    //     // SEND COMM FN RESPONSE
    //     sendResponse({
    //         filename: "commerceFilename"
    //     });

    // }
    // return true;
    // return true;
    // }
    // return true;
  })

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

// ```html <input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" readonly="" disabled="" style="width: 260px;">```

// if (document.querySelector("#x-auto-3-input")) {
//     filename = document.querySelector("#x-auto-3-input").value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
// }

// let elements = document.getElementsByClassName("varName");
console.log(elements);

// if (elements[0]) {
//     console.log(elements[0].value);
//     console.log(elements[0].nodeValue);
//     filename = elements[0].value;
// }

// if (document.querySelector(".varName")) {
//     filename = document.querySelector(".varName").value;
//     console.log(filename);
// }

// if (window.document.querySelector(".varName")) {
//     filename = window.document.querySelector(".varName");
//     console.log(filename);
// }

// #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]

// WIP COMMERCE FN TRIALS

// if (document.getElementsByName('varName')[0]) {
// filename = document.getElementsByName('varName')[0].value;
console.log(filename);
// }

// if (document.querySelector('[name="variable_name"]')) {
//     filename = document.querySelector('[name="variable_name"]');
// }

// if (window.document.querySelector('[name="variable_name"]')) {
//     filename = window.document.querySelector('[name="variable_name"]');
// }
// if (document.getElementsByName('varName').length > 0) {
//     filename = document.getElementsByName('varName')[0].value;
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm rules");
//         console.log(filename);
//         console.log(result.variable_name);
//     });
// }

// if ((document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== null) && (document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") !== undefined)) {
//     filename = document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]").value;
//     // commActionFileName = commActionFileNameElement.innertext;
//     // #general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]
//     console.log(filename);

//     console.log(commActionFileName);
//     chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
//         console.log("you saved me!! comm action");
//         console.log(filename);
//     });
// }

// if (document.getElementsByName('varName').length > 0) {
//   filename = document.getElementsByName('varName')[0].value
//   chrome.storage.sync.set({ commerceFileName: filename }, function () {
//     console.log('you saved me!! comm rules')
//     console.log(filename)
//     console.log(result.variable_name);
//   })
// }

// if ((document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]') !== null) && (document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]') !== undefined)) {
//   filename = document.querySelector('#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]').value
  // commActionFileName = commActionFileNameElement.innertext;
  // #general > table > tbody > tr




```
