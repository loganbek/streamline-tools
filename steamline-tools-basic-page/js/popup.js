let fileName = 'fileName.bml'
let fileContent = '// empty fileContent'

window.addEventListener('DOMContentLoaded', () => {
  let backgroundPage = chrome.extension.getBackgroundPage()

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    let currentTabId = tabs[0].currentTabId
    let currentFile = backgroundPage.fileVars[currentTabId]
  })
})
