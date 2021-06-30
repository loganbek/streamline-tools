function EAL () {
  var t = this
  t.version = '0.8'
  date = new Date()
  t.start_time = date.getTime()
  t.win = 'loading'
  t.error = false
  t.baseURL = ''
  t.template = ''
  t.lang = {}
  t.load_syntax = {}
  t.syntax = {}
  t.loadedFiles = []
  t.waiting_loading = {}
  t.scripts_to_load = []
  t.sub_scripts_to_load = []
  t.resize = []
  t.hidden = {}
  t.default_settings = {
    debug: false,
    smooth_selection: true,
    font_size: '10',
    font_family: 'monospace',
    start_highlight: false,
    toolbar:
      'search,go_to_line,fullscreen,|,undo,redo,|,select_font,|,change_smooth_selection,highlight,reset_highlight,word_wrap,|,help',
    begin_toolbar: '',
    end_toolbar: '',
    is_multi_files: false,
    allow_resize: 'both',
    show_line_colors: false,
    min_width: 400,
    min_height: 125,
    replace_tab_by_spaces: false,
    allow_toggle: true,
    language: 'en',
    syntax: '',
    syntax_selection_allow:
      'basic,brainfuck,c,coldfusion,cpp,css,html,js,pas,perl,php,python,ruby,robotstxt,sql,tsql,vb,xml',
    display: 'onload',
    max_undo: 30,
    browsers: 'known',
    plugins: '',
    gecko_spellcheck: false,
    fullscreen: false,
    is_editable: true,
    cursor_position: 'begin',
    word_wrap: false,
    autocompletion: false,
    load_callback: '', // TODO:
    save_callback: '',
    change_callback: '',
    submit_callback: '',
    EA_init_callback: '',
    EA_delete_callback: '',
    EA_load_callback: '',
    EA_unload_callback: '',
    EA_toggle_on_callback: '',
    EA_toggle_off_callback: '',
    EA_file_switch_on_callback: '',
    EA_file_switch_off_callback: '',
    EA_file_close_callback: ''
  }
  t.advanced_buttons = [
    ['new_document', 'newdocument.gif', 'new_document', false],
    ['search', 'search.gif', 'show_search', false],
    ['go_to_line', 'go_to_line.gif', 'go_to_line', false],
    ['undo', 'undo.gif', 'undo', true],
    ['redo', 'redo.gif', 'redo', true],
    [
      'change_smooth_selection',
      'smooth_selection.gif',
      'change_smooth_selection_mode',
      true
    ],
    ['reset_highlight', 'reset_highlight.gif', 'resync_highlight', true],
    ['highlight', 'highlight.gif', 'change_highlight', true],
    ['help', 'help.gif', 'show_help', false],
    ['save', 'save.gif', 'save', false],
    ['load', 'load.gif', 'load', false],
    ['fullscreen', 'fullscreen.gif', 'toggle_full_screen', false],
    ['word_wrap', 'word_wrap.gif', 'toggle_word_wrap', true],
    ['autocompletion', 'autocompletion.gif', 'toggle_autocompletion', true]
  ]
  t.set_browser_infos(t)
  if (
    t.isIE >= 6 ||
    t.isOpera >= 9 ||
    t.isFirefox ||
    t.isChrome ||
    t.isCamino ||
    t.isSafari >= 3
  )
    t.isValidBrowser = true
  else t.isValidBrowser = false
  t.set_base_url()
  for (var i = 0; i < t.scripts_to_load.length; i++) {
    setTimeout(
      "eAL.load_script('" + t.baseURL + t.scripts_to_load[i] + ".js');",
      1
    )
    t.waiting_loading[t.scripts_to_load[i] + '.js'] = false
  }
  t.add_event(window, 'load', EAL.prototype.window_loaded)
}
EAL.prototype = {
  has_error: function () {
    this.error = true
    for (var i in EAL.prototype) {
      EAL.prototype[i] = function () {}
    }
  },
  set_browser_infos: function (o) {
    ua = navigator.userAgent
    o.isMacOS = ua.indexOf('Mac OS') != -1
    o.isIE = navigator.appName == 'Microsoft Internet Explorer'
    if (o.isIE) {
      o.isIE = ua.replace(/^.*?MSIE\s+([0-9\.]+).*$/, '$1')
      if (o.isIE < 6) o.has_error()
    }
    if ((o.isOpera = ua.indexOf('Opera') != -1)) {
      o.isOpera = ua.replace(/^.*?Opera.*?([0-9\.]+).*$/i, '$1')
      if (o.isOpera < 9) o.has_error()
      o.isIE = false
    }
    if ((o.isFirefox = ua.indexOf('Firefox') != -1))
      o.isFirefox = ua.replace(/^.*?Firefox.*?([0-9\.]+).*$/i, '$1')
    if ((o.isIceweasel = ua.indexOf('Iceweasel') != -1))
      o.isFirefox = o.isIceweasel = ua.replace(
        /^.*?Iceweasel.*?([0-9\.]+).*$/i,
        '$1'
      )
    if ((o.GranParadiso = ua.indexOf('GranParadiso') != -1))
      o.isFirefox = o.isGranParadiso = ua.replace(
        /^.*?GranParadiso.*?([0-9\.]+).*$/i,
        '$1'
      )
    if ((o.BonEcho = ua.indexOf('BonEcho') != -1))
      o.isFirefox = o.isBonEcho = ua.replace(
        /^.*?BonEcho.*?([0-9\.]+).*$/i,
        '$1'
      )
    if ((o.isCamino = ua.indexOf('Camino') != -1))
      o.isCamino = ua.replace(/^.*?Camino.*?([0-9\.]+).*$/i, '$1')
    if ((o.isSafari = ua.indexOf('Safari') != -1))
      o.isSafari = ua.replace(/^.*?Version\/([0-9]+\.[0-9]+).*$/i, '$1')
    if ((o.isChrome = ua.indexOf('Chrome') != -1)) {
      o.isChrome = ua.replace(/^.*?Chrome.*?([0-9\.]+).*$/i, '$1')
      o.isSafari = false
    }
  },
  window_loaded: function () {
    eAL.win = 'loaded'
    if (document.forms) {
      for (var i = 0; i < document.forms.length; i++) {
        var form = document.forms[i]
        form.edit_area_replaced_submit = null
        try {
          form.edit_area_replaced_submit = form.onsubmit
          form.onsubmit = ''
        } catch (e) {}
        eAL.add_event(form, 'submit', EAL.prototype.submit)
        eAL.add_event(form, 'reset', EAL.prototype.reset) // TODO:
      }
    }
    eAL.add_event(window, 'unload', function () {
      for (var i in eAs) {
        eAL.delete_instance(i)
      }
    })
  },
  init_ie_textarea: function (id) {
    var a = document.getElementById(id)
    try {
      if (a && typeof a.focused == 'undefined') {
        a.focus() // TODO:
        a.focused = true
        a.selectionStart = a.selectionEnd = 0
        get_IE_selection(a)
        eAL.add_event(a, 'focus', IE_textarea_focus)
        eAL.add_event(a, 'blur', IE_textarea_blur)
      }
    } catch (ex) {}
  },
  init: function (settings) {
    var t = this,
      s = settings,
      i
    if (!s['id']) t.has_error()
    if (t.error) return
    if (eAs[s['id']]) t.delete_instance(s['id'])
    for (i in t.default_settings) {
      if (typeof s[i] == 'undefined') s[i] = t.default_settings[i]
    }
    if (s['browsers'] == 'known' && t.isValidBrowser == false) {
      return
    }
    if (s['begin_toolbar'].length > 0)
      s['toolbar'] = s['begin_toolbar'] + ',' + s['toolbar']
    if (s['end_toolbar'].length > 0)
      s['toolbar'] = s['toolbar'] + ',' + s['end_toolbar']
    s['tab_toolbar'] = s['toolbar'].replace(/ /g, '').split(',')
    s['plugins'] = s['plugins'].replace(/ /g, '').split(',')
    for (i = 0; i < s['plugins'].length; i++) {
      if (s['plugins'][i].length == 0) s['plugins'].splice(i, 1)
    }
    t.get_template()
    t.load_script(t.baseURL + 'langs/' + s['language'] + '.js')
    if (s['syntax'].length > 0) {
      s['syntax'] = s['syntax'].toLowerCase()
      t.load_script(t.baseURL + 'reg_syntax/' + s['syntax'] + '.js')
    }
    eAs[s['id']] = {
      settings: s
    }
    eAs[s['id']]['displayed'] = false
    eAs[s['id']]['hidden'] = false
    t.start(s['id'])
  },
  delete_instance: function (id) {
    var d = document,
      fs = window.frames,
      span,
      iframe
    eAL.execCommand(id, 'EA_delete')
    if (fs['frame_' + id] && fs['frame_' + id].editArea) {
      if (eAs[id]['displayed']) eAL.toggle(id, 'off')
      fs['frame_' + id].editArea.execCommand('EA_unload')
    }
    span = d.getElementById('EditAreaArroundInfos_' + id)
    if (span) span.parentNode.removeChild(span)
    iframe = d.getElementById('frame_' + id)
    if (iframe) {
      iframe.parentNode.removeChild(iframe)
      try {
        delete fs['frame_' + id]
      } catch (e) {}
    }
    delete eAs[id]
  },
  start: function (id) {
    var t = this,
      d = document,
      f,
      span,
      father,
      next,
      html = '',
      html_toolbar_content = '',
      template,
      content,
      i
    if (t.win != 'loaded') {
      setTimeout("eAL.start('" + id + "');", 50)
      return
    }
    for (i in t.waiting_loading) {
      if (
        t.waiting_loading[i] != 'loaded' &&
        typeof t.waiting_loading[i] != 'function'
      ) {
        setTimeout("eAL.start('" + id + "');", 50)
        return
      }
    }
    if (
      !t.lang[eAs[id]['settings']['language']] ||
      (eAs[id]['settings']['syntax'].length > 0 &&
        !t.load_syntax[eAs[id]['settings']['syntax']])
    ) {
      setTimeout("eAL.start('" + id + "');", 50)
      return
    }
    if (eAs[id]['settings']['syntax'].length > 0) t.init_syntax_regexp()
    if (
      !d.getElementById('EditAreaArroundInfos_' + id) &&
      (eAs[id]['settings']['debug'] || eAs[id]['settings']['allow_toggle'])
    ) {
      span = d.createElement('span')
      span.id = 'EditAreaArroundInfos_' + id
      if (eAs[id]['settings']['allow_toggle']) {
        checked =
          eAs[id]['settings']['display'] == 'onload' ? "checked='checked'" : ''
        html += "<div id='edit_area_toggle_" + i + "'>"
        html +=
          "<input id='edit_area_toggle_checkbox_" +
          id +
          "' class='toggle_" +
          id +
          "' type='checkbox' onclick='eAL.toggle(\"" +
          id +
          "\");' accesskey='e' " +
          checked +
          ' />'
        html +=
          "<label for='edit_area_toggle_checkbox_" +
          id +
          "'>{$toggle}</label></div>"
      }
      if (eAs[id]['settings']['debug'])
        html +=
          "<textarea id='edit_area_debug_" +
          id +
          "' style='z-index:20;width:100%;height:120px;overflow:auto;border:solid black 1px;'></textarea><br />"
      html = t.translate(html, eAs[id]['settings']['language'])
      span.innerHTML = html
      father = d.getElementById(id).parentNode
      next = d.getElementById(id).nextSibling
      if (next == null) father.appendChild(span)
      else father.insertBefore(span, next)
    }
    if (!eAs[id]['initialized']) {
      t.execCommand(id, 'EA_init')
      if (eAs[id]['settings']['display'] == 'later') {
        eAs[id]['initialized'] = true
        return
      }
    }
    if (t.isIE) {
      t.init_ie_textarea(id)
    }
    area = eAs[id]
    for (i = 0; i < area['settings']['tab_toolbar'].length; i++) {
      html_toolbar_content += t.get_control_html(
        area['settings']['tab_toolbar'][i],
        area['settings']['language']
      )
    }
    html_toolbar_content = t.translate(
      html_toolbar_content,
      area['settings']['language'],
      'template'
    )
    if (!t.iframe_script) {
      t.iframe_script = ''
      for (i = 0; i < t.sub_scripts_to_load.length; i++)
        t.iframe_script +=
          '<script language="javascript" type="text/javascript" src="' +
          t.baseURL +
          t.sub_scripts_to_load[i] +
          '.js"></script>'
    }
    for (i = 0; i < area['settings']['plugins'].length; i++) {
      if (!t.all_plugins_loaded)
        t.iframe_script +=
          '<script language="javascript" type="text/javascript" src="' +
          t.baseURL +
          'plugins/' +
          area['settings']['plugins'][i] +
          '/' +
          area['settings']['plugins'][i] +
          '.js"></script>'
      t.iframe_script +=
        '<script language="javascript" type="text/javascript" src="' +
        t.baseURL +
        'plugins/' +
        area['settings']['plugins'][i] +
        '/langs/' +
        area['settings']['language'] +
        '.js"></script>'
    }
    if (!t.iframe_css) {
      t.iframe_css =
        "<link href='" +
        t.baseURL +
        "edit_area.css' rel='stylesheet' type='text/css' />"
    }
    template = t.template.replace(/\[__BASEURL__\]/g, t.baseURL)
    template = template.replace('[__TOOLBAR__]', html_toolbar_content)
    template = t.translate(template, area['settings']['language'], 'template')
    template = template.replace('[__CSSRULES__]', t.iframe_css)
    template = template.replace('[__JSCODE__]', t.iframe_script)
    template = template.replace('[__EA_VERSION__]', t.version) // TODO:
    area.textarea = d.getElementById(area['settings']['id'])
    eAs[area['settings']['id']]['textarea'] = area.textarea
    if (typeof window.frames['frame_' + area['settings']['id']] != 'undefined')
      delete window.frames['frame_' + area['settings']['id']]
    father = area.textarea.parentNode //TODO:
    content = d.createElement('iframe')
    content.name = 'frame_' + area['settings']['id']
    content.id = 'frame_' + area['settings']['id']
    content.style.borderWidth = '0px'
    setAttribute(content, 'frameBorder', '0')
    content.style.overflow = 'hidden'
    content.style.display = 'none'
    next = area.textarea.nextSibling
    if (next == null) father.appendChild(content)
    else father.insertBefore(content, next)
    f = window.frames['frame_' + area['settings']['id']]
    f.document.open()
    f.eAs = eAs
    f.area_id = area['settings']['id']
    f.document.area_id = area['settings']['id']
    f.document.write(template)
    f.document.close()
  },
  toggle: function (id, toggle_to) {
    if (!toggle_to) toggle_to = eAs[id]['displayed'] == true ? 'off' : 'on'
    if (eAs[id]['displayed'] == true && toggle_to == 'off') {
      this.toggle_off(id)
    } else if (eAs[id]['displayed'] == false && toggle_to == 'on') {
      this.toggle_on(id)
    }
    return false
  },
  toggle_off: function (id) {
    var fs = window.frames,
      f,
      t,
      parNod,
      nxtSib,
      selStart,
      selEnd,
      scrollTop,
      scrollLeft
    if (fs['frame_' + id]) {
      f = fs['frame_' + id]
      t = eAs[id]['textarea']
      if (f.editArea.fullscreen['isFull']) f.editArea.toggle_full_screen(false) // TODO: maybe for enhancement
      eAs[id]['displayed'] = false
      t.wrap = 'off'
      setAttribute(t, 'wrap', 'off')
      parNod = t.parentNode
      if (parNod) {
        nxtSib = t.nextSibling
        parNod.removeChild(t)
        parNod.insertBefore(t, nxtSib)
      }
      t.value = f.editArea.textarea.value // TODO:
      selStart = f.editArea.last_selection['selectionStart']
      selEnd = f.editArea.last_selection['selectionEnd']
      scrollTop = f.document.getElementById('result').scrollTop
      scrollLeft = f.document.getElementById('result').scrollLeft
      if (document.getElementById('frame_' + id)) {
        document.getElementById('frame_' + id).style.display = 'none'
      }
      t.style.display = 'inline'
      try {
        t.focus()
      } catch (e) {}
      if (this.isIE) {
        t.selectionStart = selStart
        t.selectionEnd = selEnd
        t.focused = true
        set_IE_selection(t)
      } else {
        if (this.isOpera && this.isOpera < 9.6) {
          t.setSelectionRange(0, 0)
        }
        try {
          t.setSelectionRange(selStart, selEnd)
        } catch (e) {}
      }
      t.scrollTop = scrollTop
      t.scrollLeft = scrollLeft
      f.editArea.execCommand('toggle_off')
    }
  },
  toggle_on: function (id) {
    var fs = window.frames,
      f,
      t,
      selStart = 0,
      selEnd = 0,
      scrollTop = 0,
      scrollLeft = 0,
      curPos,
      elem
    if (fs['frame_' + id]) {
      f = fs['frame_' + id]
      t = eAs[id]['textarea']
      area = f.editArea
      area.textarea.value = t.value
      curPos = eAs[id]['settings']['cursor_position']
      if (t.use_last == true) {
        selStart = t.last_selectionStart
        selEnd = t.last_selectionEnd
        scrollTop = t.last_scrollTop
        scrollLeft = t.last_scrollLeft
        t.use_last = false
      } else if (curPos == 'auto') {
        try {
          selStart = t.selectionStart
          selEnd = t.selectionEnd
          scrollTop = t.scrollTop
          scrollLeft = t.scrollLeft
        } catch (ex) {}
      }
      this.set_editarea_size_from_textarea(
        id,
        document.getElementById('frame_' + id)
      )
      t.style.display = 'none'
      document.getElementById('frame_' + id).style.display = 'inline'
      area.execCommand('focus')
      eAs[id]['displayed'] = true
      area.execCommand('update_size')
      f.document.getElementById('result').scrollTop = scrollTop
      f.document.getElementById('result').scrollLeft = scrollLeft
      area.area_select(selStart, selEnd - selStart)
      area.execCommand('toggle_on')
    } else {
      elem = document.getElementById(id)
      elem.last_selectionStart = elem.selectionStart
      elem.last_selectionEnd = elem.selectionEnd
      elem.last_scrollTop = elem.scrollTop
      elem.last_scrollLeft = elem.scrollLeft
      elem.use_last = true
      eAL.start(id)
    }
  },
  set_editarea_size_from_textarea: function (id, frame) {
    var elem, width, height
    elem = document.getElementById(id)
    width = Math.max(eAs[id]['settings']['min_width'], elem.offsetWidth) + 'px'
    height =
      Math.max(eAs[id]['settings']['min_height'], elem.offsetHeight) + 'px'
    if (elem.style.width.indexOf('%') != -1) width = elem.style.width
    if (elem.style.height.indexOf('%') != -1) height = elem.style.height
    frame.style.width = width
    frame.style.height = height
  },
  set_base_url: function () {
    var t = this,
      elems,
      i,
      docBasePath
    if (!this.baseURL) {
      elems = document.getElementsByTagName('script')
      for (i = 0; i < elems.length; i++) {
        if (elems[i].src && elems[i].src.match(/edit_area_[^\\\/]*$/i)) {
          var src = elems[i].src
          src = src.substring(0, src.lastIndexOf('/'))
          this.baseURL = src
          this.file_name = elems[i].src.substr(
            elems[i].src.lastIndexOf('/') + 1
          )
          break
        }
      }
    }
    docBasePath = document.location.href
    if (docBasePath.indexOf('?') != -1)
      docBasePath = docBasePath.substring(0, docBasePath.indexOf('?'))
    docBasePath = docBasePath.substring(0, docBasePath.lastIndexOf('/'))
    if (t.baseURL.indexOf('://') == -1 && t.baseURL.charAt(0) != '/') {
      t.baseURL = docBasePath + '/' + t.baseURL
    }
    t.baseURL += '/'
  },
  get_button_html: function (id, img, exec, isFileSpecific, baseURL) {
    var cmd, html
    if (!baseURL) baseURL = this.baseURL
    cmd = "editArea.execCommand('" + exec + "')"
    html =
      '<a id="a_' +
      id +
      '" href="javascript:' +
      cmd +
      '" onclick="' +
      cmd +
      ';return false;" onmousedown="return false;" target="_self" fileSpecific="' +
      (isFileSpecific ? 'yes' : 'no') +
      '">'
    html +=
      '<img id="' +
      id +
      '" src="' +
      baseURL +
      'images/' +
      img +
      '" title="{$' +
      id +
      '}" width="20" height="20" class="editAreaButtonNormal" onmouseover="editArea.switchClass(this,\'editAreaButtonOver\');" onmouseout="editArea.restoreClass(this);" onmousedown="editArea.restoreAndSwitchClass(this,\'editAreaButtonDown\');" /></a>'
    return html
  },
  get_control_html: function (button_name, lang) {
    var t = this,
      i,
      but,
      html,
      si
    for (i = 0; i < t.advanced_buttons.length; i++) {
      but = t.advanced_buttons[i]
      if (but[0] == button_name) {
        return t.get_button_html(but[0], but[1], but[2], but[3])
      }
    }
    switch (button_name) {
      case '*':
      case 'return':
        return '<br />'
      case '|':
      case 'separator':
        return (
          '<img src="' +
          t.baseURL +
          'images/spacer.gif" width="1" height="15" class="editAreaSeparatorLine">'
        )
      case 'select_font':
        html =
          "<select id='area_font_size' onchange='javascript:editArea.execCommand(\"change_font_size\")' fileSpecific='yes'>"
        html += "<option value='-1'>{$font_size}</option>"
        si = [8, 9, 10, 11, 12, 14]
        for (i = 0; i < si.length; i++) {
          html += "<option value='" + si[i] + "'>" + si[i] + ' pt</option>'
        }
        html += '</select>'
        return html
      case 'syntax_selection':
        html =
          "<select id='syntax_selection' onchange='javascript:editArea.execCommand(\"change_syntax\",this.value)' fileSpecific='yes'>"
        html += "<option value='-1'>{$syntax_selection}</option>"
        html += '</select>'
        return html
    }
    return (
      "<span id='tmp_tool_" + button_name + "'>[" + button_name + ']</span>'
    )
  },
  get_template: function () {
    if (this.template == '') {
      var xhr_object = null
      if (window.XMLHttpRequest) xhr_object = new XMLHttpRequest()
      else if (window.ActiveXObject)
        xhr_object = new ActiveXObject('Microsoft.XMLHTTP')
      else {
        alert('XMLHTTPRequest not supported. EditArea not loaded')
        return
      }
      xhr_object.open('GET', this.baseURL + 'template.html', false)
      xhr_object.send(null)
      if (xhr_object.readyState == 4) this.template = xhr_object.responseText
      else this.has_error()
    }
  },
  translate: function (text, lang, mode) {
    if (mode == 'word') text = eAL.get_word_translation(text, lang)
    else if ((mode = 'template')) {
      eAL.current_language = lang
      text = text.replace(/\{\$([^\}]+)\}/gm, eAL.translate_template)
    }
    return text
  },
  translate_template: function () {
    return eAL.get_word_translation(
      EAL.prototype.translate_template.arguments[1],
      eAL.current_language
    )
  },
  get_word_translation: function (val, lang) {
    var i
    for (i in eAL.lang[lang]) {
      if (i == val) return eAL.lang[lang][i]
    }
    return '_' + val
  },
  load_script: function (url) {
    //TODO: use instead of textarea innerhtml
    var t = this,
      d = document,
      script,
      head
    if (t.loadedFiles[url]) return
    try {
      script = d.createElement('script')
      script.type = 'text/javascript'
      script.src = url
      script.charset = 'UTF-8'
      d.getElementsByTagName('head')[0].appendChild(script)
    } catch (e) {
      d.write(
        '<sc' +
          'ript language="javascript" type="text/javascript" src="' +
          url +
          '" charset="UTF-8"></sc' +
          'ript>'
      )
    }
    t.loadedFiles[url] = true
  },
  add_event: function (obj, name, handler) {
    try {
      if (obj.attachEvent) {
        obj.attachEvent('on' + name, handler)
      } else {
        obj.addEventListener(name, handler, false)
      }
    } catch (e) {}
  },
  remove_event: function (obj, name, handler) {
    try {
      if (obj.detachEvent) obj.detachEvent('on' + name, handler)
      else obj.removeEventListener(name, handler, false)
    } catch (e) {}
  },
  reset: function (e) {
    // TODO: try on load
    var formObj, is_child, i, x
    formObj = eAL.isIE ? window.event.srcElement : e.target
    if (formObj.tagName != 'FORM') formObj = formObj.form
    for (i in eAs) {
      is_child = false
      for (x = 0; x < formObj.elements.length; x++) {
        if (formObj.elements[x].id == i) is_child = true
      }
      if (
        window.frames['frame_' + i] &&
        is_child &&
        eAs[i]['displayed'] == true
      ) {
        var exec =
          'window.frames["frame_' +
          i +
          '"].editArea.textarea.value=document.getElementById("' +
          i +
          '").value;'
        exec +=
          'window.frames["frame_' + i + '"].editArea.execCommand("focus");'
        exec +=
          'window.frames["frame_' + i + '"].editArea.check_line_selection();'
        exec +=
          'window.frames["frame_' + i + '"].editArea.execCommand("reset");'
        window.setTimeout(exec, 10)
      }
    }
    return
  },
  submit: function (e) {
    var formObj,
      is_child,
      fs = window.frames,
      i,
      x
    formObj = eAL.isIE ? window.event.srcElement : e.target
    if (formObj.tagName != 'FORM') formObj = formObj.form
    for (i in eAs) {
      is_child = false
      for (x = 0; x < formObj.elements.length; x++) {
        if (formObj.elements[x].id == i) is_child = true
      }
      if (is_child) {
        if (fs['frame_' + i] && eAs[i]['displayed'] == true)
          document.getElementById(i).value =
            fs['frame_' + i].editArea.textarea.value
        eAL.execCommand(i, 'EA_submit')
      }
    }
    if (typeof formObj.edit_area_replaced_submit == 'function') {
      res = formObj.edit_area_replaced_submit()
      if (res == false) {
        if (eAL.isIE) return false
        else e.preventDefault()
      }
    }
    return
  },
  getValue: function (id) {
    if (window.frames['frame_' + id] && eAs[id]['displayed'] == true) {
      return window.frames['frame_' + id].editArea.textarea.value
    } else if ((elem = document.getElementById(id))) {
      return elem.value
    }
    return false
  },
  setValue: function (id, new_val) {
    // TODO:
    var fs = window.frames
    if ((f = fs['frame_' + id]) && eAs[id]['displayed'] == true) {
      f.editArea.textarea.value = new_val
      f.editArea.execCommand('focus')
      f.editArea.check_line_selection(false)
      f.editArea.execCommand('onchange')
    } else if ((elem = document.getElementById(id))) {
      elem.value = new_val
    }
  },
  getSelectionRange: function (id) {
    var sel,
      eA,
      fs = window.frames
    sel = {
      start: 0,
      end: 0
    }
    if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
      eA = fs['frame_' + id].editArea
      sel['start'] = eA.textarea.selectionStart
      sel['end'] = eA.textarea.selectionEnd
    } else if ((elem = document.getElementById(id))) {
      sel = getSelectionRange(elem)
    }
    return sel
  },
  setSelectionRange: function (id, new_start, new_end) {
    var fs = window.frames
    if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
      fs['frame_' + id].editArea.area_select(new_start, new_end - new_start)
      if (!this.isIE) {
        fs['frame_' + id].editArea.check_line_selection(false)
        fs['frame_' + id].editArea.scroll_to_view()
      }
    } else if ((elem = document.getElementById(id))) {
      setSelectionRange(elem, new_start, new_end)
    }
  },
  getSelectedText: function (id) {
    var sel = this.getSelectionRange(id)
    return this.getValue(id).substring(sel['start'], sel['end'])
  },
  setSelectedText: function (id, new_val) {
    var fs = window.frames,
      d = document,
      sel,
      text,
      scrollTop,
      scrollLeft,
      new_sel_end
    new_val = new_val.replace(/\r/g, '')
    sel = this.getSelectionRange(id)
    text = this.getValue(id)
    if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
      scrollTop = fs['frame_' + id].document.getElementById('result').scrollTop
      scrollLeft = fs['frame_' + id].document.getElementById('result')
        .scrollLeft
    } else {
      scrollTop = d.getElementById(id).scrollTop
      scrollLeft = d.getElementById(id).scrollLeft
    }
    text =
      text.substring(0, sel['start']) + new_val + text.substring(sel['end'])
    this.setValue(id, text)
    new_sel_end = sel['start'] + new_val.length
    this.setSelectionRange(id, sel['start'], new_sel_end)
    if (new_val != this.getSelectedText(id).replace(/\r/g, '')) {
      this.setSelectionRange(
        id,
        sel['start'],
        new_sel_end + new_val.split('\n').length - 1
      )
    }
    if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
      fs['frame_' + id].document.getElementById('result').scrollTop = scrollTop
      fs['frame_' + id].document.getElementById(
        'result'
      ).scrollLeft = scrollLeft
      fs['frame_' + id].editArea.execCommand('onchange')
    } else {
      d.getElementById(id).scrollTop = scrollTop
      d.getElementById(id).scrollLeft = scrollLeft
    }
  },
  insertTags: function (id, open_tag, close_tag) {
    var old_sel, new_sel
    old_sel = this.getSelectionRange(id)
    text = open_tag + this.getSelectedText(id) + close_tag
    eAL.setSelectedText(id, text)
    new_sel = this.getSelectionRange(id)
    if (old_sel['end'] > old_sel['start'])
      this.setSelectionRange(id, new_sel['end'], new_sel['end'])
    else
      this.setSelectionRange(
        id,
        old_sel['start'] + open_tag.length,
        old_sel['start'] + open_tag.length
      )
  },
  hide: function (id) {
    var fs = window.frames,
      d = document,
      t = this,
      scrollTop,
      scrollLeft,
      span
    if (d.getElementById(id) && !t.hidden[id]) {
      t.hidden[id] = {}
      t.hidden[id]['selectionRange'] = t.getSelectionRange(id)
      if (d.getElementById(id).style.display != 'none') {
        t.hidden[id]['scrollTop'] = d.getElementById(id).scrollTop
        t.hidden[id]['scrollLeft'] = d.getElementById(id).scrollLeft
      }
      if (fs['frame_' + id]) {
        t.hidden[id]['toggle'] = eAs[id]['displayed']
        if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
          scrollTop = fs['frame_' + id].document.getElementById('result')
            .scrollTop
          scrollLeft = fs['frame_' + id].document.getElementById('result')
            .scrollLeft
        } else {
          scrollTop = d.getElementById(id).scrollTop
          scrollLeft = d.getElementById(id).scrollLeft
        }
        t.hidden[id]['scrollTop'] = scrollTop
        t.hidden[id]['scrollLeft'] = scrollLeft
        if (eAs[id]['displayed'] == true) eAL.toggle_off(id)
      }
      span = d.getElementById('EditAreaArroundInfos_' + id)
      if (span) {
        span.style.display = 'none'
      }
      d.getElementById(id).style.display = 'none'
    }
  },
  show: function (id) {
    var fs = window.frames,
      d = document,
      t = this,
      span
    if ((elem = d.getElementById(id)) && t.hidden[id]) {
      elem.style.display = 'inline'
      elem.scrollTop = t.hidden[id]['scrollTop']
      elem.scrollLeft = t.hidden[id]['scrollLeft']
      span = d.getElementById('EditAreaArroundInfos_' + id)
      if (span) {
        span.style.display = 'inline'
      }
      if (fs['frame_' + id]) {
        elem.style.display = 'inline'
        if (t.hidden[id]['toggle'] == true) eAL.toggle_on(id)
        scrollTop = t.hidden[id]['scrollTop']
        scrollLeft = t.hidden[id]['scrollLeft']
        if (fs['frame_' + id] && eAs[id]['displayed'] == true) {
          fs['frame_' + id].document.getElementById(
            'result'
          ).scrollTop = scrollTop
          fs['frame_' + id].document.getElementById(
            'result'
          ).scrollLeft = scrollLeft
        } else {
          elem.scrollTop = scrollTop
          elem.scrollLeft = scrollLeft
        }
      }
      sel = t.hidden[id]['selectionRange']
      t.setSelectionRange(id, sel['start'], sel['end'])
      delete t.hidden[id]
    }
  },
  getCurrentFile: function (id) {
    return this.execCommand(id, 'get_file', this.execCommand(id, 'curr_file'))
  },
  getFile: function (id, file_id) {
    return this.execCommand(id, 'get_file', file_id)
  },
  getAllFiles: function (id) {
    return this.execCommand(id, 'get_all_files()')
  },
  openFile: function (id, file_infos) {
    return this.execCommand(id, 'open_file', file_infos)
  },
  closeFile: function (id, file_id) {
    return this.execCommand(id, 'close_file', file_id)
  },
  setFileEditedMode: function (id, file_id, to) {
    var reg1, reg2
    reg1 = new RegExp('\\\\', 'g')
    reg2 = new RegExp('"', 'g')
    return this.execCommand(
      id,
      'set_file_edited_mode("' +
        file_id.replace(reg1, '\\\\').replace(reg2, '\\"') +
        '",' +
        to +
        ')'
    )
  },
  execCommand: function (id, cmd, fct_param) {
    // TODO:
    switch (cmd) {
      case 'EA_init':
        if (eAs[id]['settings']['EA_init_callback'].length > 0)
          eval(eAs[id]['settings']['EA_init_callback'] + "('" + id + "');")
        break
      case 'EA_delete':
        if (eAs[id]['settings']['EA_delete_callback'].length > 0)
          eval(eAs[id]['settings']['EA_delete_callback'] + "('" + id + "');")
        break
      case 'EA_submit':
        if (eAs[id]['settings']['submit_callback'].length > 0)
          eval(eAs[id]['settings']['submit_callback'] + "('" + id + "');")
        break
    }
    if (window.frames['frame_' + id] && window.frames['frame_' + id].editArea) {
      if (fct_param != undefined)
        return eval(
          'window.frames["frame_' + id + '"].editArea.' + cmd + '(fct_param);'
        )
      else
        return eval('window.frames["frame_' + id + '"].editArea.' + cmd + ';')
    }
    return false
  }
}
var eAL = new EAL()
var eAs = {}
function getAttribute (elm, aName) {
  var aValue, taName, i
  try {
    aValue = elm.getAttribute(aName)
  } catch (exept) {}
  if (!aValue) {
    for (i = 0; i < elm.attributes.length; i++) {
      taName = elm.attributes[i].name.toLowerCase()
      if (taName == aName) {
        aValue = elm.attributes[i].value
        return aValue
      }
    }
  }
  return aValue
}
function setAttribute (elm, attr, val) {
  if (attr == 'class') {
    elm.setAttribute('className', val)
    elm.setAttribute('class', val)
  } else {
    elm.setAttribute(attr, val)
  }
}
function getChildren (
  elem,
  elem_type,
  elem_attribute,
  elem_attribute_match,
  option,
  depth
) {
  if (!option) var option = 'single'
  if (!depth) var depth = -1
  if (elem) {
    var children = elem.childNodes
    var result = null
    var results = []
    for (var x = 0; x < children.length; x++) {
      strTagName = new String(children[x].tagName)
      children_class = '?'
      if (strTagName != 'undefined') {
        child_attribute = getAttribute(children[x], elem_attribute)
        if (
          (strTagName.toLowerCase() == elem_type.toLowerCase() ||
            elem_type == '') &&
          (elem_attribute == '' || child_attribute == elem_attribute_match)
        ) {
          if (option == 'all') {
            results.push(children[x])
          } else {
            return children[x]
          }
        }
        if (depth != 0) {
          result = getChildren(
            children[x],
            elem_type,
            elem_attribute,
            elem_attribute_match,
            option,
            depth - 1
          )
          if (option == 'all') {
            if (result.length > 0) {
              results = results.concat(result)
            }
          } else if (result != null) {
            return result
          }
        }
      }
    }
    if (option == 'all') return results
  }
  return null
}
function isChildOf (elem, parent) {
  if (elem) {
    if (elem == parent) return true
    while (elem.parentNode != 'undefined') {
      return isChildOf(elem.parentNode, parent)
    }
  }
  return false
}
function getMouseX (e) {
  if (e != null && typeof e.pageX != 'undefined') {
    return e.pageX
  } else {
    return (e != null ? e.x : event.x) + document.documentElement.scrollLeft
  }
}
function getMouseY (e) {
  if (e != null && typeof e.pageY != 'undefined') {
    return e.pageY
  } else {
    return (e != null ? e.y : event.y) + document.documentElement.scrollTop
  }
}
function calculeOffsetLeft (r) {
  return calculeOffset(r, 'offsetLeft')
}
function calculeOffsetTop (r) {
  return calculeOffset(r, 'offsetTop')
}
function calculeOffset (element, attr) {
  var offset = 0
  while (element) {
    offset += element[attr]
    element = element.offsetParent
  }
  return offset
}
function get_css_property (elem, prop) {
  if (document.defaultView) {
    return document.defaultView
      .getComputedStyle(elem, null)
      .getPropertyValue(prop)
  } else if (elem.currentStyle) {
    var prop = prop.replace(/-\D/gi, function (sMatch) {
      return sMatch.charAt(sMatch.length - 1).toUpperCase()
    })
    return elem.currentStyle[prop]
  } else return null
}
var _mCE
function start_move_element (e, id, frame) {
  var elem_id = (e.target || e.srcElement).id
  if (id) elem_id = id
  if (!frame) frame = window
  if (frame.event) e = frame.event
  _mCE = frame.document.getElementById(elem_id)
  _mCE.frame = frame
  frame.document.onmousemove = move_element
  frame.document.onmouseup = end_move_element
  mouse_x = getMouseX(e)
  mouse_y = getMouseY(e)
  _mCE.start_pos_x =
    mouse_x - (_mCE.style.left.replace('px', '') || calculeOffsetLeft(_mCE))
  _mCE.start_pos_y =
    mouse_y - (_mCE.style.top.replace('px', '') || calculeOffsetTop(_mCE))
  return false
}
function end_move_element (e) {
  _mCE.frame.document.onmousemove = ''
  _mCE.frame.document.onmouseup = ''
  _mCE = null
}
function move_element (e) {
  var newTop, newLeft, maxLeft
  if (_mCE.frame && _mCE.frame.event) e = _mCE.frame.event
  newTop = getMouseY(e) - _mCE.start_pos_y
  newLeft = getMouseX(e) - _mCE.start_pos_x
  maxLeft = _mCE.frame.document.body.offsetWidth - _mCE.offsetWidth
  max_top = _mCE.frame.document.body.offsetHeight - _mCE.offsetHeight
  newTop = Math.min(Math.max(0, newTop), max_top)
  newLeft = Math.min(Math.max(0, newLeft), maxLeft)
  _mCE.style.top = newTop + 'px'
  _mCE.style.left = newLeft + 'px'
  return false
}
var nav = eAL.nav
function getSelectionRange (textarea) {
  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd
  }
}
function setSelectionRange (t, start, end) {
  t.focus()
  start = Math.max(0, Math.min(t.value.length, start))
  end = Math.max(start, Math.min(t.value.length, end))
  if (this.isOpera && this.isOpera < 9.6) {
    t.selectionEnd = 1
    t.selectionStart = 0
    t.selectionEnd = 1
    t.selectionStart = 0
  }
  t.selectionStart = start
  t.selectionEnd = end
  if (isIE) set_IE_selection(t)
}
function get_IE_selection (t) {
  var d = document,
    div,
    range,
    stored_range,
    elem,
    scrollTop,
    relative_top,
    line_start,
    line_nb,
    range_start,
    range_end,
    tab
  if (t && t.focused) {
    if (!t.ea_line_height) {
      div = d.createElement('div')
      div.style.fontFamily = get_css_property(t, 'font-family')
      div.style.fontSize = get_css_property(t, 'font-size')
      div.style.visibility = 'hidden'
      div.innerHTML = '0'
      d.body.appendChild(div)
      t.ea_line_height = div.offsetHeight
      d.body.removeChild(div)
    }
    range = d.selection.createRange()
    try {
      stored_range = range.duplicate()
      stored_range.moveToElementText(t)
      stored_range.setEndPoint('EndToEnd', range)
      if (stored_range.parentElement() == t) {
        elem = t
        scrollTop = 0
        while (elem.parentNode) {
          scrollTop += elem.scrollTop
          elem = elem.parentNode
        }
        relative_top = range.offsetTop - calculeOffsetTop(t) + scrollTop
        line_start = Math.round(relative_top / t.ea_line_height + 1)
        line_nb = Math.round(range.boundingHeight / t.ea_line_height)
        range_start = stored_range.text.length - range.text.length
        tab = t.value.substr(0, range_start).split('\n')
        range_start += (line_start - tab.length) * 2
        t.selectionStart = range_start
        range_end = t.selectionStart + range.text.length
        tab = t.value.substr(0, range_start + range.text.length).split('\n')
        range_end += (line_start + line_nb - 1 - tab.length) * 2
        t.selectionEnd = range_end
      }
    } catch (e) {}
  }
  setTimeout("get_IE_selection(document.getElementById('" + t.id + "'));", 50)
}
function IE_textarea_focus () {
  event.srcElement.focused = true
}
function IE_textarea_blur () {
  event.srcElement.focused = false
}
function set_IE_selection (t) {
  var nbLineStart, nbLineStart, nbLineEnd, range
  if (!window.closed) {
    nbLineStart = t.value.substr(0, t.selectionStart).split('\n').length - 1
    nbLineEnd = t.value.substr(0, t.selectionEnd).split('\n').length - 1
    try {
      range = document.selection.createRange()
      range.moveToElementText(t)
      range.setEndPoint('EndToStart', range)
      range.moveStart('character', t.selectionStart - nbLineStart)
      range.moveEnd(
        'character',
        t.selectionEnd - nbLineEnd - (t.selectionStart - nbLineStart)
      )
      range.select()
    } catch (e) {}
  }
}
eAL.waiting_loading['elements_functions.js'] = 'loaded'
EAL.prototype.start_resize_area = function () {
  var d = document,
    a,
    div,
    width,
    height,
    father
  d.onmouseup = eAL.end_resize_area
  d.onmousemove = eAL.resize_area
  eAL.toggle(eAL.resize['id'])
  a = eAs[eAL.resize['id']]['textarea']
  div = d.getElementById('edit_area_resize')
  if (!div) {
    div = d.createElement('div')
    div.id = 'edit_area_resize'
    div.style.border = 'dashed #888888 1px'
  }
  width = a.offsetWidth - 2
  height = a.offsetHeight - 2
  div.style.display = 'block'
  div.style.width = width + 'px'
  div.style.height = height + 'px'
  father = a.parentNode
  father.insertBefore(div, a)
  a.style.display = 'none'
  eAL.resize['start_top'] = calculeOffsetTop(div)
  eAL.resize['start_left'] = calculeOffsetLeft(div)
}
EAL.prototype.end_resize_area = function (e) {
  var d = document,
    div,
    a,
    width,
    height
  d.onmouseup = ''
  d.onmousemove = ''
  div = d.getElementById('edit_area_resize')
  a = eAs[eAL.resize['id']]['textarea']
  width = Math.max(
    eAs[eAL.resize['id']]['settings']['min_width'],
    div.offsetWidth - 4
  )
  height = Math.max(
    eAs[eAL.resize['id']]['settings']['min_height'],
    div.offsetHeight - 4
  )
  if (eAL.isIE == 6) {
    width -= 2
    height -= 2
  }
  a.style.width = width + 'px'
  a.style.height = height + 'px'
  div.style.display = 'none'
  a.style.display = 'inline'
  a.selectionStart = eAL.resize['selectionStart']
  a.selectionEnd = eAL.resize['selectionEnd']
  eAL.toggle(eAL.resize['id'])
  return false
}
EAL.prototype.resize_area = function (e) {
  var allow, newHeight, newWidth
  allow = eAs[eAL.resize['id']]['settings']['allow_resize']
  if (allow == 'both' || allow == 'y') {
    newHeight = Math.max(20, getMouseY(e) - eAL.resize['start_top'])
    document.getElementById('edit_area_resize').style.height = newHeight + 'px'
  }
  if (allow == 'both' || allow == 'x') {
    newWidth = Math.max(20, getMouseX(e) - eAL.resize['start_left'])
    document.getElementById('edit_area_resize').style.width = newWidth + 'px'
  }
  return false
}
eAL.waiting_loading['resize_area.js'] = 'loaded'
EAL.prototype.get_regexp = function (text_array) {
  res = '(\\b)('
  for (i = 0; i < text_array.length; i++) {
    if (i > 0) res += '|'
    res += this.get_escaped_regexp(text_array[i])
  }
  res += ')(\\b)'
  reg = new RegExp(res)
  return res
}
EAL.prototype.get_escaped_regexp = function (str) {
  return str
    .toString()
    .replace(/(\.|\?|\*|\+|\\|\(|\)|\[|\]|\}|\{|\$|\^|\|)/g, '\\$1')
}
EAL.prototype.init_syntax_regexp = function () {
  var lang_style = {}
  for (var lang in this.load_syntax) {
    if (!this.syntax[lang]) {
      this.syntax[lang] = {}
      this.syntax[lang]['keywords_reg_exp'] = {}
      this.keywords_reg_exp_nb = 0
      if (this.load_syntax[lang]['KEYWORDS']) {
        param = 'g'
        if (this.load_syntax[lang]['KEYWORD_CASE_SENSITIVE'] === false)
          param += 'i'
        for (var i in this.load_syntax[lang]['KEYWORDS']) {
          if (typeof this.load_syntax[lang]['KEYWORDS'][i] == 'function')
            continue
          this.syntax[lang]['keywords_reg_exp'][i] = new RegExp(
            this.get_regexp(this.load_syntax[lang]['KEYWORDS'][i]),
            param
          )
          this.keywords_reg_exp_nb++
        }
      }
      if (this.load_syntax[lang]['OPERATORS']) {
        var str = ''
        var nb = 0
        for (var i in this.load_syntax[lang]['OPERATORS']) {
          if (typeof this.load_syntax[lang]['OPERATORS'][i] == 'function')
            continue
          if (nb > 0) str += '|'
          str += this.get_escaped_regexp(this.load_syntax[lang]['OPERATORS'][i])
          nb++
        }
        if (str.length > 0)
          this.syntax[lang]['operators_reg_exp'] = new RegExp(
            '(' + str + ')',
            'g'
          )
      }
      if (this.load_syntax[lang]['DELIMITERS']) {
        var str = ''
        var nb = 0
        for (var i in this.load_syntax[lang]['DELIMITERS']) {
          if (typeof this.load_syntax[lang]['DELIMITERS'][i] == 'function')
            continue
          if (nb > 0) str += '|'
          str += this.get_escaped_regexp(
            this.load_syntax[lang]['DELIMITERS'][i]
          )
          nb++
        }
        if (str.length > 0)
          this.syntax[lang]['delimiters_reg_exp'] = new RegExp(
            '(' + str + ')',
            'g'
          )
      }
      var syntax_trace = []
      this.syntax[lang]['quotes'] = {}
      var quote_tab = []
      if (this.load_syntax[lang]['QUOTEMARKS']) {
        for (var i in this.load_syntax[lang]['QUOTEMARKS']) {
          if (typeof this.load_syntax[lang]['QUOTEMARKS'][i] == 'function')
            continue
          var x = this.get_escaped_regexp(
            this.load_syntax[lang]['QUOTEMARKS'][i]
          )
          this.syntax[lang]['quotes'][x] = x
          quote_tab[quote_tab.length] =
            '(' +
            x +
            '(?:[^' +
            x +
            '\\\\]*(\\\\\\\\)*(\\\\' +
            x +
            '?)?)*(' +
            x +
            '|$))'
          syntax_trace.push(x)
        }
      }
      this.syntax[lang]['comments'] = {}
      if (this.load_syntax[lang]['COMMENT_SINGLE']) {
        for (var i in this.load_syntax[lang]['COMMENT_SINGLE']) {
          if (typeof this.load_syntax[lang]['COMMENT_SINGLE'][i] == 'function')
            continue
          var x = this.get_escaped_regexp(
            this.load_syntax[lang]['COMMENT_SINGLE'][i]
          )
          quote_tab[quote_tab.length] = '(' + x + '(.|\\r|\\t)*(\\n|$))'
          syntax_trace.push(x)
          this.syntax[lang]['comments'][x] = '\n'
        }
      }
      if (this.load_syntax[lang]['COMMENT_MULTI']) {
        for (var i in this.load_syntax[lang]['COMMENT_MULTI']) {
          if (typeof this.load_syntax[lang]['COMMENT_MULTI'][i] == 'function')
            continue
          var start = this.get_escaped_regexp(i)
          var end = this.get_escaped_regexp(
            this.load_syntax[lang]['COMMENT_MULTI'][i]
          )
          quote_tab[quote_tab.length] =
            '(' + start + '(.|\\n|\\r)*?(' + end + '|$))'
          syntax_trace.push(start)
          syntax_trace.push(end)
          this.syntax[lang]['comments'][i] = this.load_syntax[lang][
            'COMMENT_MULTI'
          ][i]
        }
      }
      if (quote_tab.length > 0)
        this.syntax[lang]['comment_or_quote_reg_exp'] = new RegExp(
          '(' + quote_tab.join('|') + ')',
          'gi'
        )
      if (syntax_trace.length > 0)
        this.syntax[lang]['syntax_trace_regexp'] = new RegExp(
          '((.|\n)*?)(\\\\*(' + syntax_trace.join('|') + '|$))',
          'gmi'
        )
      if (this.load_syntax[lang]['SCRIPT_DELIMITERS']) {
        this.syntax[lang]['script_delimiters'] = {}
        for (var i in this.load_syntax[lang]['SCRIPT_DELIMITERS']) {
          if (
            typeof this.load_syntax[lang]['SCRIPT_DELIMITERS'][i] == 'function'
          )
            continue
          this.syntax[lang]['script_delimiters'][i] = this.load_syntax[lang][
            'SCRIPT_DELIMITERS'
          ]
        }
      }
      this.syntax[lang]['custom_regexp'] = {}
      if (this.load_syntax[lang]['REGEXPS']) {
        for (var i in this.load_syntax[lang]['REGEXPS']) {
          if (typeof this.load_syntax[lang]['REGEXPS'][i] == 'function')
            continue
          var val = this.load_syntax[lang]['REGEXPS'][i]
          if (!this.syntax[lang]['custom_regexp'][val['execute']])
            this.syntax[lang]['custom_regexp'][val['execute']] = {}
          this.syntax[lang]['custom_regexp'][val['execute']][i] = {
            regexp: new RegExp(val['search'], val['modifiers']),
            class: val['class']
          }
        }
      }
      if (this.load_syntax[lang]['STYLES']) {
        lang_style[lang] = {}
        for (var i in this.load_syntax[lang]['STYLES']) {
          if (typeof this.load_syntax[lang]['STYLES'][i] == 'function') continue
          if (typeof this.load_syntax[lang]['STYLES'][i] != 'string') {
            for (var j in this.load_syntax[lang]['STYLES'][i]) {
              lang_style[lang][j] = this.load_syntax[lang]['STYLES'][i][j]
            }
          } else {
            lang_style[lang][i] = this.load_syntax[lang]['STYLES'][i]
          }
        }
      }
      var style = ''
      for (var i in lang_style[lang]) {
        if (lang_style[lang][i].length > 0) {
          style +=
            '.' +
            lang +
            ' .' +
            i.toLowerCase() +
            ' span{' +
            lang_style[lang][i] +
            '}\n'
          style +=
            '.' +
            lang +
            ' .' +
            i.toLowerCase() +
            '{' +
            lang_style[lang][i] +
            '}\n'
        }
      }
      this.syntax[lang]['styles'] = style
    }
  }
}
eAL.waiting_loading['reg_syntax.js'] = 'loaded'
var editAreaLoader = eAL
var editAreas = eAs
EditAreaLoader = EAL
editAreaLoader.iframe_script = '<script type=\'text/javascript\'> Ãƒ EA(){var t=Ã�;t.error=ÃŒ;t.inlinePopup=[{popup_id:"area_search_replace",icon_id:"search"},{popup_id:"edit_area_help",icon_id:"help"}];t.plugins={};t.line_number=0;Ãˆ.eAL.set_browser_infos(t);if(t.isIE >=8)t.isIE=7;t.Ã‰={};t.last_text_to_highlight="";t.last_hightlighted_text="";t.syntax_list=[];t.allready_used_syntax={};t.check_line_selection_timer=50;t.Ã‚Focused=ÃŒ;t.highlight_selection_line=null;t.previous=[];t.next=[];t.last_undo="";t.files={};t.filesIdAssoc={};t.curr_file=\'\';t.assocBracket={};t.revertAssocBracket={};t.assocBracket["("]=")";t.assocBracket["{"]="}";t.assocBracket["["]="]";for(var index in t.assocBracket){t.revertAssocBracket[t.assocBracket[index]]=index;}t.is_editable=Ã‹;t.lineHeight=16;t.tab_nb_char=8;if(t.isOpera)t.tab_nb_char=6;t.is_tabbing=ÃŒ;t.fullscreen={\'isFull\':ÃŒ};t.isResizing=ÃŒ;t.id=area_id;t.Ã…=eAs[t.id]["Ã…"];if((""+t.Ã…[\'replace_tab_by_spaces\']).match(/^[0-9]+$/)){t.tab_nb_char=t.Ã…[\'replace_tab_by_spaces\'];t.tabulation="";for(var i=0;i<t.tab_nb_char;i++)t.tabulation+=" ";}\nelse{t.tabulation="\t";}if(t.Ã…["syntax_selection_allow"]&&t.Ã…["syntax_selection_allow"].Ã†>0)t.syntax_list=t.Ã…["syntax_selection_allow"].replace(/ /g,"").split(",");if(t.Ã…[\'syntax\'])t.allready_used_syntax[t.Ã…[\'syntax\']]=Ã‹;};EA.Ã„.init=Ãƒ(){var t=Ã�,a,s=t.Ã…;t.Ã‚=_$("Ã‚");t.container=_$("container");t.result=_$("result");t.content_highlight=_$("content_highlight");t.selection_field=_$("selection_field");t.selection_field_text=_$("selection_field_text");t.processing_screen=_$("processing");t.editor_area=_$("editor");t.tab_browsing_area=_$("tab_browsing_area");t.test_font_size=_$("test_font_size");a=t.Ã‚;if(!s[\'is_editable\'])t.set_editable(ÃŒ);t.set_show_line_colors(s[\'show_line_colors\']);if(syntax_selec=_$("syntax_selection")){for(var i=0;i<t.syntax_list.Ã†;i++){var syntax=t.syntax_list[i];var option=document.createElement("option");option.ÃŠ=syntax;if(syntax==s[\'syntax\'])option.selected="selected";option.innerHTML=t.get_translation("syntax_"+syntax,"word");syntax_selec.appendChild(option);}}spans=Ãˆ.getChildren(_$("toolbar_1"),"span","","","all",-1);for(var i=0;i<spans.Ã†;i++){id=spans[i].id.replace(/tmp_tool_(.*)/,"$1");if(id!=spans[i].id){for(var j in t.plugins){if(typeof(t.plugins[j].get_control_html)=="Ãƒ"){html=t.plugins[j].get_control_html(id);if(html!=ÃŒ){html=t.get_translation(html,"template");var new_span=document.createElement("span");new_span.innerHTML=html;var father=spans[i].ÃˆNode;spans[i].ÃˆNode.replaceChild(new_span,spans[i]);break;}}}}}a.ÃŠ=\'a\';if(s["debug"]){t.debug=Ãˆ.document.getElementById("edit_area_debug_"+t.id);}if(_$("redo")!=null)t.switchClassSticky(_$("redo"),\'editAreaButtonDisabled\',Ã‹);if(typeof(Ãˆ.eAL.syntax[s["syntax"]])!="undefined"){for(var i in Ãˆ.eAL.syntax){if(typeof(Ãˆ.eAL.syntax[i]["Ã‡s"])!="undefined"){t.add_Ã‡(Ãˆ.eAL.syntax[i]["Ã‡s"]);}}}if(t.isOpera)_$("editor").onkeypress=keyDown;\nelse _$("editor").onkeydown=keyDown;for(var i=0;i<t.inlinePopup.Ã†;i++){if(t.isIE||t.isFirefox)_$(t.inlinePopup[i]["popup_id"]).onkeydown=keyDown;\nelse _$(t.inlinePopup[i]["popup_id"]).onkeypress=keyDown;}if(s["allow_resize"]=="both"||s["allow_resize"]=="x"||s["allow_resize"]=="y")t.allow_resize(Ã‹);Ãˆ.eAL.toggle(t.id,"on");t.change_smooth_selection_mode(eA.smooth_selection);t.execCommand("change_highlight",s["start_highlight"]);t.set_font(eA.Ã…["font_family"],eA.Ã…["font_size"]);children=Ãˆ.getChildren(document.body,"","selec","none","all",-1);for(var i=0;i<children.Ã†;i++){if(t.isIE)children[i].unselectable=Ã‹;\nelse children[i].onmousedown=Ãƒ(){return ÃŒ};}a.spellcheck=s["gecko_spellcheck"];if(t.isFirefox >=\'3\'){t.content_highlight.Ã‡.paddingLeft="1px";t.selection_field.Ã‡.paddingLeft="1px";t.selection_field_text.Ã‡.paddingLeft="1px";}if(t.isIE&&t.isIE < 8){a.Ã‡.marginTop="-1px";}if(t.isSafari){t.editor_area.Ã‡.position="absolute";if(t.isSafari < 5)a.Ã‡.marginLeft="-3px";if(t.isSafari < 4)a.Ã‡.marginTop="1px";}if(t.isChrome){t.editor_area.Ã‡.position="absolute";a.Ã‡.marginLeft="0px";a.Ã‡.marginTop="0px";}Ãˆ.eAL.add_event(t.result,"click",Ãƒ(e){if((e.target||e.srcElement)==eA.result){eA.area_select(eA.Ã‚.ÃŠ.Ã†,0);}});if(s[\'is_multi_files\']!=ÃŒ)t.open_file({\'id\':t.curr_file,\'text\':\'\'});t.set_word_wrap(s[\'word_wrap\']);setTimeout("eA.focus();eA.manage_size();eA.execCommand(\'EA_load\');",10);t.check_undo();t.check_line_selection(Ã‹);t.scroll_to_view();for(var i in t.plugins){if(typeof(t.plugins[i].onload)=="Ãƒ")t.plugins[i].onload();}if(s[\'fullscreen\']==Ã‹)t.toggle_full_screen(Ã‹);Ãˆ.eAL.add_event(window,"resize",eA.update_size);Ãˆ.eAL.add_event(Ãˆ.window,"resize",eA.update_size);Ãˆ.eAL.add_event(top.window,"resize",eA.update_size);Ãˆ.eAL.add_event(window,"unload",Ãƒ(){Ãˆ.eAL.remove_event(Ãˆ.window,"resize",eA.update_size);Ãˆ.eAL.remove_event(top.window,"resize",eA.update_size);if(eAs[eA.id]&&eAs[eA.id]["displayed"]){eA.execCommand("EA_unload");}});};EA.Ã„.update_size=Ãƒ(){var d=document,pd=Ãˆ.document,height,width,popup,maxLeft,maxTop;if(typeof eAs !=\'undefined\'&&eAs[eA.id]&&eAs[eA.id]["displayed"]==Ã‹){if(eA.fullscreen[\'isFull\']){pd.getElementById("frame_"+eA.id).Ã‡.width=pd.getElementsByTagName("html")[0].clientWidth+"px";pd.getElementById("frame_"+eA.id).Ã‡.height=pd.getElementsByTagName("html")[0].clientHeight+"px";}if(eA.tab_browsing_area.Ã‡.display==\'block\'&&(!eA.isIE||eA.isIE >=8)){eA.tab_browsing_area.Ã‡.height="0px";eA.tab_browsing_area.Ã‡.height=(eA.result.offsetTop-eA.tab_browsing_area.offsetTop-1)+"px";}height=d.body.offsetHeight-eA.get_all_toolbar_height()-4;eA.result.Ã‡.height=height+"px";width=d.body.offsetWidth-2;eA.result.Ã‡.width=width+"px";for(i=0;i < eA.inlinePopup.Ã†;i++){popup=_$(eA.inlinePopup[i]["popup_id"]);maxLeft=d.body.offsetWidth-popup.offsetWidth;maxTop=d.body.offsetHeight-popup.offsetHeight;if(popup.offsetTop > maxTop)popup.Ã‡.top=maxTop+"px";if(popup.offsetLeft > maxLeft)popup.Ã‡.left=maxLeft+"px";}eA.manage_size(Ã‹);eA.fixLinesHeight(0,-1);}};EA.Ã„.manage_size=Ãƒ(onlyOneTime){if(!eAs[Ã�.id])return ÃŒ;if(eAs[Ã�.id]["displayed"]==Ã‹&&Ã�.Ã‚Focused){var area_height,resized=ÃŒ;if(!Ã�.Ã…[\'word_wrap\']){var area_width=Ã�.Ã‚.scrollWidth;area_height=Ã�.Ã‚.scrollHeight;if(Ã�.isOpera&&Ã�.isOpera < 9.6){area_width=10000;}if(Ã�.Ã‚.previous_scrollWidth!=area_width){Ã�.container.Ã‡.width=area_width+"px";Ã�.Ã‚.Ã‡.width=area_width+"px";Ã�.content_highlight.Ã‡.width=area_width+"px";Ã�.Ã‚.previous_scrollWidth=area_width;resized=Ã‹;}}if(Ã�.Ã…[\'word_wrap\']){newW=Ã�.Ã‚.offsetWidth;if(Ã�.isFirefox||Ã�.isIE)newW-=2;if(Ã�.isSafari)newW-=3;Ã�.content_highlight.Ã‡.width=Ã�.selection_field_text.Ã‡.width=Ã�.selection_field.Ã‡.width=Ã�.test_font_size.Ã‡.width=newW+"px";}if(Ã�.isOpera||Ã�.isFirefox||Ã�.isSafari){area_height=Ã�.getLinePosTop(Ã�.Ã‰["nb_line"]+1);}\nelse{area_height=Ã�.Ã‚.scrollHeight;}if(Ã�.Ã‚.previous_scrollHeight!=area_height){Ã�.container.Ã‡.height=(area_height+2)+"px";Ã�.Ã‚.Ã‡.height=area_height+"px";Ã�.content_highlight.Ã‡.height=area_height+"px";Ã�.Ã‚.previous_scrollHeight=area_height;resized=Ã‹;}if(Ã�.Ã‰["nb_line"] >=Ã�.line_number){var newLines=\'\',destDiv=_$("line_number"),start=Ã�.line_number,end=Ã�.Ã‰["nb_line"]+100;for(i=start+1;i < end;i++){newLines+=\'<div id="line_\'+i+\'">\'+i+"</div>";Ã�.line_number++;}destDiv.innerHTML=destDiv.innerHTML+newLines;Ã�.fixLinesHeight(start,-1);}Ã�.Ã‚.scrollTop="0px";Ã�.Ã‚.scrollLeft="0px";if(resized==Ã‹){Ã�.scroll_to_view();}}if(!onlyOneTime)setTimeout("eA.manage_size();",100);};EA.Ã„.execCommand=Ãƒ(cmd,param){for(var i in Ã�.plugins){if(typeof(Ã�.plugins[i].execCommand)=="Ãƒ"){if(!Ã�.plugins[i].execCommand(cmd,param))return;}}switch(cmd){case "save":if(Ã�.Ã…["save_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["save_callback"]+"(\'"+Ã�.id+"\',eA.Ã‚.ÃŠ);");break;case "load":if(Ã�.Ã…["load_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["load_callback"]+"(\'"+Ã�.id+"\');");break;case "onchange":if(Ã�.Ã…["change_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["change_callback"]+"(\'"+Ã�.id+"\');");break;case "EA_load":if(Ã�.Ã…["EA_load_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_load_callback"]+"(\'"+Ã�.id+"\');");break;case "EA_unload":if(Ã�.Ã…["EA_unload_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_unload_callback"]+"(\'"+Ã�.id+"\');");break;case "toggle_on":if(Ã�.Ã…["EA_toggle_on_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_toggle_on_callback"]+"(\'"+Ã�.id+"\');");break;case "toggle_off":if(Ã�.Ã…["EA_toggle_off_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_toggle_off_callback"]+"(\'"+Ã�.id+"\');");break;case "re_sync":if(!Ã�.do_highlight)break;case "file_switch_on":if(Ã�.Ã…["EA_file_switch_on_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_file_switch_on_callback"]+"(param);");break;case "file_switch_off":if(Ã�.Ã…["EA_file_switch_off_callback"].Ã†>0)eval("Ãˆ."+Ã�.Ã…["EA_file_switch_off_callback"]+"(param);");break;case "file_close":if(Ã�.Ã…["EA_file_close_callback"].Ã†>0)return eval("Ãˆ."+Ã�.Ã…["EA_file_close_callback"]+"(param);");break;default:if(typeof(eval("eA."+cmd))=="Ãƒ"){if(Ã�.Ã…["debug"])eval("eA."+cmd+"(param);");\nelse try{eval("eA."+cmd+"(param);");}catch(e){};}}};EA.Ã„.get_translation=Ãƒ(word,mode){if(mode=="template")return Ãˆ.eAL.translate(word,Ã�.Ã…["language"],mode);\nelse return Ãˆ.eAL.get_word_translation(word,Ã�.Ã…["language"]);};EA.Ã„.add_plugin=Ãƒ(plug_name,plug_obj){for(var i=0;i<Ã�.Ã…["plugins"].Ã†;i++){if(Ã�.Ã…["plugins"][i]==plug_name){Ã�.plugins[plug_name]=plug_obj;plug_obj.baseURL=Ãˆ.eAL.baseURL+"plugins/"+plug_name+"/";if(typeof(plug_obj.init)=="Ãƒ")plug_obj.init();}}};EA.Ã„.load_css=Ãƒ(url){try{link=document.createElement("link");link.type="text/css";link.rel="Ã‡sheet";link.media="all";link.href=url;head=document.getElementsByTagName("head");head[0].appendChild(link);}catch(e){document.write("<link href=\'"+url+"\' rel=\'Ã‡sheet\' type=\'text/css\' />");}};EA.Ã„.load_script=Ãƒ(url){try{script=document.createElement("script");script.type="text/javascript";script.src=url;script.charset="UTF-8";head=document.getElementsByTagName("head");head[0].appendChild(script);}catch(e){document.write("<script type=\'text/javascript\' src=\'"+url+"\' charset=\\"UTF-8\\"><"+"/script>");}};EA.Ã„.add_lang=Ãƒ(language,ÃŠs){if(!Ãˆ.eAL.lang[language])Ãˆ.eAL.lang[language]={};for(var i in ÃŠs)Ãˆ.eAL.lang[language][i]=ÃŠs[i];};Ãƒ _$(id){return document.getElementById(id);};var eA=new EA();Ãˆ.eAL.add_event(window,"load",init);Ãƒ init(){setTimeout("eA.init();",10);};	EA.Ã„.focus=Ãƒ(){Ã�.Ã‚.focus();Ã�.Ã‚Focused=Ã‹;};EA.Ã„.check_line_selection=Ãƒ(timer_checkup){var changes,infos,new_top,new_width,i;var t1=t2=t2_1=t3=tend=new Date().getTime();if(!eAs[Ã�.id])return ÃŒ;if(!Ã�.smooth_selection&&!Ã�.do_highlight){}\nelse if(Ã�.Ã‚Focused&&eAs[Ã�.id]["displayed"]==Ã‹&&Ã�.isResizing==ÃŒ){infos=Ã�.get_selection_infos();changes=Ã�.checkTextEvolution(typeof(Ã�.Ã‰[\'full_text\'])==\'undefined\' ? \'\':Ã�.Ã‰[\'full_text\'],infos[\'full_text\']);t2=new Date().getTime();if(Ã�.Ã‰["line_start"] !=infos["line_start"]||Ã�.Ã‰["line_nb"] !=infos["line_nb"]||infos["full_text"] !=Ã�.Ã‰["full_text"]||Ã�.reload_highlight||Ã�.Ã‰["selectionStart"] !=infos["selectionStart"]||Ã�.Ã‰["selectionEnd"] !=infos["selectionEnd"]||!timer_checkup){new_top=Ã�.getLinePosTop(infos["line_start"]);new_width=Math.max(Ã�.Ã‚.scrollWidth,Ã�.container.clientWidth-50);Ã�.selection_field.Ã‡.top=Ã�.selection_field_text.Ã‡.top=new_top+"px";if(!Ã�.Ã…[\'word_wrap\']){Ã�.selection_field.Ã‡.width=Ã�.selection_field_text.Ã‡.width=Ã�.test_font_size.Ã‡.width=new_width+"px";}if(Ã�.do_highlight==Ã‹){var curr_text=infos["full_text"].split("\\n");var content="";var start=Math.max(0,infos["line_start"]-1);var end=Math.min(curr_text.Ã†,infos["line_start"]+infos["line_nb"]-1);for(i=start;i< end;i++){content+=curr_text[i]+"\\n";}selLength=infos[\'selectionEnd\']-infos[\'selectionStart\'];content=content.substr(0,infos["curr_pos"]-1)+"\\r\\r"+content.substr(infos["curr_pos"]-1,selLength)+"\\r\\r"+content.substr(infos["curr_pos"]-1+selLength);content=\'<span>\'+content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace("\\r\\r",\'</span><strong>\').replace("\\r\\r",\'</strong><span>\')+\'</span>\';if(Ã�.isIE||(Ã�.isOpera&&Ã�.isOpera < 9.6)){Ã�.selection_field.innerHTML="<pre>"+content.replace(/^\\r?\\n/,"<br>")+"</pre>";}\nelse{Ã�.selection_field.innerHTML=content;}Ã�.selection_field_text.innerHTML=Ã�.selection_field.innerHTML;t2_1=new Date().getTime();if(Ã�.reload_highlight||(infos["full_text"] !=Ã�.last_text_to_highlight&&(Ã�.Ã‰["line_start"]!=infos["line_start"]||Ã�.show_line_colors||Ã�.Ã‰["line_nb"]!=infos["line_nb"]||Ã�.Ã‰["nb_line"]!=infos["nb_line"]))){Ã�.maj_highlight(infos);}}}t3=new Date().getTime();if(Ã�.Ã…[\'word_wrap\']&&infos["full_text"] !=Ã�.Ã‰["full_text"]){Ã�.fixLinesHeight(changes.lineStart,-1);}if(infos["line_start"] !=Ã�.Ã‰["line_start"]||infos["curr_pos"] !=Ã�.Ã‰["curr_pos"]||infos["full_text"].Ã†!=Ã�.Ã‰["full_text"].Ã†||Ã�.reload_highlight||!timer_checkup){var selec_char=infos["curr_line"].charAt(infos["curr_pos"]-1);var no_real_move=Ã‹;if(infos["line_nb"]==1&&(Ã�.assocBracket[selec_char]||Ã�.revertAssocBracket[selec_char])){no_real_move=ÃŒ;if(Ã�.findEndBracket(infos,selec_char)===Ã‹){_$("end_bracket").Ã‡.visibility="visible";_$("cursor_pos").Ã‡.visibility="visible";_$("cursor_pos").innerHTML=selec_char;_$("end_bracket").innerHTML=(Ã�.assocBracket[selec_char]||Ã�.revertAssocBracket[selec_char]);}\nelse{_$("end_bracket").Ã‡.visibility="hidden";_$("cursor_pos").Ã‡.visibility="hidden";}}\nelse{_$("cursor_pos").Ã‡.visibility="hidden";_$("end_bracket").Ã‡.visibility="hidden";}Ã�.displayToCursorPosition("cursor_pos",infos["line_start"],infos["curr_pos"]-1,infos["curr_line"],no_real_move);if(infos["line_nb"]==1&&infos["line_start"]!=Ã�.Ã‰["line_start"])Ã�.scroll_to_view();}Ã�.Ã‰=infos;}tend=new Date().getTime();if(timer_checkup){setTimeout("eA.check_line_selection(Ã‹)",Ã�.check_line_selection_timer);}};EA.Ã„.get_selection_infos=Ãƒ(){var sel={},start,end;if(Ã�.isIE)Ã�.getIESelection();start=Ã�.Ã‚.selectionStart;end=Ã�.Ã‚.selectionEnd;if(Ã�.Ã‰["selectionStart"]==start&&Ã�.Ã‰["selectionEnd"]==end&&Ã�.Ã‰["full_text"]==Ã�.Ã‚.ÃŠ)return Ã�.Ã‰;if(Ã�.tabulation!="\t"&&Ã�.Ã‚.ÃŠ.indexOf("\t")!=-1){var len=Ã�.Ã‚.ÃŠ.Ã†;Ã�.Ã‚.ÃŠ=Ã�.replace_tab(Ã�.Ã‚.ÃŠ);start=end=start+(Ã�.Ã‚.ÃŠ.Ã†-len);Ã�.area_select(start,0);}sel["selectionStart"]=start;sel["selectionEnd"]=end;sel["full_text"]=Ã�.Ã‚.ÃŠ;sel["line_start"]=1;sel["line_nb"]=1;sel["curr_pos"]=0;sel["curr_line"]="";sel["indexOfCursor"]=0;sel["selec_direction"]=Ã�.Ã‰["selec_direction"];var splitTab=sel["full_text"].split("\\n");var nbLine=Math.max(0,splitTab.Ã†);var nbChar=Math.max(0,sel["full_text"].Ã†-(nbLine-1));if(sel["full_text"].indexOf("\\r")!=-1)nbChar=nbChar-(nbLine-1);sel["nb_line"]=nbLine;sel["nb_char"]=nbChar;if(start>0){var str=sel["full_text"].substr(0,start);sel["curr_pos"]=start-str.lastIndexOf("\\n");sel["line_start"]=Math.max(1,str.split("\\n").Ã†);}\nelse{sel["curr_pos"]=1;}if(end>start){sel["line_nb"]=sel["full_text"].substring(start,end).split("\\n").Ã†;}sel["indexOfCursor"]=start;sel["curr_line"]=splitTab[Math.max(0,sel["line_start"]-1)];if(sel["selectionStart"]==Ã�.Ã‰["selectionStart"]){if(sel["selectionEnd"]>Ã�.Ã‰["selectionEnd"])sel["selec_direction"]="down";\nelse if(sel["selectionEnd"]==Ã�.Ã‰["selectionStart"])sel["selec_direction"]=Ã�.Ã‰["selec_direction"];}\nelse if(sel["selectionStart"]==Ã�.Ã‰["selectionEnd"]&&sel["selectionEnd"]>Ã�.Ã‰["selectionEnd"]){sel["selec_direction"]="down";}\nelse{sel["selec_direction"]="up";}_$("nbLine").innerHTML=nbLine;_$("nbChar").innerHTML=nbChar;_$("linePos").innerHTML=sel["line_start"];_$("currPos").innerHTML=sel["curr_pos"];return sel;};EA.Ã„.getIESelection=Ãƒ(){var selectionStart,selectionEnd,range,stored_range;if(Ã�.Ã…[\'word_wrap\'])Ã�.Ã‚.wrap=\'off\';try{range=document.selection.createRange();stored_range=range.duplicate();stored_range.moveToElementText(Ã�.Ã‚);stored_range.setEndPoint(\'EndToEnd\',range);if(stored_range.ÃˆElement()!=Ã�.Ã‚)throw "invalid focus";var scrollTop=Ã�.result.scrollTop+document.body.scrollTop;var relative_top=range.offsetTop-Ãˆ.calculeOffsetTop(Ã�.Ã‚)+scrollTop;var line_start=Math.round((relative_top / Ã�.lineHeight)+1);var line_nb=Math.round(range.boundingHeight / Ã�.lineHeight);selectionStart=stored_range.text.Ã†-range.text.Ã†;selectionStart+=(line_start-Ã�.Ã‚.ÃŠ.substr(0,selectionStart).split("\\n").Ã†)*2;selectionStart-=(line_start-Ã�.Ã‚.ÃŠ.substr(0,selectionStart).split("\\n").Ã†)* 2;selectionEnd=selectionStart+range.text.Ã†;selectionEnd+=(line_start+line_nb-1-Ã�.Ã‚.ÃŠ.substr(0,selectionStart+range.text.Ã†).split("\\n").Ã†)*2;Ã�.Ã‚.selectionStart=selectionStart;Ã�.Ã‚.selectionEnd=selectionEnd;}catch(e){}if(Ã�.Ã…[\'word_wrap\'])Ã�.Ã‚.wrap=\'soft\';};EA.Ã„.setIESelection=Ãƒ(){var nbLineStart=Ã�.Ã‚.ÃŠ.substr(0,Ã�.Ã‚.selectionStart).split("\\n").Ã†-1;var nbLineEnd=Ã�.Ã‚.ÃŠ.substr(0,Ã�.Ã‚.selectionEnd).split("\\n").Ã†-1;var range=document.selection.createRange();range.moveToElementText(Ã�.Ã‚);range.setEndPoint(\'EndToStart\',range);range.moveStart(\'character\',Ã�.Ã‚.selectionStart-nbLineStart);range.moveEnd(\'character\',Ã�.Ã‚.selectionEnd-nbLineEnd-(Ã�.Ã‚.selectionStart-nbLineStart));range.select();};EA.Ã„.checkTextEvolution=Ãƒ(lastText,newText){var ch={},baseStep=200,cpt=0,end,step,tStart=new Date().getTime();end=Math.min(newText.Ã†,lastText.Ã†);step=baseStep;while(cpt<end&&step>=1){if(lastText.substr(cpt,step)==newText.substr(cpt,step)){cpt+=step;}\nelse{step=Math.floor(step/2);}}ch.posStart=cpt;ch.lineStart=newText.substr(0,ch.posStart).split("\\n").Ã†-1;cpt_last=lastText.Ã†;cpt=newText.Ã†;step=baseStep;while(cpt>=0&&cpt_last>=0&&step>=1){if(lastText.substr(cpt_last-step,step)==newText.substr(cpt-step,step)){cpt-=step;cpt_last-=step;}\nelse{step=Math.floor(step/2);}}ch.posNewEnd=cpt;ch.posLastEnd=cpt_last;if(ch.posNewEnd<=ch.posStart){if(lastText.Ã† < newText.Ã†){ch.posNewEnd=ch.posStart+newText.Ã†-lastText.Ã†;ch.posLastEnd=ch.posStart;}\nelse{ch.posLastEnd=ch.posStart+lastText.Ã†-newText.Ã†;ch.posNewEnd=ch.posStart;}}ch.newText=newText.substring(ch.posStart,ch.posNewEnd);ch.lastText=lastText.substring(ch.posStart,ch.posLastEnd);ch.lineNewEnd=newText.substr(0,ch.posNewEnd).split("\\n").Ã†-1;ch.lineLastEnd=lastText.substr(0,ch.posLastEnd).split("\\n").Ã†-1;ch.newTextLine=newText.split("\\n").slice(ch.lineStart,ch.lineNewEnd+1).join("\\n");ch.lastTextLine=lastText.split("\\n").slice(ch.lineStart,ch.lineLastEnd+1).join("\\n");return ch;};EA.Ã„.tab_selection=Ãƒ(){if(Ã�.is_tabbing)return;Ã�.is_tabbing=Ã‹;if(Ã�.isIE)Ã�.getIESelection();var start=Ã�.Ã‚.selectionStart;var end=Ã�.Ã‚.selectionEnd;var insText=Ã�.Ã‚.ÃŠ.substring(start,end);var pos_start=start;var pos_end=end;if(insText.Ã†==0){Ã�.Ã‚.ÃŠ=Ã�.Ã‚.ÃŠ.substr(0,start)+Ã�.tabulation+Ã�.Ã‚.ÃŠ.substr(end);pos_start=start+Ã�.tabulation.Ã†;pos_end=pos_start;}\nelse{start=Math.max(0,Ã�.Ã‚.ÃŠ.substr(0,start).lastIndexOf("\\n")+1);endText=Ã�.Ã‚.ÃŠ.substr(end);startText=Ã�.Ã‚.ÃŠ.substr(0,start);tmp=Ã�.Ã‚.ÃŠ.substring(start,end).split("\\n");insText=Ã�.tabulation+tmp.join("\\n"+Ã�.tabulation);Ã�.Ã‚.ÃŠ=startText+insText+endText;pos_start=start;pos_end=Ã�.Ã‚.ÃŠ.indexOf("\\n",startText.Ã†+insText.Ã†);if(pos_end==-1)pos_end=Ã�.Ã‚.ÃŠ.Ã†;}Ã�.Ã‚.selectionStart=pos_start;Ã�.Ã‚.selectionEnd=pos_end;if(Ã�.isIE){Ã�.setIESelection();setTimeout("eA.is_tabbing=ÃŒ;",100);}\nelse Ã�.is_tabbing=ÃŒ;};EA.Ã„.invert_tab_selection=Ãƒ(){var t=Ã�,a=Ã�.Ã‚;if(t.is_tabbing)return;t.is_tabbing=Ã‹;if(t.isIE)t.getIESelection();var start=a.selectionStart;var end=a.selectionEnd;var insText=a.ÃŠ.substring(start,end);var pos_start=start;var pos_end=end;if(insText.Ã†==0){if(a.ÃŠ.substring(start-t.tabulation.Ã†,start)==t.tabulation){a.ÃŠ=a.ÃŠ.substr(0,start-t.tabulation.Ã†)+a.ÃŠ.substr(end);pos_start=Math.max(0,start-t.tabulation.Ã†);pos_end=pos_start;}}\nelse{start=a.ÃŠ.substr(0,start).lastIndexOf("\\n")+1;endText=a.ÃŠ.substr(end);startText=a.ÃŠ.substr(0,start);tmp=a.ÃŠ.substring(start,end).split("\\n");insText="";for(i=0;i<tmp.Ã†;i++){for(j=0;j<t.tab_nb_char;j++){if(tmp[i].charAt(0)=="\t"){tmp[i]=tmp[i].substr(1);j=t.tab_nb_char;}\nelse if(tmp[i].charAt(0)==" ")tmp[i]=tmp[i].substr(1);}insText+=tmp[i];if(i<tmp.Ã†-1)insText+="\\n";}a.ÃŠ=startText+insText+endText;pos_start=start;pos_end=a.ÃŠ.indexOf("\\n",startText.Ã†+insText.Ã†);if(pos_end==-1)pos_end=a.ÃŠ.Ã†;}a.selectionStart=pos_start;a.selectionEnd=pos_end;if(t.isIE){t.setIESelection();setTimeout("eA.is_tabbing=ÃŒ;",100);}\nelse t.is_tabbing=ÃŒ;};EA.Ã„.press_enter=Ãƒ(){if(!Ã�.smooth_selection)return ÃŒ;if(Ã�.isIE)Ã�.getIESelection();var scrollTop=Ã�.result.scrollTop;var scrollLeft=Ã�.result.scrollLeft;var start=Ã�.Ã‚.selectionStart;var end=Ã�.Ã‚.selectionEnd;var start_last_line=Math.max(0,Ã�.Ã‚.ÃŠ.substring(0,start).lastIndexOf("\\n")+1);var begin_line=Ã�.Ã‚.ÃŠ.substring(start_last_line,start).replace(/^([ \t]*).*/gm,"$1");var lineStart=Ã�.Ã‚.ÃŠ.substring(0,start).split("\\n").Ã†;if(begin_line=="\\n"||begin_line=="\\r"||begin_line.Ã†==0){return ÃŒ;}if(Ã�.isIE||(Ã�.isOpera&&Ã�.isOpera < 9.6)){begin_line="\\r\\n"+begin_line;}\nelse{begin_line="\\n"+begin_line;}Ã�.Ã‚.ÃŠ=Ã�.Ã‚.ÃŠ.substring(0,start)+begin_line+Ã�.Ã‚.ÃŠ.substring(end);Ã�.area_select(start+begin_line.Ã†,0);if(Ã�.isIE){Ã�.result.scrollTop=scrollTop;Ã�.result.scrollLeft=scrollLeft;}return Ã‹;};EA.Ã„.findEndBracket=Ãƒ(infos,bracket){var start=infos["indexOfCursor"];var normal_order=Ã‹;if(Ã�.assocBracket[bracket])endBracket=Ã�.assocBracket[bracket];\nelse if(Ã�.revertAssocBracket[bracket]){endBracket=Ã�.revertAssocBracket[bracket];normal_order=ÃŒ;}var end=-1;var nbBracketOpen=0;for(var i=start;i<infos["full_text"].Ã†&&i>=0;){if(infos["full_text"].charAt(i)==endBracket){nbBracketOpen--;if(nbBracketOpen<=0){end=i;break;}}\nelse if(infos["full_text"].charAt(i)==bracket)nbBracketOpen++;if(normal_order)i++;\nelse i--;}if(end==-1)return ÃŒ;var endLastLine=infos["full_text"].substr(0,end).lastIndexOf("\\n");if(endLastLine==-1)line=1;\nelse line=infos["full_text"].substr(0,endLastLine).split("\\n").Ã†+1;var curPos=end-endLastLine-1;var endLineLength=infos["full_text"].substring(end).split("\\n")[0].Ã†;Ã�.displayToCursorPosition("end_bracket",line,curPos,infos["full_text"].substring(endLastLine+1,end+endLineLength));return Ã‹;};EA.Ã„.displayToCursorPosition=Ãƒ(id,start_line,cur_pos,lineContent,no_real_move){var elem,dest,content,posLeft=0,posTop,fixPadding,topOffset,endElem;elem=Ã�.test_font_size;dest=_$(id);content="<span id=\'test_font_size_inner\'>"+lineContent.substr(0,cur_pos).replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</span><span id=\'endTestFont\'>"+lineContent.substr(cur_pos).replace(/&/g,"&amp;").replace(/</g,"&lt;")+"</span>";if(Ã�.isIE||(Ã�.isOpera&&Ã�.isOpera < 9.6)){elem.innerHTML="<pre>"+content.replace(/^\\r?\\n/,"<br>")+"</pre>";}\nelse{elem.innerHTML=content;}endElem=_$(\'endTestFont\');topOffset=endElem.offsetTop;fixPadding=parseInt(Ã�.content_highlight.Ã‡.paddingLeft.replace("px",""));posLeft=45+endElem.offsetLeft+(!isNaN(fixPadding)&&topOffset > 0 ? fixPadding:0);posTop=Ã�.getLinePosTop(start_line)+topOffset;if(Ã�.isIE&&cur_pos > 0&&endElem.offsetLeft==0){posTop+=Ã�.lineHeight;}if(no_real_move!=Ã‹){dest.Ã‡.top=posTop+"px";dest.Ã‡.left=posLeft+"px";}dest.cursor_top=posTop;dest.cursor_left=posLeft;};EA.Ã„.getLinePosTop=Ãƒ(start_line){var elem=_$(\'line_\'+start_line),posTop=0;if(elem)posTop=elem.offsetTop;\nelse posTop=Ã�.lineHeight *(start_line-1);return posTop;};EA.Ã„.getTextHeight=Ãƒ(text){var t=Ã�,elem,height;elem=t.test_font_size;content=text.replace(/&/g,"&amp;").replace(/</g,"&lt;");if(t.isIE||(Ã�.isOpera&&Ã�.isOpera < 9.6)){elem.innerHTML="<pre>"+content.replace(/^\\r?\\n/,"<br>")+"</pre>";}\nelse{elem.innerHTML=content;}height=elem.offsetHeight;height=Math.max(1,Math.floor(elem.offsetHeight / Ã�.lineHeight))* Ã�.lineHeight;return height;};EA.Ã„.fixLinesHeight=Ãƒ(lineStart,lineEnd){var aText=Ã�.Ã‚.ÃŠ.split("\\n");if(lineEnd==-1)lineEnd=aText.Ã†-1;for(var i=Math.max(0,lineStart);i <=lineEnd;i++){if(elem=_$(\'line_\'+(i+1))){elem.Ã‡.height=typeof(aText[i])!="undefined" ? Ã�.getTextHeight(aText[i])+"px":Ã�.lineHeight;}}};EA.Ã„.area_select=Ãƒ(start,Ã†){Ã�.Ã‚.focus();start=Math.max(0,Math.min(Ã�.Ã‚.ÃŠ.Ã†,start));end=Math.max(start,Math.min(Ã�.Ã‚.ÃŠ.Ã†,start+Ã†));if(Ã�.isIE){Ã�.Ã‚.selectionStart=start;Ã�.Ã‚.selectionEnd=end;Ã�.setIESelection();}\nelse{if(Ã�.isOpera&&Ã�.isOpera < 9.6){Ã�.Ã‚.setSelectionRange(0,0);}Ã�.Ã‚.setSelectionRange(start,end);}Ã�.check_line_selection();};EA.Ã„.area_get_selection=Ãƒ(){var text="";if(document.selection){var range=document.selection.createRange();text=range.text;}\nelse{text=Ã�.Ã‚.ÃŠ.substring(Ã�.Ã‚.selectionStart,Ã�.Ã‚.selectionEnd);}return text;}; EA.Ã„.replace_tab=Ãƒ(text){return text.replace(/((\\n?)([^\t\\n]*)\t)/gi,eA.smartTab);};EA.Ã„.smartTab=Ãƒ(){val="                   ";return EA.Ã„.smartTab.arguments[2]+EA.Ã„.smartTab.arguments[3]+val.substr(0,eA.tab_nb_char-(EA.Ã„.smartTab.arguments[3].Ã†)%eA.tab_nb_char);};EA.Ã„.show_waiting_screen=Ãƒ(){width=Ã�.editor_area.offsetWidth;height=Ã�.editor_area.offsetHeight;if(!(Ã�.isIE&&Ã�.isIE<6)){width-=2;height-=2;}Ã�.processing_screen.Ã‡.display="block";Ã�.processing_screen.Ã‡.width=width+"px";Ã�.processing_screen.Ã‡.height=height+"px";Ã�.waiting_screen_displayed=Ã‹;};EA.Ã„.hide_waiting_screen=Ãƒ(){Ã�.processing_screen.Ã‡.display="none";Ã�.waiting_screen_displayed=ÃŒ;};EA.Ã„.add_Ã‡=Ãƒ(Ã‡s){if(Ã‡s.Ã†>0){newcss=document.createElement("Ã‡");newcss.type="text/css";newcss.media="all";if(newcss.Ã‡Sheet){newcss.Ã‡Sheet.cssText=Ã‡s;}\nelse{newcss.appendChild(document.createTextNode(Ã‡s));}document.getElementsByTagName("head")[0].appendChild(newcss);}};EA.Ã„.set_font=Ãƒ(family,size){var t=Ã�,a=Ã�.Ã‚,s=Ã�.Ã…,elem_font,i;var elems=["Ã‚","content_highlight","cursor_pos","end_bracket","selection_field","selection_field_text","line_number"];if(family&&family!="")s["font_family"]=family;if(size&&size>0)s["font_size"]=size;if(t.isOpera&&t.isOpera < 9.6)s[\'font_family\']="monospace";if(elem_font=_$("area_font_size")){for(i=0;i < elem_font.Ã†;i++){if(elem_font.options[i].ÃŠ&&elem_font.options[i].ÃŠ==s["font_size"])elem_font.options[i].selected=Ã‹;}}elem=t.test_font_size;elem.Ã‡.fontFamily=""+s["font_family"];elem.Ã‡.fontSize=s["font_size"]+"pt";elem.innerHTML="0";t.lineHeight=elem.offsetHeight;for(var i=0;i<elems.Ã†;i++){var elem=_$(elems[i]);elem.Ã‡.fontFamily=s["font_family"];elem.Ã‡.fontSize=s["font_size"]+"pt";elem.Ã‡.lineHeight=t.lineHeight+"px";}t.add_Ã‡("pre{font-family:"+s["font_family"]+"}");if((t.isOpera&&t.isOpera < 9.6)||t.isIE >=8){var parNod=a.ÃˆNode,nxtSib=a.nextSibling,start=a.selectionStart,end=a.selectionEnd;parNod.removeChild(a);parNod.insertBefore(a,nxtSib);t.area_select(start,end-start);}t.last_line_selected=-1;t.Ã‰=[];t.resync_highlight();};EA.Ã„.change_font_size=Ãƒ(){var size=_$("area_font_size").ÃŠ;if(size>0)Ã�.set_font("",size);};EA.Ã„.open_inline_popup=Ãƒ(popup_id){Ã�.close_all_inline_popup();var popup=_$(popup_id);var editor=_$("editor");for(var i=0;i<Ã�.inlinePopup.Ã†;i++){if(Ã�.inlinePopup[i]["popup_id"]==popup_id){var icon=_$(Ã�.inlinePopup[i]["icon_id"]);if(icon){Ã�.switchClassSticky(icon,\'editAreaButtonSelected\',Ã‹);break;}}}popup.Ã‡.height="auto";popup.Ã‡.overflow="visible";if(document.body.offsetHeight< popup.offsetHeight){popup.Ã‡.height=(document.body.offsetHeight-10)+"px";popup.Ã‡.overflow="auto";}if(!popup.positionned){var new_left=editor.offsetWidth /2-popup.offsetWidth /2;var new_top=editor.offsetHeight /2-popup.offsetHeight /2;popup.Ã‡.left=new_left+"px";popup.Ã‡.top=new_top+"px";popup.positionned=Ã‹;}popup.Ã‡.visibility="visible";};EA.Ã„.close_inline_popup=Ãƒ(popup_id){var popup=_$(popup_id);for(var i=0;i<Ã�.inlinePopup.Ã†;i++){if(Ã�.inlinePopup[i]["popup_id"]==popup_id){var icon=_$(Ã�.inlinePopup[i]["icon_id"]);if(icon){Ã�.switchClassSticky(icon,\'editAreaButtonNormal\',ÃŒ);break;}}}popup.Ã‡.visibility="hidden";};EA.Ã„.close_all_inline_popup=Ãƒ(e){for(var i=0;i<Ã�.inlinePopup.Ã†;i++){Ã�.close_inline_popup(Ã�.inlinePopup[i]["popup_id"]);}Ã�.Ã‚.focus();};EA.Ã„.show_help=Ãƒ(){Ã�.open_inline_popup("edit_area_help");};EA.Ã„.new_document=Ãƒ(){Ã�.Ã‚.ÃŠ="";Ã�.area_select(0,0);};EA.Ã„.get_all_toolbar_height=Ãƒ(){var area=_$("editor");var results=Ãˆ.getChildren(area,"div","class","area_toolbar","all","0");var height=0;for(var i=0;i<results.Ã†;i++){height+=results[i].offsetHeight;}return height;};EA.Ã„.go_to_line=Ãƒ(line){if(!line){var icon=_$("go_to_line");if(icon !=null){Ã�.restoreClass(icon);Ã�.switchClassSticky(icon,\'editAreaButtonSelected\',Ã‹);}line=prompt(Ã�.get_translation("go_to_line_prompt"));if(icon !=null)Ã�.switchClassSticky(icon,\'editAreaButtonNormal\',ÃŒ);}if(line&&line!=null&&line.search(/^[0-9]+$/)!=-1){var start=0;var lines=Ã�.Ã‚.ÃŠ.split("\\n");if(line > lines.Ã†)start=Ã�.Ã‚.ÃŠ.Ã†;\nelse{for(var i=0;i<Math.min(line-1,lines.Ã†);i++)start+=lines[i].Ã†+1;}Ã�.area_select(start,0);}};EA.Ã„.change_smooth_selection_mode=Ãƒ(setTo){if(Ã�.do_highlight)return;if(setTo !=null){if(setTo===ÃŒ)Ã�.smooth_selection=Ã‹;\nelse Ã�.smooth_selection=ÃŒ;}var icon=_$("change_smooth_selection");Ã�.Ã‚.focus();if(Ã�.smooth_selection===Ã‹){Ã�.switchClassSticky(icon,\'editAreaButtonNormal\',ÃŒ);Ã�.smooth_selection=ÃŒ;Ã�.selection_field.Ã‡.display="none";_$("cursor_pos").Ã‡.display="none";_$("end_bracket").Ã‡.display="none";}\nelse{Ã�.switchClassSticky(icon,\'editAreaButtonSelected\',ÃŒ);Ã�.smooth_selection=Ã‹;Ã�.selection_field.Ã‡.display="block";_$("cursor_pos").Ã‡.display="block";_$("end_bracket").Ã‡.display="block";}};EA.Ã„.scroll_to_view=Ãƒ(show){var zone,lineElem;if(!Ã�.smooth_selection)return;zone=_$("result");var cursor_pos_top=_$("cursor_pos").cursor_top;if(show=="bottom"){cursor_pos_top+=Ã�.getLinePosTop(Ã�.Ã‰[\'line_start\']+Ã�.Ã‰[\'line_nb\']-1);}var max_height_visible=zone.clientHeight+zone.scrollTop;var miss_top=cursor_pos_top+Ã�.lineHeight-max_height_visible;if(miss_top>0){zone.scrollTop=zone.scrollTop+miss_top;}\nelse if(zone.scrollTop > cursor_pos_top){zone.scrollTop=cursor_pos_top;}var cursor_pos_left=_$("cursor_pos").cursor_left;var max_width_visible=zone.clientWidth+zone.scrollLeft;var miss_left=cursor_pos_left+10-max_width_visible;if(miss_left>0){zone.scrollLeft=zone.scrollLeft+miss_left+50;}\nelse if(zone.scrollLeft > cursor_pos_left){zone.scrollLeft=cursor_pos_left;}\nelse if(zone.scrollLeft==45){zone.scrollLeft=0;}};EA.Ã„.check_undo=Ãƒ(only_once){if(!eAs[Ã�.id])return ÃŒ;if(Ã�.Ã‚Focused&&eAs[Ã�.id]["displayed"]==Ã‹){var text=Ã�.Ã‚.ÃŠ;if(Ã�.previous.Ã†<=1)Ã�.switchClassSticky(_$("undo"),\'editAreaButtonDisabled\',Ã‹);if(!Ã�.previous[Ã�.previous.Ã†-1]||Ã�.previous[Ã�.previous.Ã†-1]["text"] !=text){Ã�.previous.push({"text":text,"selStart":Ã�.Ã‚.selectionStart,"selEnd":Ã�.Ã‚.selectionEnd});if(Ã�.previous.Ã† > Ã�.Ã…["max_undo"]+1)Ã�.previous.shift();}if(Ã�.previous.Ã† >=2)Ã�.switchClassSticky(_$("undo"),\'editAreaButtonNormal\',ÃŒ);}if(!only_once)setTimeout("eA.check_undo()",3000);};EA.Ã„.undo=Ãƒ(){if(Ã�.previous.Ã† > 0){if(Ã�.isIE)Ã�.getIESelection();Ã�.next.push({"text":Ã�.Ã‚.ÃŠ,"selStart":Ã�.Ã‚.selectionStart,"selEnd":Ã�.Ã‚.selectionEnd});var prev=Ã�.previous.pop();if(prev["text"]==Ã�.Ã‚.ÃŠ&&Ã�.previous.Ã† > 0)prev=Ã�.previous.pop();Ã�.Ã‚.ÃŠ=prev["text"];Ã�.last_undo=prev["text"];Ã�.area_select(prev["selStart"],prev["selEnd"]-prev["selStart"]);Ã�.switchClassSticky(_$("redo"),\'editAreaButtonNormal\',ÃŒ);Ã�.resync_highlight(Ã‹);Ã�.check_file_changes();}};EA.Ã„.redo=Ãƒ(){if(Ã�.next.Ã† > 0){var next=Ã�.next.pop();Ã�.previous.push(next);Ã�.Ã‚.ÃŠ=next["text"];Ã�.last_undo=next["text"];Ã�.area_select(next["selStart"],next["selEnd"]-next["selStart"]);Ã�.switchClassSticky(_$("undo"),\'editAreaButtonNormal\',ÃŒ);Ã�.resync_highlight(Ã‹);Ã�.check_file_changes();}if(Ã�.next.Ã†==0)Ã�.switchClassSticky(_$("redo"),\'editAreaButtonDisabled\',Ã‹);};EA.Ã„.check_redo=Ãƒ(){if(eA.next.Ã†==0||eA.Ã‚.ÃŠ!=eA.last_undo){eA.next=[];eA.switchClassSticky(_$("redo"),\'editAreaButtonDisabled\',Ã‹);}\nelse{Ã�.switchClassSticky(_$("redo"),\'editAreaButtonNormal\',ÃŒ);}};EA.Ã„.switchClass=Ãƒ(element,class_name,lock_state){var lockChanged=ÃŒ;if(typeof(lock_state)!="undefined"&&element !=null){element.classLock=lock_state;lockChanged=Ã‹;}if(element !=null&&(lockChanged||!element.classLock)){element.oldClassName=element.className;element.className=class_name;}};EA.Ã„.restoreAndSwitchClass=Ãƒ(element,class_name){if(element !=null&&!element.classLock){Ã�.restoreClass(element);Ã�.switchClass(element,class_name);}};EA.Ã„.restoreClass=Ãƒ(element){if(element !=null&&element.oldClassName&&!element.classLock){element.className=element.oldClassName;element.oldClassName=null;}};EA.Ã„.setClassLock=Ãƒ(element,lock_state){if(element !=null)element.classLock=lock_state;};EA.Ã„.switchClassSticky=Ãƒ(element,class_name,lock_state){var lockChanged=ÃŒ;if(typeof(lock_state)!="undefined"&&element !=null){element.classLock=lock_state;lockChanged=Ã‹;}if(element !=null&&(lockChanged||!element.classLock)){element.className=class_name;element.oldClassName=class_name;}};EA.Ã„.scroll_page=Ãƒ(params){var dir=params["dir"],shift_pressed=params["shift"];var lines=Ã�.Ã‚.ÃŠ.split("\\n");var new_pos=0,Ã†=0,char_left=0,line_nb=0,curLine=0;var toScrollAmount=_$("result").clientHeight-30;var nbLineToScroll=0,diff=0;if(dir=="up"){nbLineToScroll=Math.ceil(toScrollAmount / Ã�.lineHeight);for(i=Ã�.Ã‰["line_start"];i-diff > Ã�.Ã‰["line_start"]-nbLineToScroll;i--){if(elem=_$(\'line_\'+i)){diff+=Math.floor((elem.offsetHeight-1)/ Ã�.lineHeight);}}nbLineToScroll-=diff;if(Ã�.Ã‰["selec_direction"]=="up"){for(line_nb=0;line_nb< Math.min(Ã�.Ã‰["line_start"]-nbLineToScroll,lines.Ã†);line_nb++){new_pos+=lines[line_nb].Ã†+1;}char_left=Math.min(lines[Math.min(lines.Ã†-1,line_nb)].Ã†,Ã�.Ã‰["curr_pos"]-1);if(shift_pressed)Ã†=Ã�.Ã‰["selectionEnd"]-new_pos-char_left;Ã�.area_select(new_pos+char_left,Ã†);view="top";}\nelse{view="bottom";for(line_nb=0;line_nb< Math.min(Ã�.Ã‰["line_start"]+Ã�.Ã‰["line_nb"]-1-nbLineToScroll,lines.Ã†);line_nb++){new_pos+=lines[line_nb].Ã†+1;}char_left=Math.min(lines[Math.min(lines.Ã†-1,line_nb)].Ã†,Ã�.Ã‰["curr_pos"]-1);if(shift_pressed){start=Math.min(Ã�.Ã‰["selectionStart"],new_pos+char_left);Ã†=Math.max(new_pos+char_left,Ã�.Ã‰["selectionStart"])-start;if(new_pos+char_left < Ã�.Ã‰["selectionStart"])view="top";}\nelse start=new_pos+char_left;Ã�.area_select(start,Ã†);}}\nelse{var nbLineToScroll=Math.floor(toScrollAmount / Ã�.lineHeight);for(i=Ã�.Ã‰["line_start"];i+diff < Ã�.Ã‰["line_start"]+nbLineToScroll;i++){if(elem=_$(\'line_\'+i)){diff+=Math.floor((elem.offsetHeight-1)/ Ã�.lineHeight);}}nbLineToScroll-=diff;if(Ã�.Ã‰["selec_direction"]=="down"){view="bottom";for(line_nb=0;line_nb< Math.min(Ã�.Ã‰["line_start"]+Ã�.Ã‰["line_nb"]-2+nbLineToScroll,lines.Ã†);line_nb++){if(line_nb==Ã�.Ã‰["line_start"]-1)char_left=Ã�.Ã‰["selectionStart"]-new_pos;new_pos+=lines[line_nb].Ã†+1;}if(shift_pressed){Ã†=Math.abs(Ã�.Ã‰["selectionStart"]-new_pos);Ã†+=Math.min(lines[Math.min(lines.Ã†-1,line_nb)].Ã†,Ã�.Ã‰["curr_pos"]);Ã�.area_select(Math.min(Ã�.Ã‰["selectionStart"],new_pos),Ã†);}\nelse{Ã�.area_select(new_pos+char_left,0);}}\nelse{view="top";for(line_nb=0;line_nb< Math.min(Ã�.Ã‰["line_start"]+nbLineToScroll-1,lines.Ã†,lines.Ã†);line_nb++){if(line_nb==Ã�.Ã‰["line_start"]-1)char_left=Ã�.Ã‰["selectionStart"]-new_pos;new_pos+=lines[line_nb].Ã†+1;}if(shift_pressed){Ã†=Math.abs(Ã�.Ã‰["selectionEnd"]-new_pos-char_left);Ã†+=Math.min(lines[Math.min(lines.Ã†-1,line_nb)].Ã†,Ã�.Ã‰["curr_pos"])-char_left-1;Ã�.area_select(Math.min(Ã�.Ã‰["selectionEnd"],new_pos+char_left),Ã†);if(new_pos+char_left > Ã�.Ã‰["selectionEnd"])view="bottom";}\nelse{Ã�.area_select(new_pos+char_left,0);}}}Ã�.check_line_selection();Ã�.scroll_to_view(view);};EA.Ã„.start_resize=Ãƒ(e){Ãˆ.eAL.resize["id"]=eA.id;Ãˆ.eAL.resize["start_x"]=(e)? e.pageX:event.x+document.body.scrollLeft;Ãˆ.eAL.resize["start_y"]=(e)? e.pageY:event.y+document.body.scrollTop;if(eA.isIE){eA.Ã‚.focus();eA.getIESelection();}Ãˆ.eAL.resize["selectionStart"]=eA.Ã‚.selectionStart;Ãˆ.eAL.resize["selectionEnd"]=eA.Ã‚.selectionEnd;Ãˆ.eAL.start_resize_area();};EA.Ã„.toggle_full_screen=Ãƒ(to){if(typeof(to)=="undefined")to=!Ã�.fullscreen[\'isFull\'];var old=Ã�.fullscreen[\'isFull\'];Ã�.fullscreen[\'isFull\']=to;var icon=_$("fullscreen");if(to&&to!=old){var selStart=Ã�.Ã‚.selectionStart;var selEnd=Ã�.Ã‚.selectionEnd;var html=Ãˆ.document.getElementsByTagName("html")[0];var frame=Ãˆ.document.getElementById("frame_"+Ã�.id);Ã�.fullscreen[\'old_overflow\']=Ãˆ.get_css_property(html,"overflow");Ã�.fullscreen[\'old_height\']=Ãˆ.get_css_property(html,"height");Ã�.fullscreen[\'old_width\']=Ãˆ.get_css_property(html,"width");Ã�.fullscreen[\'old_scrollTop\']=html.scrollTop;Ã�.fullscreen[\'old_scrollLeft\']=html.scrollLeft;Ã�.fullscreen[\'old_zIndex\']=Ãˆ.get_css_property(frame,"z-index");if(Ã�.isOpera){html.Ã‡.height="100%";html.Ã‡.width="100%";}html.Ã‡.overflow="hidden";html.scrollTop=0;html.scrollLeft=0;frame.Ã‡.position="absolute";frame.Ã‡.width=html.clientWidth+"px";frame.Ã‡.height=html.clientHeight+"px";frame.Ã‡.display="block";frame.Ã‡.zIndex="999999";frame.Ã‡.top="0px";frame.Ã‡.left="0px";frame.Ã‡.top="-"+Ãˆ.calculeOffsetTop(frame)+"px";frame.Ã‡.left="-"+Ãˆ.calculeOffsetLeft(frame)+"px";Ã�.switchClassSticky(icon,\'editAreaButtonSelected\',ÃŒ);Ã�.fullscreen[\'allow_resize\']=Ã�.resize_allowed;Ã�.allow_resize(ÃŒ);if(Ã�.isFirefox){Ãˆ.eAL.execCommand(Ã�.id,"update_size();");Ã�.area_select(selStart,selEnd-selStart);Ã�.scroll_to_view();Ã�.focus();}\nelse{setTimeout("Ãˆ.eAL.execCommand(\'"+Ã�.id+"\',\'update_size();\');eA.focus();",10);}}\nelse if(to!=old){var selStart=Ã�.Ã‚.selectionStart;var selEnd=Ã�.Ã‚.selectionEnd;var frame=Ãˆ.document.getElementById("frame_"+Ã�.id);frame.Ã‡.position="static";frame.Ã‡.zIndex=Ã�.fullscreen[\'old_zIndex\'];var html=Ãˆ.document.getElementsByTagName("html")[0];if(Ã�.isOpera){html.Ã‡.height="auto";html.Ã‡.width="auto";html.Ã‡.overflow="auto";}\nelse if(Ã�.isIE&&Ãˆ!=top){html.Ã‡.overflow="auto";}\nelse html.Ã‡.overflow=Ã�.fullscreen[\'old_overflow\'];html.scrollTop=Ã�.fullscreen[\'old_scrollTop\'];html.scrollTop=Ã�.fullscreen[\'old_scrollLeft\'];Ãˆ.eAL.hide(Ã�.id);Ãˆ.eAL.show(Ã�.id);Ã�.switchClassSticky(icon,\'editAreaButtonNormal\',ÃŒ);if(Ã�.fullscreen[\'allow_resize\'])Ã�.allow_resize(Ã�.fullscreen[\'allow_resize\']);if(Ã�.isFirefox){Ã�.area_select(selStart,selEnd-selStart);setTimeout("eA.scroll_to_view();",10);}}};EA.Ã„.allow_resize=Ãƒ(allow){var resize=_$("resize_area");if(allow){resize.Ã‡.visibility="visible";Ãˆ.eAL.add_event(resize,"mouseup",eA.start_resize);}\nelse{resize.Ã‡.visibility="hidden";Ãˆ.eAL.remove_event(resize,"mouseup",eA.start_resize);}Ã�.resize_allowed=allow;};EA.Ã„.change_syntax=Ãƒ(new_syntax,is_waiting){if(new_syntax==Ã�.Ã…[\'syntax\'])return Ã‹;var founded=ÃŒ;for(var i=0;i<Ã�.syntax_list.Ã†;i++){if(Ã�.syntax_list[i]==new_syntax)founded=Ã‹;}if(founded==Ã‹){if(!Ãˆ.eAL.load_syntax[new_syntax]){if(!is_waiting)Ãˆ.eAL.load_script(Ãˆ.eAL.baseURL+"reg_syntax/"+new_syntax+".js");setTimeout("eA.change_syntax(\'"+new_syntax+"\',Ã‹);",100);Ã�.show_waiting_screen();}\nelse{if(!Ã�.allready_used_syntax[new_syntax]){Ãˆ.eAL.init_syntax_regexp();Ã�.add_Ã‡(Ãˆ.eAL.syntax[new_syntax]["Ã‡s"]);Ã�.allready_used_syntax[new_syntax]=Ã‹;}var sel=_$("syntax_selection");if(sel&&sel.ÃŠ!=new_syntax){for(var i=0;i<sel.Ã†;i++){if(sel.options[i].ÃŠ&&sel.options[i].ÃŠ==new_syntax)sel.options[i].selected=Ã‹;}}Ã�.Ã…[\'syntax\']=new_syntax;Ã�.resync_highlight(Ã‹);Ã�.hide_waiting_screen();return Ã‹;}}return ÃŒ;};EA.Ã„.set_editable=Ãƒ(is_editable){if(is_editable){document.body.className="";Ã�.Ã‚.readOnly=ÃŒ;Ã�.is_editable=Ã‹;}\nelse{document.body.className="non_editable";Ã�.Ã‚.readOnly=Ã‹;Ã�.is_editable=ÃŒ;}if(eAs[Ã�.id]["displayed"]==Ã‹)Ã�.update_size();};EA.Ã„.toggle_word_wrap=Ãƒ(){Ã�.set_word_wrap(!Ã�.Ã…[\'word_wrap\']);};EA.Ã„.set_word_wrap=Ãƒ(to){var t=Ã�,a=t.Ã‚;if(t.isOpera){Ã�.Ã…[\'word_wrap\']=ÃŒ;t.switchClassSticky(_$("word_wrap"),\'editAreaButtonDisabled\',Ã‹);return ÃŒ;}if(to){wrap_mode=\'soft\';Ã�.container.className+=\' word_wrap\';Ã�.container.Ã‡.width="";Ã�.content_highlight.Ã‡.width="";a.Ã‡.width="100%";if(t.isIE&&t.isIE < 7){a.Ã‡.width=(a.offsetWidth-5)+"px";}t.switchClassSticky(_$("word_wrap"),\'editAreaButtonSelected\',ÃŒ);}\nelse{wrap_mode=\'off\';Ã�.container.className=Ã�.container.className.replace(/word_wrap/g,\'\');t.switchClassSticky(_$("word_wrap"),\'editAreaButtonNormal\',Ã‹);}Ã�.Ã‚.previous_scrollWidth=\'\';Ã�.Ã‚.previous_scrollHeight=\'\';a.wrap=wrap_mode;a.setAttribute(\'wrap\',wrap_mode);if(!Ã�.isIE){var start=a.selectionStart,end=a.selectionEnd;var parNod=a.ÃˆNode,nxtSib=a.nextSibling;parNod.removeChild(a);parNod.insertBefore(a,nxtSib);Ã�.area_select(start,end-start);}Ã�.Ã…[\'word_wrap\']=to;Ã�.focus();Ã�.update_size();Ã�.check_line_selection();};EA.Ã„.open_file=Ãƒ(Ã…){if(Ã…[\'id\']!="undefined"){var id=Ã…[\'id\'];var new_file={};new_file[\'id\']=id;new_file[\'title\']=id;new_file[\'text\']="";new_file[\'Ã‰\']="";new_file[\'last_text_to_highlight\']="";new_file[\'last_hightlighted_text\']="";new_file[\'previous\']=[];new_file[\'next\']=[];new_file[\'last_undo\']="";new_file[\'smooth_selection\']=Ã�.Ã…[\'smooth_selection\'];new_file[\'do_highlight\']=Ã�.Ã…[\'start_highlight\'];new_file[\'syntax\']=Ã�.Ã…[\'syntax\'];new_file[\'scroll_top\']=0;new_file[\'scroll_left\']=0;new_file[\'selection_start\']=0;new_file[\'selection_end\']=0;new_file[\'edited\']=ÃŒ;new_file[\'font_size\']=Ã�.Ã…["font_size"];new_file[\'font_family\']=Ã�.Ã…["font_family"];new_file[\'word_wrap\']=Ã�.Ã…["word_wrap"];new_file[\'toolbar\']={\'links\':{},\'selects\':{}};new_file[\'compare_edited_text\']=new_file[\'text\'];Ã�.files[id]=new_file;Ã�.update_file(id,Ã…);Ã�.files[id][\'compare_edited_text\']=Ã�.files[id][\'text\'];var html_id=\'tab_file_\'+encodeURIComponent(id);Ã�.filesIdAssoc[html_id]=id;Ã�.files[id][\'html_id\']=html_id;if(!_$(Ã�.files[id][\'html_id\'])&&id!=""){Ã�.tab_browsing_area.Ã‡.display="block";var elem=document.createElement(\'li\');elem.id=Ã�.files[id][\'html_id\'];var close="<img src=\\""+Ãˆ.eAL.baseURL+"images/close.gif\\" title=\\""+Ã�.get_translation(\'close_tab\',\'word\')+"\\" onclick=\\"eA.execCommand(\'close_file\',eA.filesIdAssoc[\'"+html_id+"\']);return ÃŒ;\\" class=\\"hidden\\" onmouseover=\\"Ã�.className=\'\'\\" onmouseout=\\"Ã�.className=\'hidden\'\\" />";elem.innerHTML="<a onclick=\\"javascript:eA.execCommand(\'switch_to_file\',eA.filesIdAssoc[\'"+html_id+"\']);\\" selec=\\"none\\"><b><span><strong class=\\"edited\\">*</strong>"+Ã�.files[id][\'title\']+close+"</span></b></a>";_$(\'tab_browsing_list\').appendChild(elem);var elem=document.createElement(\'text\');Ã�.update_size();}if(id!="")Ã�.execCommand(\'file_open\',Ã�.files[id]);Ã�.switch_to_file(id,Ã‹);return Ã‹;}\nelse return ÃŒ;};EA.Ã„.close_file=Ãƒ(id){if(Ã�.files[id]){Ã�.save_file(id);if(Ã�.execCommand(\'file_close\',Ã�.files[id])!==ÃŒ){var li=_$(Ã�.files[id][\'html_id\']);li.ÃˆNode.removeChild(li);if(id==Ã�.curr_file){var next_file="";var is_next=ÃŒ;for(var i in Ã�.files){if(is_next){next_file=i;break;}\nelse if(i==id)is_next=Ã‹;\nelse next_file=i;}Ã�.switch_to_file(next_file);}delete(Ã�.files[id]);Ã�.update_size();}}};EA.Ã„.save_file=Ãƒ(id){if(Ã�.files[id]){var save=Ã�.files[id];save[\'Ã‰\']=Ã�.Ã‰;save[\'last_text_to_highlight\']=Ã�.last_text_to_highlight;save[\'last_hightlighted_text\']=Ã�.last_hightlighted_text;save[\'previous\']=Ã�.previous;save[\'next\']=Ã�.next;save[\'last_undo\']=Ã�.last_undo;save[\'smooth_selection\']=Ã�.smooth_selection;save[\'do_highlight\']=Ã�.do_highlight;save[\'syntax\']=Ã�.Ã…[\'syntax\'];save[\'text\']=Ã�.Ã‚.ÃŠ;save[\'scroll_top\']=Ã�.result.scrollTop;save[\'scroll_left\']=Ã�.result.scrollLeft;save[\'selection_start\']=Ã�.Ã‰["selectionStart"];save[\'selection_end\']=Ã�.Ã‰["selectionEnd"];save[\'font_size\']=Ã�.Ã…["font_size"];save[\'font_family\']=Ã�.Ã…["font_family"];save[\'word_wrap\']=Ã�.Ã…["word_wrap"];save[\'toolbar\']={\'links\':{},\'selects\':{}};var links=_$("toolbar_1").getElementsByTagName("a");for(var i=0;i<links.Ã†;i++){if(links[i].getAttribute(\'fileSpecific\')==\'yes\'){var save_butt={};var img=links[i].getElementsByTagName(\'img\')[0];save_butt[\'classLock\']=img.classLock;save_butt[\'className\']=img.className;save_butt[\'oldClassName\']=img.oldClassName;save[\'toolbar\'][\'links\'][links[i].id]=save_butt;}}var selects=_$("toolbar_1").getElementsByTagName("select");for(var i=0;i<selects.Ã†;i++){if(selects[i].getAttribute(\'fileSpecific\')==\'yes\'){save[\'toolbar\'][\'selects\'][selects[i].id]=selects[i].ÃŠ;}}Ã�.files[id]=save;return save;}\nelse return ÃŒ;};EA.Ã„.update_file=Ãƒ(id,new_ÃŠs){for(var i in new_ÃŠs){Ã�.files[id][i]=new_ÃŠs[i];}};EA.Ã„.display_file=Ãƒ(id){if(id==\'\'){Ã�.Ã‚.readOnly=Ã‹;Ã�.tab_browsing_area.Ã‡.display="none";_$("no_file_selected").Ã‡.display="block";Ã�.result.className="empty";if(!Ã�.files[\'\'])Ã�.open_file({id:\'\'});}\nelse{Ã�.result.className="";Ã�.Ã‚.readOnly=!Ã�.is_editable;_$("no_file_selected").Ã‡.display="none";Ã�.tab_browsing_area.Ã‡.display="block";}Ã�.check_redo(Ã‹);Ã�.check_undo(Ã‹);Ã�.curr_file=id;var lis=Ã�.tab_browsing_area.getElementsByTagName(\'li\');for(var i=0;i<lis.Ã†;i++){if(lis[i].id==Ã�.files[id][\'html_id\'])lis[i].className=\'selected\';\nelse lis[i].className=\'\';}var new_file=Ã�.files[id];Ã�.Ã‚.ÃŠ=new_file[\'text\'];Ã�.set_font(new_file[\'font_family\'],new_file[\'font_size\']);Ã�.area_select(new_file[\'Ã‰\'][\'selection_start\'],new_file[\'Ã‰\'][\'selection_end\']-new_file[\'Ã‰\'][\'selection_start\']);Ã�.manage_size(Ã‹);Ã�.result.scrollTop=new_file[\'scroll_top\'];Ã�.result.scrollLeft=new_file[\'scroll_left\'];Ã�.previous=new_file[\'previous\'];Ã�.next=new_file[\'next\'];Ã�.last_undo=new_file[\'last_undo\'];Ã�.check_redo(Ã‹);Ã�.check_undo(Ã‹);Ã�.execCommand("change_highlight",new_file[\'do_highlight\']);Ã�.execCommand("change_syntax",new_file[\'syntax\']);Ã�.execCommand("change_smooth_selection_mode",new_file[\'smooth_selection\']);Ã�.execCommand("set_word_wrap",new_file[\'word_wrap\']);var links=new_file[\'toolbar\'][\'links\'];for(var i in links){if(img=_$(i).getElementsByTagName(\'img\')[0]){var save_butt={};img.classLock=links[i][\'classLock\'];img.className=links[i][\'className\'];img.oldClassName=links[i][\'oldClassName\'];}}var selects=new_file[\'toolbar\'][\'selects\'];for(var i in selects){var options=_$(i).options;for(var j=0;j<options.Ã†;j++){if(options[j].ÃŠ==selects[i])_$(i).options[j].selected=Ã‹;}}};EA.Ã„.switch_to_file=Ãƒ(file_to_show,force_refresh){if(file_to_show!=Ã�.curr_file||force_refresh){Ã�.save_file(Ã�.curr_file);if(Ã�.curr_file!=\'\')Ã�.execCommand(\'file_switch_off\',Ã�.files[Ã�.curr_file]);Ã�.display_file(file_to_show);if(file_to_show!=\'\')Ã�.execCommand(\'file_switch_on\',Ã�.files[file_to_show]);}};EA.Ã„.get_file=Ãƒ(id){if(id==Ã�.curr_file)Ã�.save_file(id);return Ã�.files[id];};EA.Ã„.get_all_files=Ãƒ(){tmp_files=Ã�.files;Ã�.save_file(Ã�.curr_file);if(tmp_files[\'\'])delete(Ã�.files[\'\']);return tmp_files;};EA.Ã„.check_file_changes=Ãƒ(){var id=Ã�.curr_file;if(Ã�.files[id]&&Ã�.files[id][\'compare_edited_text\']!=undefined){if(Ã�.files[id][\'compare_edited_text\'].Ã†==Ã�.Ã‚.ÃŠ.Ã†&&Ã�.files[id][\'compare_edited_text\']==Ã�.Ã‚.ÃŠ){if(Ã�.files[id][\'edited\']!=ÃŒ)Ã�.set_file_edited_mode(id,ÃŒ);}\nelse{if(Ã�.files[id][\'edited\']!=Ã‹)Ã�.set_file_edited_mode(id,Ã‹);}}};EA.Ã„.set_file_edited_mode=Ãƒ(id,to){if(Ã�.files[id]&&_$(Ã�.files[id][\'html_id\'])){var link=_$(Ã�.files[id][\'html_id\']).getElementsByTagName(\'a\')[0];if(to==Ã‹){link.className=\'edited\';}\nelse{link.className=\'\';if(id==Ã�.curr_file)text=Ã�.Ã‚.ÃŠ;\nelse text=Ã�.files[id][\'text\'];Ã�.files[id][\'compare_edited_text\']=text;}Ã�.files[id][\'edited\']=to;}};EA.Ã„.set_show_line_colors=Ãƒ(new_ÃŠ){Ã�.show_line_colors=new_ÃŠ;if(new_ÃŠ)Ã�.selection_field.className+=\' show_colors\';\nelse Ã�.selection_field.className=Ã�.selection_field.className.replace(/ show_colors/g,\'\');};var EA_keys={8:"Retour arriere",9:"Tabulation",12:"Milieu(pave numerique)",13:"Entrer",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause",20:"Verr Maj",27:"Esc",32:"Space",33:"Page up",34:"Page down",35:"End",36:"Begin",37:"Left",38:"Up",39:"Right",40:"Down",44:"Impr ecran",45:"Inser",46:"Suppr",91:"Menu Demarrer Windows / touche pomme Mac",92:"Menu Demarrer Windows",93:"Menu contextuel Windows",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Verr Num",145:"Arret defil"};Ãƒ keyDown(e){if(!e){e=event;}for(var i in eA.plugins){if(typeof(eA.plugins[i].onkeydown)=="Ãƒ"){if(eA.plugins[i].onkeydown(e)===ÃŒ){if(eA.isIE)e.keyCode=0;return ÃŒ;}}}var target_id=(e.target||e.srcElement).id;var use=ÃŒ;if(EA_keys[e.keyCode])letter=EA_keys[e.keyCode];\nelse letter=String.fromCharCode(e.keyCode);var low_letter=letter.toLowerCase();if(letter=="Page up"&&!eA.isOpera){eA.execCommand("scroll_page",{"dir":"up","shift":ShiftPressed(e)});use=Ã‹;}\nelse if(letter=="Page down"&&!eA.isOpera){eA.execCommand("scroll_page",{"dir":"down","shift":ShiftPressed(e)});use=Ã‹;}\nelse if(eA.is_editable==ÃŒ){return Ã‹;}\nelse if(letter=="Tabulation"&&target_id=="Ã‚"&&!CtrlPressed(e)&&!AltPressed(e)){if(ShiftPressed(e))eA.execCommand("invert_tab_selection");\nelse eA.execCommand("tab_selection");use=Ã‹;if(eA.isOpera||(eA.isFirefox&&eA.isMacOS))setTimeout("eA.execCommand(\'focus\');",1);}\nelse if(letter=="Entrer"&&target_id=="Ã‚"){if(eA.press_enter())use=Ã‹;}\nelse if(letter=="Entrer"&&target_id=="area_search"){eA.execCommand("area_search");use=Ã‹;}\nelse  if(letter=="Esc"){eA.execCommand("close_all_inline_popup",e);use=Ã‹;}\nelse if(CtrlPressed(e)&&!AltPressed(e)&&!ShiftPressed(e)){switch(low_letter){case "f":eA.execCommand("area_search");use=Ã‹;break;case "r":eA.execCommand("area_replace");use=Ã‹;break;case "q":eA.execCommand("close_all_inline_popup",e);use=Ã‹;break;case "h":eA.execCommand("change_highlight");use=Ã‹;break;case "g":setTimeout("eA.execCommand(\'go_to_line\');",5);use=Ã‹;break;case "e":eA.execCommand("show_help");use=Ã‹;break;case "z":use=Ã‹;eA.execCommand("undo");break;case "y":use=Ã‹;eA.execCommand("redo");break;default:break;}}if(eA.next.Ã† > 0){setTimeout("eA.check_redo();",10);}setTimeout("eA.check_file_changes();",10);if(use){if(eA.isIE)e.keyCode=0;return ÃŒ;}return Ã‹;};Ãƒ AltPressed(e){if(window.event){return(window.event.altKey);}\nelse{if(e.modifiers)return(e.altKey||(e.modifiers % 2));\nelse return e.altKey;}};Ãƒ CtrlPressed(e){if(window.event){return(window.event.ctrlKey);}\nelse{return(e.ctrlKey||(e.modifiers==2)||(e.modifiers==3)||(e.modifiers>5));}};Ãƒ ShiftPressed(e){if(window.event){return(window.event.shiftKey);}\nelse{return(e.shiftKey||(e.modifiers>3));}};	EA.Ã„.show_search=Ãƒ(){if(_$("area_search_replace").Ã‡.visibility=="visible"){Ã�.hidden_search();}\nelse{Ã�.open_inline_popup("area_search_replace");var text=Ã�.area_get_selection();var search=text.split("\\n")[0];_$("area_search").ÃŠ=search;_$("area_search").focus();}};EA.Ã„.hidden_search=Ãƒ(){Ã�.close_inline_popup("area_search_replace");};EA.Ã„.area_search=Ãƒ(mode){if(!mode)mode="search";_$("area_search_msg").innerHTML="";var search=_$("area_search").ÃŠ;Ã�.Ã‚.focus();Ã�.Ã‚.Ã‚Focused=Ã‹;var infos=Ã�.get_selection_infos();var start=infos["selectionStart"];var pos=-1;var pos_begin=-1;var Ã†=search.Ã†;if(_$("area_search_replace").Ã‡.visibility!="visible"){Ã�.show_search();return;}if(search.Ã†==0){_$("area_search_msg").innerHTML=Ã�.get_translation("search_field_empty");return;}if(mode!="replace"){if(_$("area_search_reg_exp").checked)start++;\nelse start+=search.Ã†;}if(_$("area_search_reg_exp").checked){var opt="m";if(!_$("area_search_match_case").checked)opt+="i";var reg=new RegExp(search,opt);pos=infos["full_text"].substr(start).search(reg);pos_begin=infos["full_text"].search(reg);if(pos!=-1){pos+=start;Ã†=infos["full_text"].substr(start).match(reg)[0].Ã†;}\nelse if(pos_begin!=-1){Ã†=infos["full_text"].match(reg)[0].Ã†;}}\nelse{if(_$("area_search_match_case").checked){pos=infos["full_text"].indexOf(search,start);pos_begin=infos["full_text"].indexOf(search);}\nelse{pos=infos["full_text"].toLowerCase().indexOf(search.toLowerCase(),start);pos_begin=infos["full_text"].toLowerCase().indexOf(search.toLowerCase());}}if(pos==-1&&pos_begin==-1){_$("area_search_msg").innerHTML="<strong>"+search+"</strong> "+Ã�.get_translation("not_found");return;}\nelse if(pos==-1&&pos_begin !=-1){begin=pos_begin;_$("area_search_msg").innerHTML=Ã�.get_translation("restart_search_at_begin");}\nelse begin=pos;if(mode=="replace"&&pos==infos["indexOfCursor"]){var replace=_$("area_replace").ÃŠ;var new_text="";if(_$("area_search_reg_exp").checked){var opt="m";if(!_$("area_search_match_case").checked)opt+="i";var reg=new RegExp(search,opt);new_text=infos["full_text"].substr(0,begin)+infos["full_text"].substr(start).replace(reg,replace);}\nelse{new_text=infos["full_text"].substr(0,begin)+replace+infos["full_text"].substr(begin+Ã†);}Ã�.Ã‚.ÃŠ=new_text;this.execCommand("onchange");Ã�.area_select(begin,Ã†);Ã�.area_search();}\nelse Ã�.area_select(begin,Ã†);};EA.Ã„.area_replace=Ãƒ(){Ã�.area_search("replace");};EA.Ã„.area_replace_all=Ãƒ(){var base_text=Ã�.Ã‚.ÃŠ;var search=_$("area_search").ÃŠ;var replace=_$("area_replace").ÃŠ;if(search.Ã†==0){_$("area_search_msg").innerHTML=Ã�.get_translation("search_field_empty");return;}var new_text="";var nb_change=0;if(_$("area_search_reg_exp").checked){var opt="mg";if(!_$("area_search_match_case").checked)opt+="i";var reg=new RegExp(search,opt);nb_change=infos["full_text"].match(reg).Ã†;new_text=infos["full_text"].replace(reg,replace);}\nelse{if(_$("area_search_match_case").checked){var tmp_tab=base_text.split(search);nb_change=tmp_tab.Ã†-1;new_text=tmp_tab.join(replace);}\nelse{var lower_ÃŠ=base_text.toLowerCase();var lower_search=search.toLowerCase();var start=0;var pos=lower_ÃŠ.indexOf(lower_search);while(pos!=-1){nb_change++;new_text+=Ã�.Ã‚.ÃŠ.substring(start,pos)+replace;start=pos+search.Ã†;pos=lower_ÃŠ.indexOf(lower_search,pos+1);}new_text+=Ã�.Ã‚.ÃŠ.substring(start);}}if(new_text==base_text){_$("area_search_msg").innerHTML="<strong>"+search+"</strong> "+Ã�.get_translation("not_found");}\nelse{Ã�.Ã‚.ÃŠ=new_text;this.execCommand("onchange");_$("area_search_msg").innerHTML="<strong>"+nb_change+"</strong> "+Ã�.get_translation("occurrence_replaced");setTimeout("eA.Ã‚.focus();eA.Ã‚.Ã‚Focused=Ã‹;",100);}}; EA.Ã„.change_highlight=Ãƒ(change_to){if(Ã�.Ã…["syntax"].Ã†==0&&change_to==ÃŒ){Ã�.switchClassSticky(_$("highlight"),\'editAreaButtonDisabled\',Ã‹);Ã�.switchClassSticky(_$("reset_highlight"),\'editAreaButtonDisabled\',Ã‹);return ÃŒ;}if(Ã�.do_highlight==change_to)return ÃŒ;if(Ã�.isIE)Ã�.getIESelection();var pos_start=Ã�.Ã‚.selectionStart;var pos_end=Ã�.Ã‚.selectionEnd;if(Ã�.do_highlight===Ã‹||change_to==ÃŒ)Ã�.disable_highlight();\nelse Ã�.enable_highlight();Ã�.Ã‚.focus();Ã�.Ã‚.selectionStart=pos_start;Ã�.Ã‚.selectionEnd=pos_end;if(Ã�.isIE)Ã�.setIESelection();};EA.Ã„.disable_highlight=Ãƒ(displayOnly){var t=Ã�,a=t.Ã‚,new_Obj,old_class,new_class;t.selection_field.innerHTML="";t.selection_field_text.innerHTML="";t.content_highlight.Ã‡.visibility="hidden";new_Obj=t.content_highlight.cloneNode(ÃŒ);new_Obj.innerHTML="";t.content_highlight.ÃˆNode.insertBefore(new_Obj,t.content_highlight);t.content_highlight.ÃˆNode.removeChild(t.content_highlight);t.content_highlight=new_Obj;old_class=Ãˆ.getAttribute(a,"class");if(old_class){new_class=old_class.replace("hidden","");Ãˆ.setAttribute(a,"class",new_class);}a.Ã‡.backgroundColor="transÃˆ";t.switchClassSticky(_$("highlight"),\'editAreaButtonNormal\',Ã‹);t.switchClassSticky(_$("reset_highlight"),\'editAreaButtonDisabled\',Ã‹);t.do_highlight=ÃŒ;t.switchClassSticky(_$("change_smooth_selection"),\'editAreaButtonSelected\',Ã‹);if(typeof(t.smooth_selection_before_highlight)!="undefined"&&t.smooth_selection_before_highlight===ÃŒ){t.change_smooth_selection_mode(ÃŒ);}};EA.Ã„.enable_highlight=Ãƒ(){var t=Ã�,a=t.Ã‚,new_class;t.show_waiting_screen();t.content_highlight.Ã‡.visibility="visible";new_class=Ãˆ.getAttribute(a,"class")+" hidden";Ãˆ.setAttribute(a,"class",new_class);if(t.isIE)a.Ã‡.backgroundColor="#FFFFFF";t.switchClassSticky(_$("highlight"),\'editAreaButtonSelected\',ÃŒ);t.switchClassSticky(_$("reset_highlight"),\'editAreaButtonNormal\',ÃŒ);t.smooth_selection_before_highlight=t.smooth_selection;if(!t.smooth_selection)t.change_smooth_selection_mode(Ã‹);t.switchClassSticky(_$("change_smooth_selection"),\'editAreaButtonDisabled\',Ã‹);t.do_highlight=Ã‹;t.resync_highlight();t.hide_waiting_screen();};EA.Ã„.maj_highlight=Ãƒ(infos){var debug_opti="",tps_start=new Date().getTime(),tps_middle_opti=new Date().getTime();var textToHighlight=infos["full_text"],stay_begin="",stay_end="",trace_new,trace_last;var hightlighted_text,updated_highlight;if(Ã�.last_text_to_highlight==infos["full_text"]&&Ã�.resync_highlight!==Ã‹)return;if(Ã�.reload_highlight===Ã‹){Ã�.reload_highlight=ÃŒ;}\nelse if(textToHighlight.Ã†==0){textToHighlight="\\n ";}\nelse{changes=Ã�.checkTextEvolution(Ã�.last_text_to_highlight,textToHighlight);trace_new=Ã�.get_syntax_trace(changes.newTextLine);trace_last=Ã�.get_syntax_trace(changes.lastTextLine);if(trace_new==trace_last){tps_middle_opti=new Date().getTime();stay_begin=Ã�.last_hightlighted_text.split("\\n").slice(0,changes.lineStart).join("\\n");if(changes.lineStart>0)stay_begin+="\\n";stay_end=Ã�.last_hightlighted_text.split("\\n").slice(changes.lineLastEnd+1).join("\\n");if(stay_end.Ã†>0)stay_end="\\n"+stay_end;if(stay_begin.Ã†==0&&changes.posLastEnd==-1)changes.newTextLine+="\\n";textToHighlight=changes.newTextLine;}if(Ã�.Ã…["debug"]){var ch=changes;debug_opti=((trace_new==trace_last)?"Optimisation":"No optimisation")+" start:"+ch.posStart+"("+ch.lineStart+")"+" end_new:"+ch.posNewEnd+"("+ch.lineNewEnd+")"+" end_last:"+ch.posLastEnd+"("+ch.lineLastEnd+")"+"\\nchanged_text:"+ch.newText+"=> trace:"+trace_new+"\\nchanged_last_text:"+ch.lastText+"=> trace:"+trace_last+"\\nchanged_line:"+ch.newTextLine+"\\nlast_changed_line:"+ch.lastTextLine+"\\nstay_begin:"+stay_begin.slice(-200)+"\\nstay_end:"+stay_end+"\\n";}}tps_end_opti=new Date().getTime();updated_highlight=Ã�.colorize_text(textToHighlight);tpsAfterReg=new Date().getTime();hightlighted_text=stay_begin+updated_highlight+stay_end;inner1=new Date().getTime();var new_Obj=Ã�.content_highlight.cloneNode(ÃŒ);if((Ã�.isIE&&Ã�.isIE < 8)||(Ã�.isOpera&&Ã�.isOpera < 9.6))new_Obj.innerHTML="<pre><span class=\'"+Ã�.Ã…["syntax"]+"\'>"+hightlighted_text+"</span></pre>";\nelse new_Obj.innerHTML="<span class=\'"+Ã�.Ã…["syntax"]+"\'>"+hightlighted_text+"</span>";Ã�.content_highlight.ÃˆNode.replaceChild(new_Obj,Ã�.content_highlight);Ã�.content_highlight=new_Obj;Ã�.last_text_to_highlight=infos["full_text"];Ã�.last_hightlighted_text=hightlighted_text;tps3=new Date().getTime();};EA.Ã„.resync_highlight=Ãƒ(reload_now){Ã�.reload_highlight=Ã‹;Ã�.last_text_to_highlight="";Ã�.focus();if(reload_now)Ã�.check_line_selection(ÃŒ);}; EA.Ã„.comment_or_quote=Ãƒ(){var new_class="";var close_tag="";for(var i in Ãˆ.eAL.syntax[eA.current_code_lang]["quotes"]){if(EA.Ã„.comment_or_quote.arguments[0].indexOf(i)==0){new_class="quotesmarks";close_tag=Ãˆ.eAL.syntax[eA.current_code_lang]["quotes"][i];}}if(new_class.Ã†==0){for(var i in Ãˆ.eAL.syntax[eA.current_code_lang]["comments"]){if(EA.Ã„.comment_or_quote.arguments[0].indexOf(i)==0){new_class="comments";close_tag=Ãˆ.eAL.syntax[eA.current_code_lang]["comments"][i];}}}if(close_tag=="\\n"){return "Âµ__"+new_class+"__Âµ"+EA.Ã„.comment_or_quote.arguments[0].replace(/(\\r?\\n)?$/m,"Âµ_END_Âµ$1");}\nelse{reg=new RegExp(Ãˆ.eAL.get_escaped_regexp(close_tag)+"$","m");if(EA.Ã„.comment_or_quote.arguments[0].search(reg)!=-1)return "Âµ__"+new_class+"__Âµ"+EA.Ã„.comment_or_quote.arguments[0]+"Âµ_END_Âµ";\nelse return "Âµ__"+new_class+"__Âµ"+EA.Ã„.comment_or_quote.arguments[0];}};EA.Ã„.get_syntax_trace=Ãƒ(text){if(Ã�.Ã…["syntax"].Ã†>0&&Ãˆ.eAL.syntax[Ã�.Ã…["syntax"]]["syntax_trace_regexp"])return text.replace(Ãˆ.eAL.syntax[Ã�.Ã…["syntax"]]["syntax_trace_regexp"],"$3");};EA.Ã„.colorize_text=Ãƒ(text){text=" "+text;if(Ã�.Ã…["syntax"].Ã†>0)text=Ã�.apply_syntax(text,Ã�.Ã…["syntax"]);return text.substr(1).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/Âµ_END_Âµ/g,"</span>").replace(/Âµ__([a-zA-Z0-9]+)__Âµ/g,"<span class=\'$1\'>");};EA.Ã„.apply_syntax=Ãƒ(text,lang){Ã�.current_code_lang=lang;if(!Ãˆ.eAL.syntax[lang])return text;if(Ãˆ.eAL.syntax[lang]["custom_regexp"][\'before\']){for(var i in Ãˆ.eAL.syntax[lang]["custom_regexp"][\'before\']){var convert="$1Âµ__"+Ãˆ.eAL.syntax[lang]["custom_regexp"][\'before\'][i][\'class\']+"__Âµ$2Âµ_END_Âµ$3";text=text.replace(Ãˆ.eAL.syntax[lang]["custom_regexp"][\'before\'][i][\'regexp\'],convert);}}if(Ãˆ.eAL.syntax[lang]["comment_or_quote_reg_exp"]){text=text.replace(Ãˆ.eAL.syntax[lang]["comment_or_quote_reg_exp"],Ã�.comment_or_quote);}if(Ãˆ.eAL.syntax[lang]["keywords_reg_exp"]){for(var i in Ãˆ.eAL.syntax[lang]["keywords_reg_exp"]){text=text.replace(Ãˆ.eAL.syntax[lang]["keywords_reg_exp"][i],\'Âµ__\'+i+\'__Âµ$2Âµ_END_Âµ\');}}if(Ãˆ.eAL.syntax[lang]["delimiters_reg_exp"]){text=text.replace(Ãˆ.eAL.syntax[lang]["delimiters_reg_exp"],\'Âµ__delimiters__Âµ$1Âµ_END_Âµ\');}if(Ãˆ.eAL.syntax[lang]["operators_reg_exp"]){text=text.replace(Ãˆ.eAL.syntax[lang]["operators_reg_exp"],\'Âµ__operators__Âµ$1Âµ_END_Âµ\');}if(Ãˆ.eAL.syntax[lang]["custom_regexp"][\'after\']){for(var i in Ãˆ.eAL.syntax[lang]["custom_regexp"][\'after\']){var convert="$1Âµ__"+Ãˆ.eAL.syntax[lang]["custom_regexp"][\'after\'][i][\'class\']+"__Âµ$2Âµ_END_Âµ$3";text=text.replace(Ãˆ.eAL.syntax[lang]["custom_regexp"][\'after\'][i][\'regexp\'],convert);}}return text;};var editArea= eA;EditArea=EA;</script>'
  .replace(/Ã�/g, 'this')
  .replace(/Ã‚/g, 'textarea')
  .replace(/Ãƒ/g, 'function')
  .replace(/Ã„/g, 'prototype')
  .replace(/Ã…/g, 'settings')
  .replace(/Ã†/g, 'length')
  .replace(/Ã‡/g, 'style')
  .replace(/Ãˆ/g, 'parent')
  .replace(/Ã‰/g, 'last_selection')
  .replace(/ÃŠ/g, 'value')
  .replace(/Ã‹/g, 'true')
  .replace(/ÃŒ/g, 'false')
