let manifest = chrome.runtime.getManifest()
console.log(manifest.name)
console.log(manifest.version)

document.addEventListener('DOMContentLoaded', event => {
  let attachedFooter = (document.getElementById(
    'footer'
  ).innerHTML = getFooter())
})

function getFooter () {
  return (
    '<footer><p>' +
    manifest.name +
    '</p><p>v.' +
    manifest.version +
    '</p></footer>'
  )
}
