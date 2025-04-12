// ADMIN COMMERCE RULES INJECT

window.addEventListener('load', function () {
  main()
})

window.addEventListener('unloadCode', function (evt) {
  // #textarea
  iframes = document.getElementsByTagName('iframe')
  console.log(iframes)
  textAreaCode = document.getElementsByTagName('iframe')[0].contentDocument.querySelector('#textarea').value
  console.log(textAreaCode)
  if (textAreaCode) {
    testCommerceCode = textAreaCode
  } else {
    testCommerceCode = '\n'
  }
  console.log(textAreaCode)
  console.log(testCommerceCode)
  const event = new CustomEvent('PassCodeToBackground', { detail: testCommerceCode })
  window.dispatchEvent(event)
})

// Listen for the load code event
window.addEventListener('loadCode', function (evt) {
  code = evt.detail

  textarea = document.getElementsByTagName('iframe')[0].contentDocument.querySelector('#textarea')
  textarea.value = code

  document.getElementById('check').click()
}, false)

function main () {
  const textArea = document.getElementById('textarea')

  code = document.querySelector('#textarea').value
  alert(code)

  const event = new CustomEvent('PassToBackground', { code })
  window.dispatchEvent(event)
}
