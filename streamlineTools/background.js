/* STUB | BACKGROUND SCRIPT */

'use strict'

chrome.runtime.onInstalled.addListener(function () {
  //   // chrome.storage.sync.set({ color: '#3aa757' }, function () {
  //   //   console.log('The color is green.');
  //   // });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches:
                'bigmachines.com/admin/configuration/rules/edit_rule.jsp|bigmachines.com/spring/'
            }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ])
  })
})

// KEYBOARD COMMAND LISTENER
// _execute_page_action - handled automatically
// unload_bml + load_bml
chrome.commands.onCommand.addListener(function (command) {
  // const direction = command.split('-')[1];
  switch (command) {
    case 'unload_bml':
      unloadBML()
      break
    case 'load_bml':
      loadBML()
      break
    default:
      console.log(`Command ${command} not found`)
  }
})

function unloadBML () {
  alert('UNLOAD COMMAND')
  // unloadButton.click()
  // chrome.pageAction.show()
  // chrome.declarativeContent.ShowPageAction()
  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   lastTabId = tabs[0].id
  //   chrome.pageAction.show(lastTabId)
  // })
  chrome.commands.onCommand.addListener(function (command) {
    const direction = command.split('-')[1];

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { direction });
  });
});
}

function loadBML () {
  alert('LOAD COMMAND')
  // loadButton.click()
}

