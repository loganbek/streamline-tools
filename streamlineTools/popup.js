// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let unloaded = false;

let unloadButton = document.getElementById('unload');

let loadButton = document.getElementById('load');

unloadButton.onclick = function (params) {
  console.log("unload clicked");
  //TODO: BML code selector
  let unloaded = true;

  //*[@id="selection_field_text"]/strong/text()[1]
  // let code = document.getElementsByClassName('bml');
  // /html/body/div[1]/div[3]/div[2]/div[7]/strong/text()[1]



  let code = document.querySelector('*[@id="selection_field_text"]/strong/text()[1]');
  console.log(code);

  // HTMLCollection
  //TODO: Send to local VSCode
}

loadButton.onclick = function (params) {
  console.log("load clicked");
  //TODO: load BML from local file 

  //TODO: Insert back in DOM

  let unloaded = false;
}

// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

// changeColor.onclick = function(element) {
//   let color = element.target.value;
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.executeScript(
//         tabs[0].id,
//         {code: 'document.body.style.backgroundColor = "' + color + '";'});
//   });
// };
