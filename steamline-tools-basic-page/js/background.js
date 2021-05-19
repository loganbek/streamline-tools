window.bmlFileVars = {}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  window.bmlFileVars[sender.tab.id] = message.essential || null
})
