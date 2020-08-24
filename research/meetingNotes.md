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

### DELIVERABLES

- [x] correct json path expression for bml code
    `$..[?(@.componentId=='bmlCodeEditor')].data`
    jsonRespStr
    <http://www.jsonquerytool.com/>

jsonRespStr = "{}";

var response = jsonPath(jsonRespStr.toJSON() , "$..[?(@.componentId=='bmlCodeEditor')].data");

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

## 8/2

### DEVLIVERABLES

## UNLOAD

-[] FIX - var response = jsonPath(jsonRespStr , "$..[?(@.componentId=='bmlCodeEditor')].data");
-[] messagePassing

-------------------------

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
