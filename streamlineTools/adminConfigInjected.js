/* STUB | ADMIN CONFIG INJECTED */

//GLOBAL CLICK LISTNER
document.addEventListener('click', function (evnt) {
  console.log(evnt.target.id)
  console.log('global click')
  // Arrive.unbindAllArrive()

  // console.log('removing loading dialog...')
  // bodyModalHook[0].querySelector('ext-el-mask').remove()
  // console.log('dialog removed')

  // bodyModalHook[0].src += ''

  let bodyElement2 = document.getElementsByTagName('body')
  console.log('bodyElement2')
  console.log(bodyElement2)

  console.log(bodyElement2[0])
  // bodyModalHook = bodyElement[0].getElementsByClassName(
  //   '.x-window x-component x-window-maximized x-masked'
  // )
  bodyModalHook2 = bodyElement2[0].getElementsByClassName(
    ' x-window x-component  x-window-maximized'
  )
  console.log('bodyModalHook2')
  console.log(bodyModalHook2)
  // window.click()
  bodyModalHook2[0].querySelector('.ext-el-mask').remove()
  bodyModalHook2[0].click()
})

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

    let bodyElement = document.getElementsByTagName('body')
    console.log(bodyElement[0])
    // bodyModalHook = bodyElement[0].getElementsByClassName(
    //   '.x-window x-component x-window-maximized x-masked'
    // )
    bodyModalHook = bodyElement[0].getElementsByClassName(
      ' x-window x-component  x-window-maximized'
    )
    console.log(bodyModalHook)

    // loadingDiv = htmlToElement(
    //   '<div class="ext-el-mask" style="display: block;"><div class="ext-el-mask-msg" style="display: block; left: 955px; top: 726px;"><div>Loading...</div></div></div>'
    // )

    document.arrive('.ext-el-mask', function () {
      // console.log('removing loading dialog...')
      console.log('inside arrive')
      // bodyModalHook[0].querySelector('.ext-el-mask').remove()
      // console.log('dialog removed')
      //frame reload
      // bodyModalHook[0].src += ''
      // Arrive.unbindAllArrive() // prob move into click handler
      Arrive.unbindAllArrive()
    })

    // let editorHook = document.getElementById('editor')

    // console.log(editorHook)
    loadingDiv = htmlToElement(
      '<div class="ext-el-mask" style="display: block;"><div class="ext-el-mask-msg" style="display: block; left: 655px; top: 626px;"><div>Loading...</div></div></div>'
    )

    bodyModalHook[0].appendChild(loadingDiv)

 

    divXWindow = document.getElementsByClassName('x-toolbar-right')
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

/*
 * arrive.js
 * v2.4.1
 * https://github.com/uzairfarooq/arrive
 * MIT licensed
 *
 * Copyright (c) 2014-2017 Uzair Farooq
 */

