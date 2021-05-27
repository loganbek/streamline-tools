// TODO: Compare to previous version of Streamline Tools
function injectScript (filePath, tag) {
  let node = document.getElementsByTagName(tag)[0]
  let script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', filePath)
  node.appendChild(script)
}

injectScript(chrome.extension.getURL('inject-script.js'), 'body')

window.addEventListener(
  'message',
  function (event) {
    if (
      event.data.type &&
      event.data.type == 'FROM_PAGE' &&
      typeof chrome.app.isInstalled !== 'undefined'
    ) {
      chrome.runtime.sendMessage({ essential: event.data.essential })
    }
  },
  false
)
