// * Footer Information from manifest
const manifest = chrome.runtime.getManifest()

document.addEventListener('DOMContentLoaded', event => {
  const attachedFooter = (document.getElementById(
    'footer'
  ).innerHTML = getFooter())
})

function getFooter () {
  return (
    '<footer><p>' + manifest.name + ' ' + manifest.version + '</p></footer>'
  )
}
