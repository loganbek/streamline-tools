'use strict'
// Possibly Integrate w/ scripts.js
// BML FILE
let fileName = 'fileName.bml'
let fileContent = '// empty fileContent'
let backgoundPage

// BUTTONS
const unloadButton = document.getElementById('unload')
const loadButton = document.getElementById('load')
const unloadTestButton = document.getElementById('unloadTest')
const loadTestButton = document.getElementById('loadTest')
const optionsButton = document.getElementById('options')
const logsButton = document.getElementById('logs')

// TODO: EXTERNAL LOG LINKING - FEATURE TO BE ADDED POST RELEASE
// DISABLED FOR NOW MAYBE HIDE BEFORE CWS RELEASE
logsButton.disabled = true

// Button Click Listeners

unloadButton.addEventListener('click', ev => {
  queryForFile()
})

loadButton.addEventListener('click', ev => {
  queryForFile()
})

unloadTestButton.addEventListener('click', ev => {
  queryForFile()
})

loadTestButton.addEventListener('click', ev => {
  queryForFile()
})

optionsButton.addEventListener('options', ev => {
  // window.location = '/options.html'
  chrome.runtime.openOptionsPage()
})

window.addEventListener('DOMContentLoaded', () => {
  backgroundPage = chrome.runtime.getBackgroundPage().promise.then(value => {
    console.log(value)
  })
  queryForFile()
})

function queryForFile () {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentTabId = tabs[0].currentTabId
    const currentFile = backgroundPage.bmlFileVars[currentTabId]
    fileName = currentFile.fileName
    fileContent = currentFile.fileContent
  })
}

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

// * NOTE: MAY NEED TO USE THE BELOW CODE STILL - TBD

// function executeContentScript (contentScriptName) {
//   chrome.tabs.executeScript({
//     file: contentScriptName
//   })
// }

// OLD CHROME TABS QUERY
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   const tab = tabs[0]
//   const url = tab.url
//   const full = url
//   const parts = full.split('.')
//   const sub = parts[0]
//   const domain = parts[1]
//   const type = parts[2]
//   console.log(sub)
//   const bmSiteParts = sub.split('//')
//   const bmSite = bmSiteParts[1]
//   console.log(bmSite)
//   bmSiteSubDomain = bmSite
//   console.log(domain)
//   console.log(type)
//   bmSiteType = 'commerce'
//   console.log(bmSiteType)
//   if (url !== undefined) {
//     // UNLOAD/LOAD TEST BML DISABLING
//     if (
//       url.includes('bigmachines.com/admin/commerce/rules') ||
//       url.includes('bigmachines.com/admin/configuration/rules') ||
//       url.includes('bigmachines.com/admin/commerce/actions')
//     ) {
//       unloadTestButton.disabled = true
//       loadTestButton.disabled = true
//     }
//     if (
//       url.includes('bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp')
//     ) {
//       executeContentScript('adminCommerceActionsContent.js')
//     } else if (url.includes('bigmachines.com/admin/commerce/rules')) {
//       executeContentScript('adminCommerceRulesContent.js')
//     } else if (url.includes('bigmachines.com/admin/configuration/rules')) {
//       bmSiteType = 'configuration'
//       executeContentScript('adminConfigContent.js')
//     }
//   }
//   if (url.includes('bigmachines.com/spring/')) {
//     chrome.tabs.sendMessage(tabs[0].id, { greeting: 'filename' }, function (
//       response
//     ) {
//       if (response !== undefined) {
//         console.log(response.filename)
//         fileName = response.filename
//       }
//     })
//     executeContentScript('content.js')
//   }
// })

// DOWNLOAD FILENAME
// chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
//   suggest({
//     filename:
//       'bigmachines/' + bmSiteSubDomain + '/' + bmSiteType + '/' + item.filename,
//     conflictAction: 'overwrite'
//   })
// })