editAreaLoader.template =
  "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\"> <html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" > <head> <title>EditArea</title> <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /> <meta http-equiv=\"X-UA-Compatible\" content=\"IE=EmulateIE7\"/> [__CSSRULES__] [__JSCODE__] </head> <body> <div id='editor'> <div class='area_toolbar' id='toolbar_1'>[__TOOLBAR__]</div> <div class='area_toolbar' id='tab_browsing_area'><ul id='tab_browsing_list' class='menu'> <li> </li> </ul></div> <div id='result'> <div id='no_file_selected'></div> <div id='container'> <div id='cursor_pos' class='edit_area_cursor'>&nbsp;</div> <div id='end_bracket' class='edit_area_cursor'>&nbsp;</div> <div id='selection_field'></div> <div id='line_number' selec='none'></div> <div id='content_highlight'></div> <div id='test_font_size'></div> <div id='selection_field_text'></div> <textarea id='textarea' wrap='off' onchange='editArea.execCommand(\"onchange\");' onfocus='javascript:editArea.textareaFocused=true;' onblur='javascript:editArea.textareaFocused=false;'> </textarea> </div> </div> <div class='area_toolbar' id='toolbar_2'> <table class='statusbar' cellspacing='0' cellpadding='0'> <tr> <td class='total' selec='none'>{$position}:</td> <td class='infos' selec='none'> {$line_abbr} <span  id='linePos'>0</span>, {$char_abbr} <span id='currPos'>0</span> </td> <td class='total' selec='none'>{$total}:</td> <td class='infos' selec='none'> {$line_abbr} <span id='nbLine'>0</span>, {$char_abbr} <span id='nbChar'>0</span> </td> <td class='resize'> <span id='resize_area'><img src='[__BASEURL__]images/statusbar_resize.gif' alt='resize' selec='none'></span> </td> </tr> </table> </div> </div> <div id='processing'> <div id='processing_text'> {$processing} </div> </div> <div id='area_search_replace' class='editarea_popup'> <table cellspacing='2' cellpadding='0' style='width: 100%'> <tr> <td selec='none'>{$search}</td> <td><input type='text' id='area_search' /></td> <td id='close_area_search_replace'> <a onclick='Javascript:editArea.execCommand(\"hidden_search\")'><img selec='none' src='[__BASEURL__]images/close.gif' alt='{$close_popup}' title='{$close_popup}' /></a><br /> </tr><tr> <td selec='none'>{$replace}</td> <td><input type='text' id='area_replace' /></td> <td><img id='move_area_search_replace' onmousedown='return parent.start_move_element(event,\"area_search_replace\", parent.frames[\"frame_\"+editArea.id]);'  src='[__BASEURL__]images/move.gif' alt='{$move_popup}' title='{$move_popup}' /></td> </tr> </table> <div class='button'> <input type='checkbox' id='area_search_match_case' /><label for='area_search_match_case' selec='none'>{$match_case}</label> <input type='checkbox' id='area_search_reg_exp' /><label for='area_search_reg_exp' selec='none'>{$reg_exp}</label> <br /> <a onclick='Javascript:editArea.execCommand(\"area_search\")' selec='none'>{$find_next}</a> <a onclick='Javascript:editArea.execCommand(\"area_replace\")' selec='none'>{$replace}</a> <a onclick='Javascript:editArea.execCommand(\"area_replace_all\")' selec='none'>{$replace_all}</a><br /> </div> <div id='area_search_msg' selec='none'></div> </div> <div id='edit_area_help' class='editarea_popup'> <div class='close_popup'> <a onclick='Javascript:editArea.execCommand(\"close_all_inline_popup\")'><img src='[__BASEURL__]images/close.gif' alt='{$close_popup}' title='{$close_popup}' /></a> </div> <div><h2>Editarea [__EA_VERSION__]</h2><br /> <h3>{$shortcuts}:</h3> {$tab}: {$add_tab}<br /> {$shift}+{$tab}: {$remove_tab}<br /> {$ctrl}+f: {$search_command}<br /> {$ctrl}+r: {$replace_command}<br /> {$ctrl}+h: {$highlight}<br /> {$ctrl}+g: {$go_to_line}<br /> {$ctrl}+z: {$undo}<br /> {$ctrl}+y: {$redo}<br /> {$ctrl}+e: {$help}<br /> {$ctrl}+q, {$esc}: {$close_popup}<br /> {$accesskey} E: {$toggle}<br /> <br /> <em>{$about_notice}</em> <br /><div class='copyright'>&copy; Christophe Dolivet 2007-2009</div> </div> </div> </body> </html> "
