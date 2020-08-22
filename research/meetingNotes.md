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

var response = jsonPath(pageParamJSON , "$..[?(@.componentId=='bmlCodeEditor')].data").toJSONString();

jsonRespStr = "{}";

var response = jsonPath(jsonRespStr , "$..[?(@.componentId=='bmlCodeEditor')].data").toJSONString();

.toJSONString();

- [ ] message passing
    branches
- [ ] saving blank/bml file or passing into text editor

### DISCUSSION

- [x] grab fs from laptop
- [ ] define file structure ->
-> BmProjects
    -> cdk.bigmachines.com
        -> config
        -> commerce
        -> file manager
        -> utils
            -> function.test.bml
            -> function.bml

### EXTRA CREDIT

- [ ] looking for 1st version of big tools - ON HOLD
- [ ] research convert to :) vscode format
- [ ] chrome.browserAction.setBadgeText(object details, function callback)

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
