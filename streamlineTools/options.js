'use strict';

// Saves options to chrome.storage
function save_options() {
    let includeCommentHeader = document.getElementById('includeCommentHeader');
    chrome.storage.sync.set({
        includeCommentHeader: includeCommentHeader
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
        // document.getElementById('includeCommentHeader').checked = items.includeCommentHeader;
    });
}

if (document.readyState !== 'loading') {
    // console.log('document is already ready, just execute code here');
    restore_options();
} else {
    document.addEventListener('DOMContentLoaded', function() {
        // console.log('document was not ready, place code here');
        restore_options();
    });
}

// document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

// BACK HANDLER
document.getElementById('back').onclick = function(params) {
    // alert("optionsClicked");
    window.location = '/popup.html';
}