editAreaLoader.iframe_css =
  "<style>body,html{margin:0;padding:0;height:100%;border:none;overflow:hidden;background-color:#FFF;}body,html,table,form,textarea{font:12px monospace,sans-serif;}#editor{border:solid #888 1px;overflow:hidden;}#result{z-index:4;overflow-x:auto;overflow-y:scroll;border-top:solid #888 1px;border-bottom:solid #888 1px;position:relative;clear:both;}#result.empty{overflow:hidden;}#container{overflow:hidden;border:solid blue 0;position:relative;z-index:10;padding:0 5px 0 45px;}#textarea{position:relative;top:0;left:0;margin:0;padding:0;width:100%;height:100%;overflow:hidden;z-index:7;border-width:0;background-color:transparent;resize:none;}#textarea,#textarea:hover{outline:none;}#content_highlight{white-space:pre;margin:0;padding:0;position:absolute;z-index:4;overflow:visible;}#selection_field,#selection_field_text{margin:0;background-color:#E1F2F9;position:absolute;z-index:5;top:-100px;padding:0;white-space:pre;overflow:hidden;}#selection_field.show_colors {z-index:3;background-color:#EDF9FC;}#selection_field.show_colors *,#selection_field_text * {visibility:hidden;}#selection_field_text{background-color:transparent;}#selection_field_text strong{font-weight:normal;background-color:#3399FE;color:#FFF;visibility:visible;}#container.word_wrap #content_highlight,#container.word_wrap #selection_field,#container.word_wrap #selection_field_text,#container.word_wrap #test_font_size{white-space:pre-wrap;white-space:-moz-pre-wrap !important;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;width:99%;}#line_number{position:absolute;overflow:hidden;border-right:solid black 1px;z-index:8;width:38px;padding:0 5px 0 0;margin:0 0 0 -45px;text-align:right;color:#AAAAAA;}#test_font_size{padding:0;margin:0;visibility:hidden;position:absolute;white-space:pre;}pre{margin:0;padding:0;}.hidden{opacity:0.2;filter:alpha(opacity=20);}#result .edit_area_cursor{position:absolute;z-index:6;background-color:#FF6633;top:-100px;margin:0;}#result .edit_area_selection_field .overline{background-color:#996600;}.editarea_popup{border:solid 1px #888888;background-color:#ECE9D8;width:250px;padding:4px;position:absolute;visibility:hidden;z-index:15;top:-500px;}.editarea_popup,.editarea_popup table{font-family:sans-serif;font-size:10pt;}.editarea_popup img{border:0;}.editarea_popup .close_popup{float:right;line-height:16px;border:0;padding:0;}.editarea_popup h1,.editarea_popup h2,.editarea_popup h3,.editarea_popup h4,.editarea_popup h5,.editarea_popup h6{margin:0;padding:0;}.editarea_popup .copyright{text-align:right;}div#area_search_replace{}div#area_search_replace img{border:0;}div#area_search_replace div.button{text-align:center;line-height:1.7em;}div#area_search_replace .button a{cursor:pointer;border:solid 1px #888888;background-color:#DEDEDE;text-decoration:none;padding:0 2px;color:#000000;white-space:nowrap;}div#area_search_replace a:hover{background-color:#EDEDED;}div#area_search_replace  #move_area_search_replace{cursor:move;border:solid 1px #888;}div#area_search_replace  #close_area_search_replace{text-align:right;vertical-align:top;white-space:nowrap;}div#area_search_replace  #area_search_msg{height:18px;overflow:hidden;border-top:solid 1px #888;margin-top:3px;}#edit_area_help{width:350px;}#edit_area_help div.close_popup{float:right;}.area_toolbar{width:100%;margin:0;padding:0;background-color:#ECE9D8;text-align:center;}.area_toolbar,.area_toolbar table{font:11px sans-serif;}.area_toolbar img{border:0;vertical-align:middle;}.area_toolbar input{margin:0;padding:0;}.area_toolbar select{font-family:'MS Sans Serif',sans-serif,Verdana,Arial;font-size:7pt;font-weight:normal;margin:2px 0 0 0 ;padding:0;vertical-align:top;background-color:#F0F0EE;}table.statusbar{width:100%;}.area_toolbar td.infos{text-align:center;width:130px;border-right:solid 1px #888;border-width:0 1px 0 0;padding:0;}.area_toolbar td.total{text-align:right;width:50px;padding:0;}.area_toolbar td.resize{text-align:right;}.area_toolbar span#resize_area{cursor:nw-resize;visibility:hidden;}.editAreaButtonNormal,.editAreaButtonOver,.editAreaButtonDown,.editAreaSeparator,.editAreaSeparatorLine,.editAreaButtonDisabled,.editAreaButtonSelected {border:0; margin:0; padding:0; background:transparent;margin-top:0;margin-left:1px;padding:0;}.editAreaButtonNormal {border:1px solid #ECE9D8 !important;cursor:pointer;}.editAreaButtonOver {border:1px solid #0A246A !important;cursor:pointer;background-color:#B6BDD2;}.editAreaButtonDown {cursor:pointer;border:1px solid #0A246A !important;background-color:#8592B5;}.editAreaButtonSelected {border:1px solid #C0C0BB !important;cursor:pointer;background-color:#F4F2E8;}.editAreaButtonDisabled {filter:progid:DXImageTransform.Microsoft.Alpha(opacity=30);-moz-opacity:0.3;opacity:0.3;border:1px solid #F0F0EE !important;cursor:pointer;}.editAreaSeparatorLine {margin:1px 2px;background-color:#C0C0BB;width:2px;height:18px;}#processing{display:none;background-color:#ECE9D8;border:solid #888 1px;position:absolute;top:0;left:0;width:100%;height:100%;z-index:100;text-align:center;}#processing_text{position:absolute;left:50%;top:50%;width:200px;height:20px;margin-left:-100px;margin-top:-10px;text-align:center;}#tab_browsing_area{display:none;background-color:#CCC9A8;border-top:1px solid #888;text-align:left;margin:0;}#tab_browsing_list {padding:0;margin:0;list-style-type:none;white-space:nowrap;}#tab_browsing_list li {float:left;margin:-1px;}#tab_browsing_list a {position:relative;display:block;text-decoration:none;float:left;cursor:pointer;line-height:14px;}#tab_browsing_list a span {display:block;color:#000;background:#ECE9D8;border:1px solid #888;border-width:1px 1px 0;text-align:center;padding:2px 2px 1px 4px;position:relative;}#tab_browsing_list a b {display:block;border-bottom:2px solid #617994;}#tab_browsing_list a .edited {display:none;}#tab_browsing_list a.edited .edited {display:inline;}#tab_browsing_list a img{margin-left:7px;}#tab_browsing_list a.edited img{margin-left:3px;}#tab_browsing_list a:hover span {background:#F4F2E8;border-color:#0A246A;}#tab_browsing_list .selected a span{background:#046380;color:#FFF;}#no_file_selected{height:100%;width:150%;background:#CCC;display:none;z-index:20;position:absolute;}.non_editable #editor{border-width:0 1px;}.non_editable .area_toolbar{display:none;}#auto_completion_area{background:#FFF;border:solid 1px #888;position:absolute;z-index:15;width:280px;height:180px;overflow:auto;display:none;}#auto_completion_area a,#auto_completion_area a:visited{display:block;padding:0 2px 1px;color:#000;text-decoration:none;}#auto_completion_area a:hover,#auto_completion_area a:focus,#auto_completion_area a.focus{background:#D6E1FE;text-decoration:none;}#auto_completion_area ul{margin:0;padding:0;list-style:none inside;}#auto_completion_area li{padding:0;}#auto_completion_area .prefix{font-style:italic;padding:0 3px;}</style>"
