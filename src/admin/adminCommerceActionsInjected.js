/**
 * Streamline Tools - Admin Commerce Actions Injected Script
 *
 * This script is injected into Oracle CPQ Cloud admin commerce actions pages
 * to handle BML code operations directly in the page context. It provides
 * functionality for loading and unloading BML code in commerce actions.
 *
 * @version 1.0.0
 * @license Unlicense
 */

let ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG = true;

function logDebug(message, ...optionalParams) {
  if (ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG) {
    console.log("[ADMIN_COMMERCE_ACTIONS_INJECT_DEBUG]", message, ...optionalParams);
  }
}

window.addEventListener('load', function () {
  main()
  logDebug("Main function executed on load.");
})

window.addEventListener('unloadCode', function (evt) {
  iframes = document.getElementsByTagName('iframe')
  logDebug("Iframes found:", iframes);
  textAreaCode = document.getElementsByTagName('iframe')[0].contentDocument.querySelector('#textarea').value
  logDebug("Textarea code:", textAreaCode);
  if (textAreaCode) {
    testCommerceCode = textAreaCode
  } else {
    testCommerceCode = '\n'
  }
  logDebug("Test commerce code:", testCommerceCode);
  const event = new CustomEvent('PassCodeToBackground', { detail: testCommerceCode })
  window.dispatchEvent(event)
  logDebug("PassCodeToBackground event dispatched with detail:", testCommerceCode);
})

// Listen for the load code event
window.addEventListener('loadCode', function (evt) {
  code = evt.detail
  logDebug("LoadCode event received with detail:", code);

  textarea = document.getElementsByTagName('iframe')[0].contentDocument.querySelector('#textarea')
  textarea.value = code
  logDebug("Textarea value set to code.");

  document.getElementById('check').click()
  logDebug("Check button clicked.");
}, false)

function main () {
  const textArea = document.getElementById('textarea')

  code = document.querySelector('#textarea').value
  alert(code)
  logDebug("Code from textarea:", code);

  const event = new CustomEvent('PassToBackground', { code })
  window.dispatchEvent(event)
  logDebug("PassToBackground event dispatched with code:", code);
}
