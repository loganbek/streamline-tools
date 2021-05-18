window.fileVars = {}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  window.fileVars[sender.tab.id] = message.essential || null
})
