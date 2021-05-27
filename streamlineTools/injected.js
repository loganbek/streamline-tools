/* STUB | INJECTED COMMERCE + UTIL LIB SCRIPT
/* FIXME */
function jsonPath (obj, expr, arg) {
  var P = {
    resultType: arg && arg.resultType || 'VALUE',
    result: [],
    normalize: function (expr) {
      const subx = []
      return expr.replace(/[\['](\??\(.*?\))[\]']/g, function ($0, $1) { return '[#' + (subx.push($1) - 1) + ']' })
        .replace(/'?\.'?|\['?/g, ';')
        .replace(/;;;|;;/g, ';..;')
        .replace(/;$|'?\]|'$/g, '')
        .replace(/#([0-9]+)/g, function ($0, $1) { return subx[$1] })
    },
    asPath: function (path) {
      const x = path.split(';')
      let p = '$'
      for (let i = 1, n = x.length; i < n; i++) { p += /^[0-9*]+$/.test(x[i]) ? ('[' + x[i] + ']') : ("['" + x[i] + "']") }
      return p
    },
    store: function (p, v) {
      if (p) P.result[P.result.length] = P.resultType == 'PATH' ? P.asPath(p) : v
      return !!p
    },
    trace: function (expr, val, path) {
      if (expr) {
        let x = expr.split(';')
        const loc = x.shift()
        x = x.join(';')
        if (val && val.hasOwnProperty(loc)) { P.trace(x, val[loc], path + ';' + loc) } else if (loc === '*') { P.walk(loc, x, val, path, function (m, l, x, v, p) { P.trace(m + ';' + x, v, p) }) } else if (loc === '..') {
          P.trace(x, val, path)
          P.walk(loc, x, val, path, function (m, l, x, v, p) { typeof v[m] === 'object' && P.trace('..;' + x, v[m], p + ';' + m) })
        } else if (/,/.test(loc)) { // [name1,name2,...]
          for (let s = loc.split(/'?,'?/), i = 0, n = s.length; i < n; i++) { P.trace(s[i] + ';' + x, val, path) }
        } else if (/^\(.*?\)$/.test(loc)) // [(expr)]
        { P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(';') + 1)) + ';' + x, val, path) } else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
        { P.walk(loc, x, val, path, function (m, l, x, v, p) { if (P.eval(l.replace(/^\?\((.*?)\)$/, '$1'), v[m], m)) P.trace(m + ';' + x, v, p) }) } else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
        { P.slice(loc, x, val, path) }
      } else { P.store(path, val) }
    },
    walk: function (loc, expr, val, path, f) {
      if (val instanceof Array) {
        for (let i = 0, n = val.length; i < n; i++) {
          if (i in val) { f(i, loc, expr, val, path) }
        }
      } else if (typeof val === 'object') {
        for (const m in val) {
          if (val.hasOwnProperty(m)) { f(m, loc, expr, val, path) }
        }
      }
    },
    slice: function (loc, expr, val, path) {
      if (val instanceof Array) {
        const len = val.length
        let start = 0
        let end = len
        let step = 1
        loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function ($0, $1, $2, $3) {
          start = parseInt($1 || start)
          end = parseInt($2 || end)
          step = parseInt($3 || step)
        })
        start = (start < 0) ? Math.max(0, start + len) : Math.min(len, start)
        end = (end < 0) ? Math.max(0, end + len) : Math.min(len, end)
        for (let i = start; i < end; i += step) { P.trace(i + ';' + expr, val, path) }
      }
    },
    eval: function (x, _v, _vname) {
      try { return $ && _v && eval(x.replace(/@/g, '_v')) } catch (e) { throw new SyntaxError('jsonPath: ' + e.message + ': ' + x.replace(/@/g, '_v').replace(/\^/g, '_a')) }
    }
  }

  var $ = obj
  if (expr && obj && (P.resultType == 'VALUE' || P.resultType == 'PATH')) {
    P.trace(P.normalize(expr).replace(/^\$;/, ''), obj, '$')
    return P.result.length ? P.result : false
  }
}

window.addEventListener('load', function () {
  main()
})

function main () {
  const message = jsonPath(jsonRespStr, '$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data')
  const message1 = jsonPath(jsonRespStr, 'x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[0].value')
  const message3 = jsonPath(jsonRespStr, 'x.widget.items[1].component.widget.items[0].component.widget.items[2].component.widget.items[0].component.widget.items[1].component.widget.items[0].component.data[1].value')
  // }
  const message2 = 'TEST SCRIPT FROM INJECT.JS'
  //     let messages = message + message1 + message3;
  const propertyReturnType = document.getElementById('ext-comp-1009').value
  const parameterName = document.getElementsByClassName('x-grid3-col-paramName')
  const parameterType = document.getElementsByClassName('x-grid3-col-paramType')
  const variableName = document.getElementById('variableName').value
  let params = ''
  for (let i = 0; i < parameterName.length; i++) {
    params += '- ' + parameterName[i].innerHTML + ' (' + parameterType[i].innerHTML + ')\n'
  }
  const returnType = '- ' + propertyReturnType + '\n'

  const commentHeader2 = '/*\n' + variableName + '\n@param\n' + params + '@return\n' + returnType + '*/ '
  const commentHeaderEvent = new CustomEvent('PassCommentHeader', { detail: commentHeader2 })
  const event = new CustomEvent('PassToBackground', { detail: message })
  window.dispatchEvent(event)
  window.dispatchEvent(commentHeaderEvent)
}

window.addEventListener('unloadCode', function (evt) {
  const event = new CustomEvent('PassCodeToBackground', { detail: frame_bm_script.editArea.textarea.value })
  window.dispatchEvent(event)
})
// Listen for the load code event
window.addEventListener('loadCode', function (evt) {
  code = evt.detail
  frame_bm_script.editArea.textarea.value = code
  frame_bm_script.editArea.textareaFocused = true

  // Perform Validation
  document.getElementsByClassName('bmx-spellcheck')[0].click()
}, false)

// Listen for the load test code event
window.addEventListener('loadTestCode',
  function (evt) {
    code = evt.detail
    // need to rewrite these if's
    const commTestScript = document.getElementById('ext-comp-1080')
    const utilTestScript = document.getElementById('ext-comp-1040')
    const commTestScript2 = document.getElementById('ext-comp-1095')
    if (utilTestScript) {
      utilTestScript.value = code
    } else if (commTestScript) {
      commTestScript.value = code
    } else if (commTestScript2) {
      commTestScript2.value = code
    }
    // RUN DEBUGGER
    document.getElementsByClassName('bmx-debug')[1].click()
  }, false)

window.addEventListener('unloadTestCode',
  function (evt) {
    let testScript
    const useTestScript = document.getElementById('useScript').checked
    if (useTestScript) {
      const commTestScript = document.getElementById('ext-comp-1080')
      const utilTestScript = document.getElementById('ext-comp-1040')
      // ext-comp-1095
      const commTestScript2 = document.getElementById('ext-comp-1095')
      if (utilTestScript) {
        testScript = utilTestScript.value
      } else if (commTestScript) {
        testScript = commTestScript.value
      } else if (commTestScript2) {
        testScript = commTestScript2.value
      }
      if (testScript == '') {
        testScript = '\n'
      }
      const event = new CustomEvent('PassTestCodeToBackground', { detail: testScript })
      window.dispatchEvent(event)
    } else {
      alert('Please Check - Use Test Script.')
    }
  }, false)
