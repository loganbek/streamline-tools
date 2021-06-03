/* STUB | POPUP SCRIPT */

'use strict'

// VARS
// let fileName
// let commentHeader
// let url
let bmSiteSubDomain
let bmSiteType
// let header

// FLAGS
// const unloaded = false
// const unloadedTest = false

// BUTTONS
const unloadButton = document.getElementById('unload')
const loadButton = document.getElementById('load')
const unloadTestButton = document.getElementById('unloadTest')
const loadTestButton = document.getElementById('loadTest')
const optionsButton = document.getElementById('options')
const logsButton = document.getElementById('logs')

// CHROME TABS
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0]
  const url = tab.url
  const full = url
  const parts = full.split('.')
  const sub = parts[0]
  const domain = parts[1]
  const type = parts[2]
  // console.log(sub)
  const bmSiteParts = sub.split('//')
  const bmSite = bmSiteParts[1]
  // console.log(bmSite)
  bmSiteSubDomain = bmSite
  // console.log(domain)
  // console.log(type)
  bmSiteType = 'commerce'
  // console.log(bmSiteType)
  if (url !== undefined) {
    // UNLOAD/LOAD TEST BML DISABLING
    if (
      url.includes('bigmachines.com/admin/commerce/rules') ||
      url.includes('bigmachines.com/admin/configuration/rules') ||
      url.includes('bigmachines.com/admin/commerce/actions')
    ) {
      unloadTestButton.disabled = true
      loadTestButton.disabled = true
    }
    if (
      url.includes('bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp')
    ) {
      executeContentScript('adminCommerceActionsContent.js')
    } else if (url.includes('bigmachines.com/admin/commerce/rules')) {
      executeContentScript('adminCommerceRulesContent.js')
    } else if (url.includes('bigmachines.com/admin/configuration/rules')) {
      bmSiteType = 'configuration'
      executeContentScript('adminConfigContent.js')
    }
  }
  if (url.includes('bigmachines.com/spring/')) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: 'filename' }, function (
      response
    ) {
      if (response !== undefined) {
        // console.log(response.filename)
        fileName = response.filename
      }
    })
    executeContentScript('content.js')
  }
})

// CS
function executeContentScript (contentScriptName) {
  chrome.tabs.executeScript({
    file: contentScriptName
  })
}

// TODO: add to options
// DISSABLE DOWNLOADS SHELF
chrome.downloads.setShelfEnabled(true)

// TODO: EXTERNAL LOG LINKING
logsButton.disabled = true

// DOWNLOAD FILENAME
chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  suggest({
    filename:
      'bigmachines/' + bmSiteSubDomain + '/' + bmSiteType + '/' + item.filename,
    conflictAction: 'overwrite'
  })
})

// UNLOAD ONCLICK
unloadButton.onclick = function (params) {
  console.log('unload clicked')
  const unloaded = true

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unload' }, function (
      response
    ) {
      if (response.code && response.filename) {
        saveText(response.filename + '.bml', response.code)
      }
    })
  })
}

// LOAD ONCLICK
let fileHandle
loadButton.addEventListener('click', async e => {
  // fileHandle = await window.chooseFileSystemEntries();
  ;[fileHandle] = await window.showOpenFilePicker()
  console.log(fileHandle)
  const file = await fileHandle.getFile()
  const contents = await file.text()
  console.log(contents)

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { greeting: 'load', code: contents },
      function (response) {
        console.log(response)
      }
    )
  })
})

// UNLOAD TEST ONCLICK
unloadTestButton.onclick = function (params) {
  console.log('unloadTest clicked')
  const unloadedTest = true

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadTest' }, function (
      response
    ) {
      console.log(response.filename)
      console.log(response.testCode)
      if (response.testCode && response.filename) {
        saveText(response.filename + '.test' + '.bml', response.testCode)
      }
    })
  })
}

// LOAD TEST ONCLICK
let fileHandle2
loadTestButton.addEventListener('click', async e => {
  const options = {
    types: [
      {
        accept: {
          'bml/plain': '.test.bml'
        }
      }
    ],
    excludeAcceptAllOption: true
  }
  //    [fileHandle2] = await window.showOpenFilePicker(options);
  ;[fileHandle2] = await window.showOpenFilePicker()
  console.log(fileHandle2)
  const file = await fileHandle2.getFile()
  const contents = await file.text()

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { greeting: 'loadTest', code: contents },
      function (response) {
        console.log(response)
      }
    )
  })
})

// FILE SAVE
function saveText (filename, text) {
  const tempElem = document.createElement('a')
  tempElem.setAttribute(
    'href',
    'data:bml/plain;charset=utf-8,' + encodeURIComponent(text)
  )
  tempElem.setAttribute('download', filename)
  tempElem.click()
}

// OPTIONS HANDLER
optionsButton.onclick = function (params) {
  // alert("optionsClicked");
  window.location = '/options.html'
  // chrome.runtime.openOptionsPage()
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
