/* STUB | OPTIONS SCRIPT */

'use strict'

// Saves options to chrome.storage
function save_options () {
  const includeCommentHeader = document.getElementById('includeCommentHeader')
  chrome.storage.sync.set(
    {
      includeCommentHeader: includeCommentHeader
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById('status')
      status.textContent = 'Options saved.'
      setTimeout(function () {
        status.textContent = ''
      }, 750)
    }
  )
}

// Restores state using the preferences stored in chrome.storage.
function restore_options () {
  chrome.storage.sync.get(
    {
      includeCommentHeader: false
    },
    function (items) {}
  )
}

if (document.readyState !== 'loading') {
  // console.log('document is already ready, just execute code here');
  restore_options()
} else {
  document.addEventListener('DOMContentLoaded', function () {
    // console.log('document was not ready, place code here');
    restore_options()
  })
}

// document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options)

// BACK HANDLER
document.getElementById('back').onclick = function (params) {
  // alert("optionsClicked");
  window.location = '/popup.html'
  // chrome.pageAction.show(chrome.tabs.getCurrentTab())
  // chrome.pageAction.getPopup()
}

// * Footer Information from manifest
const manifest = chrome.runtime.getManifest()

document.addEventListener('DOMContentLoaded', event => {
  const attachedFooter = (document.getElementById(
    'footer'
  ).innerHTML = getFooter())
})

function getFooter () {
  return '<p>' + manifest.name + ' ' + manifest.version + '</p>'
}
