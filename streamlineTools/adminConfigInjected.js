window.addEventListener('load', function () {
  main()
})

window.addEventListener('unloadCode', function (evt) {
  document.getElementsByRegex = function (pattern) {
    const arrElements = [] // to accumulate matching elements
    const re = new RegExp(pattern) // the regex to match with

    function findRecursively (aNode) {
      // recursive function to traverse DOM
      if (!aNode) {
        return
      }
      if (aNode.id !== undefined && aNode.id.search(re) != -1) {
        arrElements.push(aNode)
      } // FOUND ONE!
      for (const idx in aNode.childNodes) {
        // search children...
        findRecursively(aNode.childNodes[idx])
      }
    }

    findRecursively(document) // initiate recursive matching
    return arrElements // return matching elements
  }

  // console.log(document.getElementsByTagName('iframe')[1])
  // console.log('CONTENT DOCUMENT')
  // console.log(document.getElementsByTagName('iframe')[1].contentDocument)
  // console.log(document.getElementsByTagName('iframe')[1].contentDocument.innerHTML)
  // console.log(document.getElementsByTagName('iframe')[1].contentDocument.html)
  // console.log(document.getElementsByTagName('iframe')[1].contentDocument.body.querySelector('#textarea').parent)
  // console.log('CONTENT WINDOW')
  // console.log(document.getElementsByTagName('iframe')[1].contentWindow.window)
  // console.log(document.getElementsByTagName('iframe')[1].contentWindow.innerHTML)
  // console.log(document.getElementsByTagName('iframe')[1].contentWindow.html)
  // console.log(document.getElementsByTagName('iframe')[1].contentDocument.querySelector('#textarea').value)
  textAreaCode = document
    .getElementsByTagName('iframe')[1]
    .contentDocument.querySelector('#textarea').value
  // console.log(textAreaCode)
  if (textAreaCode) {
    testConfigCode = textAreaCode
  } else {
    testConfigCode = '\n'
  }
  // console.log(textAreaCode)
  // console.log(testConfigCode)
  const event = new CustomEvent('PassCodeToBackground', {
    detail: testConfigCode
  })
  window.dispatchEvent(event)
})

// Listen for the load code event
window.addEventListener(
  'loadCode',
  function (evt) {
    code = evt.detail
    // console.log(document.getElementById('x-auto-3-input'))
    textarea = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    textarea.value = code
    console.log('loadCode listener')
    modalHookTest = document.getElementsByClassName(
      'x-window x-component x-window-maximized x-masked'
    )

    console.log(modalHookTest)

    // let editorHook = document.getElementById('editor')

    // console.log(editorHook)

    let bodyElement = document.getElementsByTagName('body')
    console.log(bodyElement[0])
    // bodyModalHook = bodyElement[0].getElementsByClassName(
    //   '.x-window x-component x-window-maximized x-masked'
    // )
    bodyModalHook = bodyElement[0].getElementsByClassName(
      ' x-window x-component  x-window-maximized'
    )
    console.log(bodyModalHook)

    console.log(bodyModalHook[0].getElementsByTagName('iframe'))
    // TEXT AREA ONCHANGE
    // console.log('TEXTAREA ONCHANGE()')

    // * MODAL DIV STYLE
    // const modalDiv = document.createElement('div')
    // modalDiv.className = 'ext-el-mask-msg'
    // modalDiv.style.color = 'black'
    // modalDiv.style.fontFamily = 'Helvetica Neue, Helvetica, Ariel, sans-serif'
    // modalDiv.style.visibility = 'visible'
    // modalDiv.style.margin = '0'
    // modalDiv.style.zIndex = '101'
    // modalDiv.style.position = 'absolute'
    // modalDiv.style.border = '1px solid'
    // modalDiv.style.background = 'repeat-x 0 -16px'
    // modalDiv.style.padding = '2px'
    // modalDiv.style.borderColor = '#6593cf'
    // modalDiv.style.backgroundColor = '#c3daf9'
    // modalDiv.style.backgroundImage = 'url(../images/default/box/tb-blue.gif)'
    // modalDiv.style.display = 'block'
    // modalDiv.style.left = '1014px'
    // modalDiv.style.top = '694px'

    // * INNER DIV STYLE
    // const innerDiv = document.createElement('div')
    // modalDiv.style.visibility = 'visible'
    // modalDiv.style.margin = '0'
    // modalDiv.style.padding = '5px 10px 5px 10px'
    // modalDiv.style.border = '1px solid'
    // modalDiv.style.cursor = 'wait'
    // modalDiv.style.backgroundColor = 'white'
    // modalDiv.style.borderColor = '#a3bad9'
    // modalDiv.style.color = '#222'
    // modalDiv.style.font = 'normal 11px tahoma, arial, helvetica, sansCerif'
    // innerDiv.innerText = 'Loading...'

    // textarea.onchange()

    // console.log('x-toolbar-right')
    divXWindow = document.getElementsByClassName('x-toolbar-right')
    // console.log(divXWindow)

    for (const item of divXWindow) {
      // console.log(item)
      item.click()
    }

    const elem = document
      .getElementsByTagName('iframe')[1]
      .contentDocument.querySelector('#textarea')
    // console.log(elem)
    buttonCollection = document.getElementsByClassName('x-btn-text ')
    // oop through collection and check for "Validate"
    for (const item of buttonCollection) {
      if (item.innerText === 'Validate') {
        // console.log('found validate button')
        validateButton = item
      }
    }
    // validateButton.click();
  },
  false
)

function main () {
  const textArea = document.getElementById('textarea')

  code = document.querySelector('#textarea').value
  // alert(code)

  const event = new CustomEvent('PassToBackground', { code })
  window.dispatchEvent(event)
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement (html) {
  var template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.firstChild
}

// var td = htmlToElement('<td>foo</td>'),
//   div = htmlToElement('<div><span>nested</span> <span>stuff</span></div>')

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList}
 */
function htmlToElements (html) {
  var template = document.createElement('template')
  template.innerHTML = html
  return template.content.childNodes
}
