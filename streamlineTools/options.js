// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// let page = document.getElementById('buttonDiv');
// const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
// function constructOptions(kButtonColors) {
//   for (let item of kButtonColors) {
//     let button = document.createElement('button');
//     button.style.backgroundColor = item;
//     button.addEventListener('click', function() {
//       chrome.storage.sync.set({color: item}, function() {
//         console.log('color is ' + item);
//       })
//     });
//     page.appendChild(button);
//   }
// }
// constructOptions(kButtonColors);

// Saves options to chrome.storage
function save_options() {
    // var color = document.getElementById('color').value;
    // var likesColor = document.getElementById('like').checked;
    let includeCommentHeader = document.getElementById('includeCommentHeader');
    chrome.storage.sync.set({
        includeCommentHeader: includeCommentHeader
            // favoriteColor: color,
            // likesColor: likesColor
    }, function() {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        // favoriteColor: 'red',
        // likesColor: true
        includeCommentHeader: false
    }, function(items) {
        // document.getElementById('color').value = items.favoriteColor;
        // document.getElementById('like').checked = items.likesColor;
        document.getElementById('includeCommentHeader').checked = items.includeCommentHeader;
    });
}

if (document.readyState !== 'loading') {
    console.log('document is already ready, just execute code here');
    restore_options();
} else {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('document was not ready, place code here');
        restore_options();
    });
}

// document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);