var Arrive = (function (e, t, n) {
  'use strict'
  function r (e, t, n) {
    l.addMethod(t, n, e.unbindEvent),
      l.addMethod(t, n, e.unbindEventWithSelectorOrCallback),
      l.addMethod(t, n, e.unbindEventWithSelectorAndCallback)
  }
  function i (e) {
    ;(e.arrive = f.bindEvent),
      r(f, e, 'unbindArrive'),
      (e.leave = d.bindEvent),
      r(d, e, 'unbindLeave')
  }
  if (e.MutationObserver && 'undefined' != typeof HTMLElement) {
    var o = 0,
      l = (function () {
        var t =
          HTMLElement.prototype.matches ||
          HTMLElement.prototype.webkitMatchesSelector ||
          HTMLElement.prototype.mozMatchesSelector ||
          HTMLElement.prototype.msMatchesSelector
        return {
          matchesSelector: function (e, n) {
            return e instanceof HTMLElement && t.call(e, n)
          },
          addMethod: function (e, t, r) {
            var i = e[t]
            e[t] = function () {
              return r.length == arguments.length
                ? r.apply(this, arguments)
                : 'function' == typeof i
                ? i.apply(this, arguments)
                : n
            }
          },
          callCallbacks: function (e, t) {
            t && t.options.onceOnly && 1 == t.firedElems.length && (e = [e[0]])
            for (var n, r = 0; (n = e[r]); r++)
              n && n.callback && n.callback.call(n.elem, n.elem)
            t &&
              t.options.onceOnly &&
              1 == t.firedElems.length &&
              t.me.unbindEventWithSelectorAndCallback.call(
                t.target,
                t.selector,
                t.callback
              )
          },
          checkChildNodesRecursively: function (e, t, n, r) {
            for (var i, o = 0; (i = e[o]); o++)
              n(i, t, r) && r.push({ callback: t.callback, elem: i }),
                i.childNodes.length > 0 &&
                  l.checkChildNodesRecursively(i.childNodes, t, n, r)
          },
          mergeArrays: function (e, t) {
            var n,
              r = {}
            for (n in e) e.hasOwnProperty(n) && (r[n] = e[n])
            for (n in t) t.hasOwnProperty(n) && (r[n] = t[n])
            return r
          },
          toElementsArray: function (t) {
            return (
              n === t || ('number' == typeof t.length && t !== e) || (t = [t]),
              t
            )
          }
        }
      })(),
      c = (function () {
        var e = function () {
          ;(this._eventsBucket = []),
            (this._beforeAdding = null),
            (this._beforeRemoving = null)
        }
        return (
          (e.prototype.addEvent = function (e, t, n, r) {
            var i = {
              target: e,
              selector: t,
              options: n,
              callback: r,
              firedElems: []
            }
            return (
              this._beforeAdding && this._beforeAdding(i),
              this._eventsBucket.push(i),
              i
            )
          }),
          (e.prototype.removeEvent = function (e) {
            for (
              var t, n = this._eventsBucket.length - 1;
              (t = this._eventsBucket[n]);
              n--
            )
              if (e(t)) {
                this._beforeRemoving && this._beforeRemoving(t)
                var r = this._eventsBucket.splice(n, 1)
                r && r.length && (r[0].callback = null)
              }
          }),
          (e.prototype.beforeAdding = function (e) {
            this._beforeAdding = e
          }),
          (e.prototype.beforeRemoving = function (e) {
            this._beforeRemoving = e
          }),
          e
        )
      })(),
      a = function (t, r) {
        var i = new c(),
          o = this,
          a = { fireOnAttributesModification: !1 }
        return (
          i.beforeAdding(function (n) {
            var i,
              l = n.target
            ;(l === e.document || l === e) &&
              (l = document.getElementsByTagName('html')[0]),
              (i = new MutationObserver(function (e) {
                r.call(this, e, n)
              }))
            var c = t(n.options)
            i.observe(l, c), (n.observer = i), (n.me = o)
          }),
          i.beforeRemoving(function (e) {
            e.observer.disconnect()
          }),
          (this.bindEvent = function (e, t, n) {
            t = l.mergeArrays(a, t)
            for (var r = l.toElementsArray(this), o = 0; o < r.length; o++)
              i.addEvent(r[o], e, t, n)
          }),
          (this.unbindEvent = function () {
            var e = l.toElementsArray(this)
            i.removeEvent(function (t) {
              for (var r = 0; r < e.length; r++)
                if (this === n || t.target === e[r]) return !0
              return !1
            })
          }),
          (this.unbindEventWithSelectorOrCallback = function (e) {
            var t,
              r = l.toElementsArray(this),
              o = e
            ;(t =
              'function' == typeof e
                ? function (e) {
                    for (var t = 0; t < r.length; t++)
                      if ((this === n || e.target === r[t]) && e.callback === o)
                        return !0
                    return !1
                  }
                : function (t) {
                    for (var i = 0; i < r.length; i++)
                      if ((this === n || t.target === r[i]) && t.selector === e)
                        return !0
                    return !1
                  }),
              i.removeEvent(t)
          }),
          (this.unbindEventWithSelectorAndCallback = function (e, t) {
            var r = l.toElementsArray(this)
            i.removeEvent(function (i) {
              for (var o = 0; o < r.length; o++)
                if (
                  (this === n || i.target === r[o]) &&
                  i.selector === e &&
                  i.callback === t
                )
                  return !0
              return !1
            })
          }),
          this
        )
      },
      s = function () {
        function e (e) {
          var t = { attributes: !1, childList: !0, subtree: !0 }
          return e.fireOnAttributesModification && (t.attributes = !0), t
        }
        function t (e, t) {
          e.forEach(function (e) {
            var n = e.addedNodes,
              i = e.target,
              o = []
            null !== n && n.length > 0
              ? l.checkChildNodesRecursively(n, t, r, o)
              : 'attributes' === e.type &&
                r(i, t, o) &&
                o.push({ callback: t.callback, elem: i }),
              l.callCallbacks(o, t)
          })
        }
        function r (e, t) {
          return l.matchesSelector(e, t.selector) &&
            (e._id === n && (e._id = o++), -1 == t.firedElems.indexOf(e._id))
            ? (t.firedElems.push(e._id), !0)
            : !1
        }
        var i = { fireOnAttributesModification: !1, onceOnly: !1, existing: !1 }
        f = new a(e, t)
        var c = f.bindEvent
        return (
          (f.bindEvent = function (e, t, r) {
            n === r ? ((r = t), (t = i)) : (t = l.mergeArrays(i, t))
            var o = l.toElementsArray(this)
            if (t.existing) {
              for (var a = [], s = 0; s < o.length; s++)
                for (var u = o[s].querySelectorAll(e), f = 0; f < u.length; f++)
                  a.push({ callback: r, elem: u[f] })
              if (t.onceOnly && a.length) return r.call(a[0].elem, a[0].elem)
              setTimeout(l.callCallbacks, 1, a)
            }
            c.call(this, e, t, r)
          }),
          f
        )
      },
      u = function () {
        function e () {
          var e = { childList: !0, subtree: !0 }
          return e
        }
        function t (e, t) {
          e.forEach(function (e) {
            var n = e.removedNodes,
              i = []
            null !== n &&
              n.length > 0 &&
              l.checkChildNodesRecursively(n, t, r, i),
              l.callCallbacks(i, t)
          })
        }
        function r (e, t) {
          return l.matchesSelector(e, t.selector)
        }
        var i = {}
        d = new a(e, t)
        var o = d.bindEvent
        return (
          (d.bindEvent = function (e, t, r) {
            n === r ? ((r = t), (t = i)) : (t = l.mergeArrays(i, t)),
              o.call(this, e, t, r)
          }),
          d
        )
      },
      f = new s(),
      d = new u()
    t && i(t.fn),
      i(HTMLElement.prototype),
      i(NodeList.prototype),
      i(HTMLCollection.prototype),
      i(HTMLDocument.prototype),
      i(Window.prototype)
    var h = {}
    return r(f, h, 'unbindAllArrive'), r(d, h, 'unbindAllLeave'), h
  }
})(window, 'undefined' == typeof jQuery ? null : jQuery, void 0)
