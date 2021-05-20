// * Footer Information from manifest
let manifest = chrome.runtime.getManifest()

document.addEventListener('DOMContentLoaded', event => {
  let attachedFooter = (document.getElementById(
    'footer'
  ).innerHTML = getFooter())
})

function getFooter () {
  return (
    '<footer><p>' + manifest.name + ' ' + manifest.version + '</p></footer>'
  )
}
