# Meeting Notes

## 8/13/20

60 hrs/week max

Things to focus on for sundays meeting:

1) How to get code out of editor. Maybe in hidden attribute. Look into webservice call.

2) Test out native file sys API.

Meeting Structure:

weds - indepth
sat - q and a

## 8/16/20

## 8/19/20

- [ ] DOM BML
- [ ] json path to bml code - x.widget.items[1].component.widget.items[1].component.widget.items[0].component.data
- [ ] big too hoss

## 8/23/20

### DELIVERABLES 1

- [x] correct json path expression for bml code
    `$..[?(@.componentId=='bmlCodeEditor')].data`
    jsonRespStr
    <http://www.jsonquerytool.com/>

jsonRespStr = "{}";

var response = jsonPath(jsonRespStr.toJSON() , "$..[?(@.componentId=='bmlCodeEditor')].data");

jsonPath(jsonRespStr, "$..[?(@.componentId=='bmlCodeEditor')].data");

- [ ] message passing
    - [x] branch - messagePassing - WIP - <https://stackoverflow.com/questions/20019958/chrome-extension-how-to-send-data-from-content-script-to-popup-html>
- [ ] saving blank/bml file or passing into text editor
    - [] save code

<https://github.com/loganbek/text-editor>
<https://googlechromelabs.github.io/text-editor/>
<https://groups.google.com/a/chromium.org/g/chromium-extensions/c/R80PmfqEI6k?pli=1>

### DISCUSSION

- [x] grab fs from laptop
- [ ] define initial file structure -> Chris pull req
-> BmProjects
    -> devmcnichols
        -> config - chris breakout further
        -> commerce
            -> pricing.test.bml
            -> pricing.bml
        -> utils
            -> function.test.bml
            -> function.bml

- [ ] test script functionality
    maybe $..[?(@.componentId=='mainScriptForm')].data")

### EXTRA CREDIT

- [ ] loading bml
- [ ] looking for 1st version of big tools - ON HOLD
- [x] research convert to :) vscode format
- [ ] chrome.browserAction.setBadgeText(object details, function callback)

## 8/27/20

### DEVLIVERABLES 2

## UNLOAD

- [ ] FIX - var response = jsonPath(jsonRespStr , "$..[?(@.componentId=='bmlCodeEditor')].data");
- [x] - WORKING -> jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
- [x] messagePassing
jsonPath(jsonRespStr, "$.[?(@.componentId=='bmlCodeEditor')].data");

## 8/31/20

- [ ] use $.widget.items[1].component.widget.items[1].component.widget.items[0].component.data" for now
- [ ] json path lib that supports query
- [x] test mp w code
- [x] isolate why mp errors - erros on reload of extension w/o page refresh

## 9/6/20

### DELIVERABLES 3

1) - [x] chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) { <- size limit
There does not appear to be a limit or atleast there isn't one mentioned in the docs: <https://developer.chrome.com/extensions/runtime#event-onMessage>
works fine for pricing in devMcnichols - 3972 loc

2) - [x] use $.widget.items[1].component.widget.items[1].component.widget.items[0].component.data" for now
- [ ] json path lib that supports query
- maybe jsonpath-1.0.2.js

### DISCUSSION

- [x] UNLOAD E2E
- [ ] LOAD BML - approach update jsonRespStr via injected.js or a write version
- [ ] Test Scripts
    - [ ] can i get a few samples
    - [ ] id="useScript", inputType="checkbox"
    - [ ] UNLOAD - WIP
        - [ ] jsonpath to testscript
- [ ] Options/Bells + Whistles
    - [ ] chrome data sync api - https://developer.chrome.com/extensions/storage
- [ ] Comment Headers
    - [ ] username
    - [ ] date
- [ ] Other Commerce Pages besides library functions

####

Next Verison (Working POC) v0.1.0 alpha:
    - [ ] finish LOAD BML
        - [x] READ
        - [ ] pass from content.js -> inject.js
        - [ ] update DOM in inject.js   
    - [ ] hide functionality besides LOAD BML/UNLOAD BML

#### BACK_BURNER

- [ ] json path lib that supports query
    - [ ] maybe jsonpath-1.0.2.js
- [ ] Directory Structure <- Pull Req
- [ ] Multi OS Support (Linux/Windows)
- [ ] Multi Editor Support
- [ ] Repo Badging
- [ ] Icon lock badge (when unloaded)
- [ ] Dark Mode

### TODO:

- [ ] file should overwrite instead of `pricing (1).bml` and `pricing.test (1).bml`. 
- [ ] cleanup
- [ ] isolate save dialog setting - WIP

### DELIVERABLES 4

- LOAD - 

```html
<textarea id="textarea" wrap="off" onchange="editArea.execCommand(&quot;onchange&quot;);" onfocus="javascript:editArea.textareaFocused=true;" onblur="javascript:editArea.textareaFocused=false;" style="width: 5919px; height: 2355px; font-family: monospace; font-size: 10pt; line-height: 15px; margin-left: 0px; margin-top: 0px;" classname="null hidden" class="null hidden" spellcheck="false"> </textarea>
```

- POC 
- extend to util and config
- big tools additonal features

## 9/9/20

## 9/13/20

## 9/16/20

## 9/23/20

## 9/27/20

## 9/30/20

## 10/4/20

<!-- 
TODO: Streamline Tools v0.1.0-alpha Release

High Level User Flow

1) Install Extension.
2) Install VSCode + BML extension (CPQ Consultatnt).
2) Extension correctly detects whether it is looking @ BM (color) or another Page (transparent).
3) User goes to BM pricing function.
4) User presses "Unload BML" in popup.
5) pricing.bml opens in VSCode.
6) User saves file.
7) User presses "Loal BML" in popup.
-->
