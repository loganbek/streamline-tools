window.addEventListener('load', function () {
  main()
})

window.addEventListener('unloadCode', function (evt) {

  document.getElementsByRegex = function (pattern) {
    const arrElements = [] // to accumulate matching elements
    const re = new RegExp(pattern) // the regex to match with

    function findRecursively (aNode) { // recursive function to traverse DOM
      if (!aNode) { return }
      if (aNode.id !== undefined && aNode.id.search(re) != -1) { arrElements.push(aNode) } // FOUND ONE!
      for (const idx in aNode.childNodes) // search children...
      { findRecursively(aNode.childNodes[idx]) }
    };

    findRecursively(document) // initiate recursive matching
    return arrElements // return matching elements
  }

  console.log(document.getElementsByTagName('iframe')[1])
  console.log('CONTENT DOCUMENT')
  console.log(document.getElementsByTagName('iframe')[1].contentDocument)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.innerHTML)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.html)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.body.querySelector('#textarea').parent)
  console.log('CONTENT WINDOW')
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.window)
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.innerHTML)
  console.log(document.getElementsByTagName('iframe')[1].contentWindow.html)
  console.log(document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea').value)
  textAreaCode = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea').value
  console.log(textAreaCode)
  if (textAreaCode) {
    testConfigCode = textAreaCode
  } else {
    testConfigCode = '\n'
  }
  console.log(textAreaCode)
  console.log(testConfigCode)
  const event = new CustomEvent('PassCodeToBackground', { detail: testConfigCode })
  window.dispatchEvent(event)
})

// Listen for the load code event
window.addEventListener('loadCode', function (evt) {
  code = evt.detail
  console.log(document.getElementById('x-auto-3-input'))
  textarea = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
  textarea.value = code

  // TEXT AREA ONCHANGE
  console.log('TEXTAREA ONCHANGE()')
  textarea.onchange()

  console.log('x-toolbar-right')
  divXWindow = document.getElementsByClassName('x-toolbar-right')
  console.log(divXWindow)

  for (const item of divXWindow) {
    console.log(item)
    item.click()
  }

  const elem = document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea')
  console.log(elem)
  buttonCollection = document.getElementsByClassName('x-btn-text ')
  // oop through collection and check for "Validate"
  for (const item of buttonCollection) {
    if (item.innerText === 'Validate') {
      console.log('found validate button')
      validateButton = item
    }
  }
  // validateButton.click();
}, false)

function main () {
  const textArea = document.getElementById('textarea')

  code = document.querySelector('#textarea').value
  alert(code)

  const event = new CustomEvent('PassToBackground', { code })
  window.dispatchEvent(event)
}
