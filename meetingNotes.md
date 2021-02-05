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

### DISCUSSION 1

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

### EXTRA CREDIT 1

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

### DISCUSSION 3

- [x] UNLOAD E2E
- [ ] LOAD BML - approach update jsonRespStr via injected.js or a write version
- [ ] Test Scripts
  - [ ] can i get a few samples
  - [ ] id="useScript", inputType="checkbox"
  - [ ] UNLOAD - WIP
    - [ ] jsonpath to testscript
- [ ] Options/Bells + Whistles
  - [ ] chrome data sync api - <https://developer.chrome.com/extensions/storage>
- [ ] Comment Headers
  - [ ] username
  - [ ] date
- [ ] Other Commerce Pages besides library functions

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

### TODO

- [ ] file should overwrite instead of `pricing (1).bml` and `pricing.test (1).bml`.
- [ ] cleanup
- [ ] isolate save dialog setting - WIP

### DELIVERABLES 4

- LOAD -

TEXT AREA onchange JS

```html
<textarea id="textarea" wrap="off" onchange="editArea.execCommand(&quot;onchange&quot;);" onfocus="javascript:editArea.textareaFocused=true;" onblur="javascript:editArea.textareaFocused=false;" style="width: 5919px; height: 2355px; font-family: monospace; font-size: 10pt; line-height: 15px; margin-left: 0px; margin-top: 0px;" classname="null hidden" class="null hidden" spellcheck="false"> </textarea>
```

UPDATE jsonRespStr - don't think will work
UPDATE text area innerHTML

- POC
  - comment header (no footer)
  - finish load
  - maybe test scripts
- extend to util and config and finish commerce
  - [ ] commerce quote actions
    - [ ] comm vs config rules
    - [ ] 3 diff page types -
      - rules
      - commerce advanced function - before and after
      - comm lib + util
  - [x] util
  - [ ] config - THIS IS GOING TO BE A BEAST
- [ ] big tools additonal features

## 9/9/20

## 9/13/20

TODO:

- [x] frame_bm_script.editArea.textarea.value = "REPLACED"; <- Just need this.
- [x] load code pass
- [x] frame nav

- [x] test in chrome
- [ ] mozilla firefox browsers

## 9/16/20

- DISCUSSION

- v0.1.0-alpha release -> v1.1.0-alpha release
- Bugs/Issues/Feature Requests + Tracking!
- [ ] Comment Header - Format I'm thinking

```javascript
/*
@param
 - partNumList (String[])
 - partNumDict (String[] Dictionary)
 - qtyDict (Integer Dictionary)
 - priceDict (Float Dictionary)
 - accumulate (String)
@return
 - priceDict (Float Dictionary)
*/
```

- spoof filesystemhandle to fix load: <https://wicg.github.io/native-file-system/#filesystemhandle>
- <https://github.com/excalidraw/excalidraw/issues/169>

Streamline Tools v0.2.0-alpha Release:

- Bug Fixes:
  - [ ] no longer request file dialog on LOAD (spoof fileSystemFileHandle).

-Features:

- Comment Header - WIP
  - [x] inject.js should grab paramters.
  - [ ] inject.js should pass parameters + return type to content.js.
- Test Scripts - WIP
  - [ ] UNLOAD
  - [ ] LOAD

FUTURE:
Other page types

Open a link in a new window - Hold Shift and click the link
Put a cursor in the search bar - Hold Command and press L

### COMMERCE

- config - rules

- commerce advanced function - before and after
- <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=54983795&doc_id=4653823>
- <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795>
- Define Function - editPreModifyFunction();
- Define Function - editModifyFunction();
- Define Function - editValidation();

- Apply
- Update
- Update and New
- Clone
- Back

APPLY

```html
<table onclick="javascript:bmSubmitForm('edit_action.jsp', document.bmForm, bmValidateForm0, 'addCmAction', false, false, false);bmCancelBubble(event)" onmouseover="bmButtonMouseOver(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')" onmousedown="bmButtonMouseDown(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')" onmouseup="bmButtonMouseUp(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')" onmouseout="bmButtonMouseOut(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')" class="plain-button" cellspacing="0" cellpadding="0" role="button" aria-label="Apply" style="cursor: pointer;">
 <tbody><tr>
  <td class="button-left"><img class="button-left" src="/img/button10.gif"></td>
  <td class="button-middle" nowrap="true"><div style="margin: 0px 0px 1px;"><a class="button-text" name="apply" id="apply" href="#">Apply</a></div></td>  <td class="button-right"><img class="button-right" src="/img/button10.gif"></td>
 </tr>
</tbody></table>
```

```html
<table onclick="javascript:editPreModifyFunction();bmCancelBubble(event)" onmouseover="bmButtonMouseOver(this,'javascript:editPreModifyFunction()')" onmousedown="bmButtonMouseDown(this,'javascript:editPreModifyFunction()')" onmouseup="bmButtonMouseUp(this,'javascript:editPreModifyFunction()')" onmouseout="bmButtonMouseOut(this,'javascript:editPreModifyFunction()')" class="plain-button" cellspacing="0" cellpadding="0" role="button" aria-label="Define Function" style="cursor: pointer;">
 <tbody><tr>
  <td class="button-left"><img class="button-left" src="/img/button10.gif"></td>
  <td class="button-middle" nowrap="true"><div style="margin: 0px 0px 1px;"><a class="button-text" name="define_function" id="define_function" href="#">Define Function</a></div></td>  <td class="button-right"><img class="button-right" src="/img/button10.gif"></td>
 </tr>
</tbody></table>
```

- commerce rules - constraint, hiding, etc.
- <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759>
- <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_function.jsp>
- `<a class="button-text" name="save_and_close" id="save_and_close" href="#">`"Save and Close</a>

### CONFIG

- config rules
<https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true>

## 9/27/20

### DISCUSSION

- v0.2.0-alpha
- Do you want auto "run" on TEST SCRIPT LOAD? Should function similiar to valide on BML LOAD
- <https://wicg.github.io/file-system-access/#process-accept-types>
- <https://www.intego.com/mac-security-blog/master-the-macos-open-and-save-dialogs/> - OPEN hotkeys

SUGGESTED USAGE
alt-tab between chrome and vscode
hotkeys for load

## 9/30/20

## 10/4/20

<https://developer.chrome.com/apps/commands>

<https://developer.chrome.com/extensions/declarativeContent>

<https://developers.chrome.com/extensions/windows>

- [x] add variableName of function to comment header
- [x] auto run on test script load
- options 2filesystemhandler load - WIP, maybe not possible

- [x] page state matcher improved
- [x] bigmachines directory

- [x] repository on options page mock
- [ ] LOAD TEST CODE all commerce functions
  - [x] pricing
  - [x] emailNotificationGenerator
  - [x] printing
  - [x] createMasterGroupString
  - [x] checkAdHocLineItems
  - [x] resetIntegrationIDsForSFDC
  - [x] ensurePrimaryForOracle
  - [x] actionValidations
  - [ ] setAttributeABasedOnAttributeB
  - [ ] populateLineData
  - [ ] checkLineItemsAvailability
  - [ ] getItemAvailabilityPerSOAP
  - [ ] calculateFreight
  - [ ] validateTaxAreaID
  - [ ] getParentModelNumber
  - [ ] validateShipToAddress
  - [ ] getFormattedAddressDetailsOfVendorShipTo
  - [ ] thresholdInitialisation
  - [ ] changeQuoteOwnerForCPSQuote
  - [ ] cPSPricing
  - [ ] test
  - [ ] getFreightSoapCall
  - [ ] attachmentDateModified
  - [ ] getCPSStatus
  - [ ] cPSDataString
  - [ ] getVendorDict
  - [x] getOpsInstructionsData
  - [ ] getConversionRate
  - [ ] updateApprovalsData
  - [ ] getTotalTax
  - [ ] getCarrierData
  - [ ] setModelTotal
  - [ ] prepareViewAllRFQData

- [ ] LOAD TEST CODE all util functions

- [x] getVolumePricing
- [ ] getMaxDiscount - WIP
- [ ] sortCutSizesBasedonArea
- [ ] addCalculationRelatedColumns
- [ ] addCutSizesToSheetCalTable
- [ ] updateCRWithNewQuantity
- [ ] getAllBranchesFromAvailableSheets
- [ ] getSheetsFromSpecifiedBranch
- [ ] updateBranchSpecificSheetsInAllAvailableSheets
- [ ] getPartInformation
- [ ] etXMLNodesByTag
- [ ] convertExponentialNumbersToRealValue
- [ ] translateExponentials
- [ ] getAvailQtyValueForPart
- [ ] getAvailableQuanityInBranch
- [ ] getSelectedSheetOrCount
- [ ] calculateLaborCharges
- [ ] getProcessesResultInformation
- [ ] getLaborChargesOfSpecificStrategy
- [ ] resetCutSizeReductions
- [ ] updateUserEnteredQuantitiesInSelectedSheetsArray
- [ ] getBranchNameFromBranchCode
- [ ] updateSelectedStockItemsArray
- [ ] calculateGYFromLaborChargesString
- [ ] addProcessedItemsToSelectedItemsArray
- [ ] getApplicalbeBranchesAndUpdateQuantitiesBasedOnStrategy
- [ ] processCalculations
- [ ] getEfficientSheetIndex
- [ ] addDropSheetsToAvailableSheets
- [ ] GetBarWidth
- [ ] recommendAccessoriesForSelectedItems
- [ ] recommendItemsStockProcessed
- [ ] getSelectedKitItemsInAvailabilityArray
- [ ] recommendItemsStockProcessed2
- [ ] updateSelectedStockItemsInformation
- [ ] getSelectedItemsFromAvailabilityArray
- [ ] prepareFreightRequest
- [ ] calculateLaborAndItemWeight
- [ ] getTotalChargeOfItems
- [ ] calculatePercentageOfLengthUsed
- [ ] calculateProcessedItemUtilizationYieldAndPrice
- [ ] updateSelectedStockItemsData
- [ ] sortingBasedOnPrice
- [ ] selectItemsFromAvailabilityArray
- [ ] getXMLNodesByTagV2
- [ ] processedItemsApprovalCheck
- [ ] getItemsAvailabilityInformation
- [ ] getSelectedItemsAvailabileQuantityInBranch
- [ ] getSubstringBasedOnCriteria
- [ ] lookupWorkCenterExclusions
- [ ] buildCPSDataString
- [ ] getCPSVendorDict
- [ ] calculateExternalProcessingFreight
- [ ] setRFQResponseVideData
- [ ] advancedCommerceRule
- [ ] getNumberOfUnits
- [ ] setCPSAttributes
- [ ] getOpsInstructionsData
- [ ] removeDimensions
- [ ] getProcessedDiscounts
- [ ] getProcessedDiscountsTableData
- [ ] iSValidCustomPartNumber
- [ ] updateRFQViewPricesOnReconfigure
- [ ] updateTransactionUsingSOAP
- [ ] saveTransactionUsingRest
- [ ] setEfficientSheetIndex
- [ ] getEfficientSheetIndex_2

### DISCUSSION 2

- [ ] walk through remaining pages and verify functionality
  - [ ] commerce rules auto check or auto run??
- [ ] file naming for non commerce + util functions (email)
- [x] research remaining page types  
- [ ]

- [ ] expected git repo functionality in options vs. local git management
- [ ] LOGGING

TALK ABOUT
Yes that's correct.  I believe you tested before and confirmed the Extension runs even when you open the BML Editor in a new window versus another tab.  We need the Load and Unload to run on the BML Editor window but ideally we can find a way to Load either the Before Formulas or After Formulas from the "General" tab on the Attribute page.  I think Tat even had separate buttons in the extention to handle this but I may be making that up.

TODO:

- [x] multiple content scripts in manifest
  - [ ] create content script for each page
    - [ ] adminCommerceContent.js
    - [ ] adminConfigContent.js
    - [ ] adminRulesContent.js
    - [x] content.js
  - [ ] create injected.js for each page
    - [ ] adminCommerceInjected.js
    - [ ] admintConfigInjected.js
    - [ ] adminRulesInjected.js
    - [x] injected.js

### SRS BUSINESS

- [x] page state matcher for commerce action
- [ ] addVendor_quote as example
- [x] code for launching from console - [Define Function]
- [ ] BML EDITOR AREA
- [x] add page specific injectors to content.js

### GUI

- [x] add cute options and logging icon
- [x] page spectific button disabling

- ADVANCED MODIFY BEFORE

- ADVANCED MODIFY AFTER

- addVendor_quote.beforeFormulas.bml

### DISCUSSION 4

- [x] page specific button disable
- [x] code from console functionality (COMMERCE)
  - [x] document.querySelector("#textarea").value = "test";
  - [x] document.querySelector("#textarea").textareaFocused = true;
- [ ] Unchecked runtime.lastError: The message port closed before a response was received. -- DEBUG
  - [z] comment out adminCommerceContent.js + try with content.js -- STILL FAILS
  - [ ] look into executeScript
    - [ ] implement executeScript Trials

  <https://stackoverflow.com/questions/59913934/chrome-extension-error-unchecked-runtime-lasterror-the-message-port-closed-bef>
  <https://hackr.io/blog/how-to-make-a-chrome-extension>
- [ ] query previous tab for variable name
  - [ ] write code
- [ ]

### NEXT TIME

- [x] new release
- [ ] thourough testing -> maybe move to BETA
- [x] gray on disable (non color) button

### LOW PRIORITY/LONG TERM

- [x] research admin action functionality + POC
- [ ] think through logging
- [ ] think through options github integration
- [ ] rm research + unnecessary files
- [ ] gitpod functionality
- [ ] VR functionality
  - [ ] via parrallels desktop
  - [ ] via Chrome andriod app sidequest?
<https://developer.chrome.com/extensions/content_scripts#pi>
<https://stackoverflow.com/questions/20764517/execute-script-after-click-in-popup-html-chrome-extension>

#### ACTIONS

- [ ] Actions Naming
- Pre Page w/ Define Function button - <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=54983795&doc_id=4653823>
- Post Page w/ Editor - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795>
- addVendor_quote.beforeFormulas.bml - window.name
"advancedPreModify"
- addVendor_quote.afterForumulas.bml - window.name
"advancedModify"

#### RULES

- [ ] Rule Naming
- [ ] COVERS - CONSTRAINT - HIDING - VALIDATION
- COMMERCE rules - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759>
- EDIT FUNCTION - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_function.jsp>

- CONFIG rules
- RECOMMENDATIONS <https://devmcnichols.bigmachines.com/admin/configuration/rules/list_rules.jsp?rule_type=1&segment_id=11&ref_type=2&ref_category=1&ref_id=11&attribute_category=2&_fromQlink=0>
  - INDIVIDUAL CONFIG

- CONSTRAINTS <https://devmcnichols.bigmachines.com/admin/configuration/rules/list_rules.jsp?rule_type=2&segment_id=11&ref_type=2&ref_category=1&ref_id=11&attribute_category=2&_fromQlink=0>
  - INDIVIDUAL CONSTRAINT

- HIDING ATTRIBUTE <https://devmcnichols.bigmachines.com/admin/configuration/rules/list_rules.jsp?rule_type=11&segment_id=11&ref_type=2&ref_category=1&ref_id=11&attribute_category=2&_fromQlink=0>
  - INDIVIDUAL HIDING -

- RECOMMENDED ITEMS - <https://devmcnichols.bigmachines.com/admin/configuration/rules/list_rules.jsp?rule_type=9&segment_id=11&ref_type=2&ref_category=1&ref_id=11&attribute_category=2&_fromQlink=0>
  - INDIVIDUAL REC - <https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=9605806&rule_type=9&pline_id=-1&segment_id=11&model_id=-1&fromList=true?>

#### SMOKE TEST

##### Commerce Libraries - COMPLETE

- [x] UNLOAD
- [x] LOAD - Auto Verify
- [x] UNLOAD TEST
- [x] LOAD TEST - Auto Run

##### Util Libraries - COMPLETE

- [x] UNLOAD
- [x] LOAD - Auto Verify
- [x] UNLOAD TEST
- [x] LOAD TEST - Auto Run

##### Commerce Rules - WIP (filenaming)

ADD EX) for constraint, hiding, + validation

EX) constrainMultipleFreightGridSelects

- [x] UNLOAD
  - incorrect naming
  - problem scoping
  - #x-auto-214-input
  - document.querySelector("#x-auto-214-input")
  - constrainMultipleFreightGridSelects
- [x] LOAD + Auto Check

##### Commerce Actions - WIP (varname/filenaming)

EX) addVendor_quote

- [X] UNLOAD w/ hardcoding
  - [ ] (needs filenaming fix)
  - problem scoping
    - Pre Page w/ Define Function button - <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=54983795&doc_id=4653823>
  - Post Page w/ Editor - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795>
  - addVendor_quote.beforeFormulas.bml - window.name "advancedPreModify"
  - addVendor_quote.afterForumulas.bml - window.name "advancedModify"
    - don't have access to variablename on editor page
    - document.querySelector("#general > table > tbody > tr:nth-child(3) > td.form-input > input[type=hidden]") to maybe store var before hand, or use tab query
- [x] LOAD + Auto Check

##### Configuration Rules

- [x] WIP - UNLOAD
  [ ] - need to store varname on previous page or query for it
- [ ] WIP - LOAD + Auto Validate
  - [ ]

EX) Recommendation - sortBranchBasedOnZipCode

- input id for var name - x-auto-3-input
  - weird editor frame naming - frame_x-auto-143-area
  - validate button
  //Perform Validation
    `document.getElementsByClassName('x-btn-text ')[16].click();`

EX) Constraint - constraintProductTypesWhenProductAccessories

- input id for var name - x-auto-3-input
  - weird editor frame naming -
  - frame_x-auto-166-area
  - validate button - x-btn-text (maybe look at filter elements post getElementsByClassName)

EX) Hiding Attribute - hidingAdvancedOptions

- input id for var name - x-auto-3-input
  - weird editor frame naming - frame_x-auto-110-area
  - validate button

EX) Recommended Items - recommendStockItems

- input id for var name - x-auto-3-input
  - weird editor frame naming - frame_x-auto-116-area
  - validate button - x-btn-text

##### 10/25/20

- successful execute script fix 🥳 - no longer blocking 🚫🛡️
- demo commerce actions
  - filename issue
    - partially functioning w/ using window.name either "advancedModify" or "advancedPreModify"
      - store variable name in injected
    - if not query previous tab code to get variableName - WIP
- configuration issues
  - bm frame naming
    - [ ] problem scoping
  - auto validate button naming
    - [ ] problem scoping
- discuss future focus post feature complete
  - [ ] logging - would prob need to architect this together
    - [ ] beegtoo UI
    - [ ] bm util function - need to search
    - [ ] server

##### POST MEET

- [ ] swap addVendor_quote.beforeFormulas.bml - window.name "advancedPreModify"
- [ ] swap addVendor_quote.afterForumulas.bml - window.name "advancedModify"
- [ ] comm rules + actions file name + polish
- [ ] config work
- [ ] Code hardening + move to BETA

<https://stackoverflow.com/questions/4275071/getelementbyid-wildcard>

```javascript
if (typeof filename == "undefined") {
    if (document.querySelectorAll("input[id^=x-auto]")[1].value) {
        let filename = document.querySelectorAll("input[id^=x-auto]")[1].value;
        alert(filename);
    }
}
```

##### 11/8/20

- [ ] swap addVendor_quote.beforeFormulas.bml - window.name "advancedPreModify"
- [ ] swap addVendor_quote.afterForumulas.bml - window.name "advancedModify"
- [ ] comm rules + actions file name + polish
- [ ] config work
- [ ] Code hardening + move to BETA

Smoke Testing to see where we are at

- [x] commerce libs - PRICING
  - [x] unload
  - [x] load
  - [x] unload test
  - [x] load test
- [x] util libs - GET VOLUME PRICING
  - [x] unload
  - [x] load
  - [x] unload test
  - [x] load test
- [ ] commerce actions - addVendor_quote - MEH
  advanced modify before
  - [ ] unload - ERRORS - message port closed
  - popup.html:1 Error handling response: TypeError: Cannot read property 'filename' of undefined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/popup.js:106:34
  - [x] load - WORKS but Unchecked runtime.lastError: The message port closed before a response was received in console.
  advanced modify after - Same as before
  - [ ] unload
  - [x] load
- [ ] commerce rules - FAILS - Unchecked runtime.lastError: The message port closed before a response was received.
popup.html:1 Error handling response: TypeError: Cannot read property 'filename' of undefined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/popup.js:106:34
  - [ ] unload
  - [ ] load
- [ ] config rules - sortBranchBasedOnZipCode NOTHING WORKING
```<input type="text" class=" x-form-field x-form-text" id="x-auto-3-input" name="varName" tabindex="0" style="width: 340px;" readonly="" disabled="">```
 contains value for config filenames (previous tab);
 How to grab and pass?
 <https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true>
  - [ ] unload
  - [ ] load

### 11/9/20

- [x] Review popup.js
- [x] Review background.js
- [x] Review content.js
- [ ] Review injected.js
- [ ] Review adminCommerceInjected.js, adminCommerceContent.js
- [x] Review adminConfigInjected.js, adminConfigInjected.js

- [ ] Compare chrome.runtime.onMessage.addListener's between content scripts.

- [x] add in (site) folder - devmcnichols, etc.
- [ ] finish config/commerce/util folder piece in popup.js

### 11/10/20

- [x] walk
- [x] continue review
- [ ] config/commerce rules hacking
  - [ ] CONFIG
  hidingAdvancedOptions - Advanced Condition
  - [ ] <https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=4951171&rule_type=11&pline_id=-1&segment_id=11&model_id=-1&fromList=true>
  constrainEPCostValue - Advanced Condition
  - [ ] <https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5387754&rule_type=2&pline_id=-1&segment_id=11&model_id=-1&fromList=true>
  - [ ] adminconfigContent chrome.runtime.onMessage.addListener vs. content chrome.runtime.onMessage.addListener
    - [ ] filename var
    - [ ] make the addlisteners code match around filename var check if works + go for walk.
      Uncaught TypeError: Cannot read property 'value' of null
    at adminConfigInjected.js:22
(anonymous) @ adminConfigInjected.js:22

  - [ ] maybe hardcode config and start working backwards
  
populateAvailabilityInformationInToAvailabilityArray

### 11/11/20

- [ ] wildcard selector brain storm
  - [ ] multi start + end css selector
  - [ ] try using multi contains selector as well
  - [ ] don't think I can do with a single selector
- [ ] wildcard selector trials in adminConfigInjected.js vs. adminConfigContent.js <- try from both contexts --

- moving unload code listener between the 2 looks promising (configInjected + ConfigContent);
  - [ ] unload code
    <https://stackoverflow.com/questions/26630519/queryselector-for-web-elements-inside-iframe>
    Edit: New title. What I'm looking for is a document.querySelector for elements inside an iframe.

I've done quite a bit of Googling for an answer and finally I'm stumped.

I'm trying to query inside an iframe. I'm building string selectors to be used in Selenium and usually I just inspect the element with Firebug, and use document.querySelectorAll("theStringIBuid");

But it doesn't work with elements inside iframes. I've tried all of the below to get an element "radiobutton1" inside the "page-iframe" iframe.

var elem1 = ".page-iframe";
console.log(elem1);
var elem2 = ".radiobutton1";
console.log(elem2);
document.querySelectorAll(elem1+elem2+"");

document.querySelectorAll('.page-iframe').contentWindow.document.body.querySelectorAll('.radiobutton1')
document.getElementById('.page-iframe').contentWindow.document.body.innerHTML;

[].forEach.call( document.querySelectorAll('.page-iframe'),
function  fn(elem){
console.log(elem.contentWindow.document.body.querySelectorAll('.radiobutton1')); });

```js
var wldCardStrSelector = " " + "*" + " ";
var document.querySelectorAll(wldCardStrSelector);

var contentWindow = document.getElementById('.page-iframe').contentWindow
var contentWindow = document.querySelectorAll('.page-iframe')
```

- maybe useful second resource -
  <https://stackoverflow.com/questions/25098021/securityerror-blocked-a-frame-with-origin-from-accessing-a-cross-origin-frame>
  <https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy>
  <- [ ] finish config/commerce/util folder piece in popup.js>
- [ ] try iframe query selector -
   maybe

```js

   document.querySelectorAll('iframe').forEach( item =>
    console.log(item.contentWindow.document.body.querySelectorAll('a'))

)

```

- window.addEventListener('unloadCode', function(evt)

### 11/12/20

- [x] test on laptop
  - Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
-
- [x] options.js:29 (anonymous function)

pricing smoke test

- [x] comm load (work Desktop).
- [x]

```js
Uncaught (in promise) TypeError: window.showOpenFilePicker is not a function
    at HTMLButtonElement.<anonymous> (popup.js:137) <- Looks fine on Desktop - Verify Experimental Flag is set on laptop (pretty sure it's not - This was problem).
```

- [x] comm/util lib load
- [x] comm/util lib unload
- [x] comm/util lib load test
- [x] comm/util lib unload test

- [x] config rule unload - WIP - filenaming
- [x] config rule load

- [x] comm rule unload - WIP - filenaming
- [x] comm rule load

- [ ] comm action before/after unload
- [ ] comm action before/after load
**textarea element w/ id "textarea"** .value() <- inside iframe>

#### 11/13/20

- [ ] continue wild card config work
- [ ] wildcard selector brain storm
- [ ] wildcard selector trials in adminCommerceInjected.js vs. adminCommerceContent.js <- try from both contexts
- [x] fix console error (doesn't effect functionality) -
Uncaught SyntaxError: Identifier 'commentHeader' has already been declared content.js:1 - post unload, post unload test
  - var defineMe = window.defineMe || 'I will define you now';
  - var SomeVar = SomeVar || 'Default Value';
- Use var for cs

- previous tab for filename
<https://stackoverflow.com/questions/8688887/chrome-extension-get-last-used-tab>

```js
chrome.tabs.query({
    active: false
  }, (tabs) => {
    let tab = tabs.reduce((previous, current) => {
      return previous.lastAccessed > current.lastAccessed ? previous : current;
    });
    // previous tab
    console.log(tab);
  });
```

<https://developer.mozilla.org/en-US/docs/Web/API/Window/parent>

Updating Google Chrome

- Desktop Version
Version 86.0.4240.193 (Official Build) (x86_64)

- Laptop Version
Version 86.0.4240.193 (Official Build) (x86_64)

#### 11/14/20

- [x] continue adminConfigInjected work
  - [ ] storing filename - WIP
  
#### 11/15/20

#### 11/16/20

Continue config work

- finish unload ( can success fully save file w/ code but needs fn)
  - figure out load frame

##### Configuration Rules - WIP - (TODO: Use tab query) Done except filenaming piece

- [x] WIP - UNLOAD
  [ ] - need to store varname on previous page or query for it
  [ ] - setSupplierDescriptionBeforeReady has advanced condition for testing
- [x] WIP - LOAD + Auto Validate ( may have bug)
  - [ ]

EX) Recommendation - sortBranchBasedOnZipCode

- input id for var name - x-auto-3-input
  - weird editor frame naming - frame_x-auto-143-area
  - validate button
  //Perform Validation
    `document.getElementsByClassName('x-btn-text ')[16].click();`

#### 11/17/20

TESTING

- [x] comm/util lib load
- [x] comm/util lib unload
- [x] comm/util lib load test
- [x] comm/util lib unload test

- [x] config rule unload - WIP - filenaming
- [x] config rule load

- [x] comm rule unload - WIP - filenaming
- [x] comm rule load

- [ ] comm action before/after unload
- [ ] comm action before/after load

<https://superuser.com/questions/195419/google-chrome-is-there-a-keyboard-shortcut-to-open-a-link-in-a-new-tab#:~:text=Go%20to%20the%20link%20you,it%20in%20a%20new%20window>.

#### 11/18/20

- [x] util test unload error () - calculateLaborCharges

Listeners to use multi atribute selector

- [x] rewrite unloadTestCode +
- [x] loadTestCode

UTIL TEST TEXT AREA

```html
<textarea style="width: 242px; height: 44px;" autocomplete="off" id="ext-comp-1055" name="testScript" class=" x-form-textarea x-form-field"></textarea>
```

COMMERCE TEST TEXT AREA

```html
<textarea style="width: 242px; height: 44px;" autocomplete="off" id="ext-comp-1080" name="testScript" class=" x-form-textarea x-form-field "></textarea>
```

need wildcard selector for id name

use

```js
const prefix = 'gridx_Grid_';
const suffix = '-9';

const collection = document.querySelectorAll(
  `[aria-describedby^="${ prefix }"][aria-describedby$="${ suffix }"]`
);

`[id^="ext-comp-"][name="testScript"]` <- for test unload attribute selector

collection.forEach( element => console.log( element.innerText ) );
```

<https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors>
<https://stackoverflow.com/questions/53197181/javascript-selector-with-wildcard>

#### LOW PRIORITY

11/19/20

```js
if (document.querySelector(".xpanel-header-text")) {
            header = document.querySelector(".x-panel-header-text");
            isUtil = header.innerHTML.includes("Util");
            isCommerce = header.innerHTML.includes("Commerce");
            if (isCommerce) {
                bmSiteType = "commerce";
            } else if (isUtil) {
                bmSiteType = "util";
            } else {
                bmSiteType = "configuration"
            }
            // TODO fix configuration
        }
```

### UPCOMING DEVELOPMENT

- [ ] finish configuration/commerce/utilities subfolders (all under commerce currently)
- [ ] filename tab query for config rules
- [ ] filename tab query for comm rules
- [ ] check comm rules action
  - [ ] filename query

LOW PRIORITY - - [ ] look into moving back to line 1 in editor on load.

### CONVO TOPICS for next meeting

- [ ] file structure for config/commerce/util - right now all contained in bigmachines/sitedomain folder
- Want to clarify commerce (In order to access the extension popup UI)
<https://superuser.com/questions/195419/google-chrome-is-there-a-keyboard-shortcut-to-open-a-link-in-a-new-tab#:~:text=Go%20to%20the%20link%20you,it%20in%20a%20new%20window>.
- You mentioned you had ideas for a github integration. I would like to see how you see this working (to me it still makes more sense to do this locally from the command line). I can't yet envision how you see this working. - Maybe a github UI options mockup.
- Button disabling/hiding looks good/consistent across the board.

- filenaming still not working for comm actions, comm rules, or congfig rules - WIP
  - sent email regarding action id associate with action var name
    - need to play with this more
    - <https://www.geeksforgeeks.org/wildcard-selectors-and-in-css-for-classes/?ref=rp>
    - <input[name="varName"]>
    - <>
    [attribute^=”str”] Selector: The [attribute^=”value”] selector is used to select those elements whose attribute value begins with a specified value str.
    [attribute$=”str”] Selector: The [attribute$=”value”] selector is used to select those elements whose attribute value ends with a specified value str.
    [attribute*=”str”] Selector: The [attribute*=”str”] selector is used to select that elements whose attribute value contains the specified sub string str. This example shows how to use a wildcard to select all div with a class that contains str. This could be at the start, the end or in the middle of the class.

    multi contains selector?
    div[class^="tocolor-"], div[class*=" tocolor-"] { <- something like this maybe
}
- editAreas
- [x] add in (site) folder - devmcnichols, etc.
- [ ]

```js
document.querySelectorAll('iframe').forEach( item =>
    console.log(item.contentWindow.document.body.querySelectorAll('a'))
)
```

- [ ] Chrome Vers Confirmation - Build for Chrome 86 - Tested on both Desktop and Laptop
- [ ] Guidelines/Shortcuts (optimal way to use extension).
- [ ] Onboarding Dev Nick for testing/dev - WIP
  - [ ] ok to provide devmcnichols credentials?
  - [ ] also going to start testing in other environments (pgrtest2 or devplantronics)?
- [ ] Agree upon -

## Deliverables For Next Time

- [ ] filename tab query for config rules
- [ ] filename tab query for comm rules
- [ ] check comm rules action
  - [ ] filename query

- [ ] finish configuration/commerce/utilities subfolders (all under commerce currently)

## 11/23/20

```html
<input type="text" class=" x-form-field x-form-text" id="x-auto-3-input" name="varName" tabindex="0" style="width: 340px;" readonly="" disabled="">
```

```js
document.querySelector("#x-auto-3-input");
```

store to chrome local storage - <https://developers.google.com/web/tools/chrome-devtools/storage/localstorage>

<https://dev.to/chintukarthi/how-to-save-values-in-chrome-local-storage-kmc>

### CONFIG RULES

<https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true>

- Opens in same tab

- Grab varname and store it to chrome local storage

- <https://developer.chrome.com/apps/storage>
- storage permissions

```js
chrome.storage.sync.set({'variable_name': 'variable_value'}, function() {
  console.log("you saved me!!");
});

chrome.storage.sync.get(['variable_name'], function(result) {
      if(result.variable_name == undefined) {
        console.log("I am retrieved!!");
      }
}

result.variable_name
```

### COMMERCE RULES

- Opens in new tab
- Store previous tab id
- query for varname in previous tab

### COMMERCE ACTIONS

- Open in new tab
- Save previous Tab Id

- config file naming smoke tests look good for all rule types

#### 11/25/20

- [x] continue config file testing
- [x] installation w/ @nickthegreekgod
- [ ] schedule weekly testing w/ @nickthegreekgod
- [x] comm filename rules dev

####### 11/27-28/20

- [x] config smoke
- [x] commerce smoke
- [x] util smoke
- [ ] commerce rules smoke
- [ ] -needs work still

```html <input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" readonly="" disabled="" style="width: 260px;">```

- [ ] commerce actions smoke
  - fn fix -
  - /html/body/table[5]/tbody/tr/td[3]/form[2]/div[1]/table/tbody/tr[3]/td[2]/text()

- [ ] merge v0.5.0 into master for feature complete

####### 11/29/20

- [ ] E2E config rules testing
- [ ] E2E commerce rules testing
- [ ] log install streamline tools on windows partition
- [x] installation w/ @nickthegreekgod

####### 11/30/20

- [ ] commerce actions smoke

- fn fix -
- /html/body/table[5]/tbody/tr/td[3]/form[2]/div[1]/table/tbody/tr[3]/td[2]/text()

##### v - 0.7.0-alpha

TODO:

- [ ] add util subdirectory
- [x] add configuration subdirectory
  - ```html <span class="x-panel-header-text" id="ext-gen55">Util BML Library Function Editor: Properties &amp; Parameters</span>```

TEMP NOTES

```html
<textarea id="textarea" wrap="off" onchange="editArea.execCommand(&quot;onchange&quot;);" onfocus="javascript:editArea.textareaFocused=true;" onblur="javascript:editArea.textareaFocused=false;" style="width: 492px; height: 2325px; font-family: monospace; font-size: 10pt; line-height: 15px; margin-left: 0px; margin-top: 0px;" classname="null hidden" class="null hidden" spellcheck="false"> </textarea>
```

```css
#textarea
```

```js
document.querySelector("#textarea")
```

<https://stackoverflow.com/questions/4374793/accessing-current-tab-dom-object-from-a-chrome-extension>

12/1+2/20

- [ ] comm rules/action fn fix research
- [ ] add util subdirectory
- [x] config folder different icon <- checkout if this happens on other comps (non-issue (local mac vscode icon extension likely));

SMOKE TEST CONFIG
<https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=4954262&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true>
hideRecommendedPartsArraySet - recommendation rule

- [x] unload
  - [x] load but had syntax highlight issue + does not auto validate
setProcessingSheetField - recommendation rule

<https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=4889573&rule_type=2&pline_id=-1&segment_id=11&model_id=-1&fromList=true>
constraintProductTypesWhenProductAccessories - constraint rule

- [x] unload
- [x] load but had syntax highlight issue + does not auto validate

12/3/20

- [x] CONFIG - auto validate HTML collection - i think config is 95% complete
- [ ] COMM - actions filename - tabs query?
- [ ] COMM - rules filename -
- [ ] add util subdirectory

MEETING 12/3/20 - MSTGA - Make Streameline Tools Great Again
Reastablishing our tool in the DOMinance hierarchy
Grappling w/ complexity
eloquent js - <https://eloquentjavascript.net/00_intro.html>

DEMO - CONFIG
TODO CLEANUP:

- [x] minor config text exitor highlighting issue (may need another click (or on change or on blur) event).
- [ ] remove unused permissions from manifest.json
- [ ] maybe remove step 9 from install
- [ ] DRY up

- [ ] commerce action naming worse case scenario display name + id . bml

<https://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/>

12/4/20

- [ ] config parent click trials
document.querySelector("#editor")
/html/body/div[1]
document.querySelector("#editor")

MEH

12/5/20

- [x] DOM traversal methods
  - [ ] what combinations can you try?
  - [ ] 3 methods + different hooks
    - [ ]
- [x] continued click trials
  - [ ] can you try from content instead? - MEH

12/6+7/20

let objectA = {a: 1, b: 2};
Object.assign(objectA, {b: 3, c: 4});
console.log(objectA);
// → {a: 1, b: 3, c: 4}

Maybe useful for comm fn

  something w/ cursor position or selection?

<https://gomakethings.com/detecting-clicks-inside-an-element-with-vanilla-javascript/>

12/8/20

- look into mouse positioning b4 click
- learn about click + event propogation
- related target
  <https://www.w3schools.com/jsref/event_relatedtarget.asp>
- [ ] <https://hackernoon.com/creating-popup-chrome-extensions-that-interact-with-the-dom-27b943978daf>
- z index
- maybe jquery is worht a shot
  - <https://stackoverflow.com/questions/29811284/get-click-position-on-the-window>
  - <https://javascript.info/coordinates>

  - <https://css-tricks.com/simulating-mouse-movement/>

DEVMCNICHOLS CPQ VERSION
Version: 20B Patch 4
Copyright © 2014, 2020, Oracle and/or its affiliates. All rights reserved.
Confidential & Proprietary
Patent: U.S. 8,578,265 B2. Additional Patents Pending.
Release Date: 11/04/2020
Build Date: 11/04/2020
Build Number: Release_R2020_B_Patch4 1104 09:58

  12/9/20

- another round of config trials
  - look into mouse positioning b4 click
- learn about click + event propogation
- related target
  <https://www.w3schools.com/jsref/event_relatedtarget.asp>
- [ ] <https://hackernoon.com/creating-popup-chrome-extensions-that-interact-with-the-dom-27b943978daf>
- z index
- maybe jquery is worht a shot
  - <https://stackoverflow.com/questions/29811284/get-click-position-on-the-window>
  - <https://javascript.info/coordinates>

  - <https://css-tricks.com/simulating-mouse-movement/>\

recreate document.querySelector("#container")?

- build util

/html/body/div[1]/div[3]/div[2]/textarea

<https://stackoverflow.com/questions/10596417/is-there-a-way-to-get-element-by-xpath-using-javascript-in-selenium-webdriver>

```js
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
```

console.log( getElementByXpath("//html[1]/body[1]/div[1]") );

  textarea#textarea.null.hidden
HTMLTextAreaElement
HTMLElement
Element
Node
EventTarget
Object

2021
<https://blog.oauth.io/how-to-add-github-social-login-button/>
<https://stackoverflow.com/questions/7237894/how-do-i-make-a-signup-with-github-button-like-the-one-on-coderwall>
<https://eloquentjavascript.net/03_functions.html>
  
  ```html
  <a class="btn btn-block btn-social btn-github">
    <span class="fa fa-github"></span> Sign in with Github
  </a>
  ```

<https://stackoverflow.com/questions/65091074/jquery-how-to-change-one-click-to-two-clicks-in-specific-case>

COMMAND LINE MERGE
Step 1: From your project repository, bring in the changes and test.

git fetch origin
git checkout -b v0.7.0-alpha origin/v0.7.0-alpha
git merge master
Step 2: Merge the changes and update on GitHub.

git checkout master
git merge --no-ff v0.7.0-alpha
git push origin master

12/12 + 13/20

- config work
- commerce work

- look into mouse positioning b4 click
- learn about click + event propogation
- related target
  <https://www.w3schools.com/jsref/event_relatedtarget.asp>
- [ ] <https://hackernoon.com/creating-popup-chrome-extensions-that-interact-with-the-dom-27b943978daf>
- z index
- maybe jquery is worht a shot
  - <https://stackoverflow.com/questions/29811284/get-click-position-on-the-window>
  - <https://javascript.info/coordinates>

  - <https://css-tricks.com/simulating-mouse-movement/>

maybe re create this element

```html
<div id="selection_field" class="" style="display: block; font-family: monospace; font-size: 10pt; line-height: 15px; top: 15px; width: 2468px;"><span></span><strong></strong><span>
            // </span></div>
```

updated desktop chrome - version
Google Chrome is up to date
Version 87.0.4280.88 (Official Build) (x86_64)

- [x] check alert - injected.js - alert("Please Check - Use Test Script."); x3 on - email notification generator
- test script - test

- config grind

- [x] config error - Error handling response: ReferenceError: result is not defined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/adminConfigContent.js:267:17
adminConfigContent.js:272

Visual Studio Code Update
Version: 1.52.0
Commit: 940b5f4bb5fa47866a54529ed759d95d09ee80be
Date: 2020-12-10T22:46:53.673Z
Electron: 9.3.5
Chrome: 83.0.4103.122
Node.js: 12.14.1
V8: 8.3.110.13-electron.0
OS: Darwin x64 19.6.0

Meeting 12/17/20

- [ ] parent.area
- [ ] maybe key down
  - var keyboardEvent = new KeyboardEvent('keypress', {bubbles:true});
Object.defineProperty(keyboardEvent, 'charCode', {get:function(){return this.charCodeVal;}});
- keyboardEvent.charCodeVal = [your char code];
- document.body.dispatchEvent(keyboardEvent);
- <https://stackoverflow.com/questions/1897333/firing-a-keyboard-event-on-chrome/23812767#23812767>
- maybe remove null/hidden class from classList - .remove("foo");
- <https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/>

INJECTED

- [x] simulate click trial; NOGO
- [x] simulate click trials w/ interval;
- [x] simulate click trials w/o validate;
- [ ] simulate click trials w/ validate interval;
- [ ]

CONTENT

- [ ] simulate click trial; NOGO
- [ ] simulate click trials w/ interval;
- [ ] simulate click trials w/o validate;
- [ ] simulate click trials w/ validate interval;

- loadcode listener?

jquery trigger?

- post meet
- work config til monday and then switch to comm

12/20/20

jquery trigger - <https://api.jquery.com/trigger/>
jquery trigger handler - <https://api.jquery.com/triggerhandler/>
<https://stackoverflow.com/questions/20928915/how-to-get-jquery-triggerclick-to-initiate-a-mouse-click>
<https://stackoverflow.com/questions/3979041/jquery-triggerclick/54404180>
<https://stackoverflow.com/questions/11486630/jquery-trigger-click-vs-click/11486648>

this.find jquery

```js
$(".btn, .btn2").on('click',function () {
    $($(".a")[0]).trigger('click'); // first element
});

$(".a").on('click', function (e){
    alert(e.target);
});​
```

```js
$( "#foo" ).on( "click", function() {
  alert( $( this ).text() );
});
$( "#foo" ).trigger( "click" );
```

```js
$( "#foo" ).on( "custom", function( event, param1, param2 ) {
  alert( param1 + "\n" + param2 );
});
$( "#foo").trigger( "custom", [ "Custom", "Event" ] );
```

TRIGGER TRIALS

```js
$( "#textrea" ).on( "click", function() {
  alert( $( this ).text() );
});
$( "#textrea" ).trigger( "click" );
```

```js
var jq = document.createElement('script');
jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(jq);
// ... give time for script to load, then type (or see below for non wait option)
jQuery.noConflict();
```

```js
$('textarea').last().click();

$('textarea').last().on( "click", function() {
  alert( $( this ).text() );
});

$( "#textrea" ).last().trigger( "click" );

```

12/21+22/20

commerce rules trial

```js
document.getElementsByName('varName')[0].value
```

- [ ] try chrome local instead of sync

```JS
chrome.storage.local.set({key: value}, function() {
  console.log('Value is set to ' + value);
});

chrome.storage.local.get(['key'], function(result) {
  console.log('Value currently is ' + result.key);
});
```

- [ ] background script
  - <https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage>
- debugging
  <https://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page>
  <https://developer.chrome.com/docs/extensions/mv2/messaging/>

```js
// REQUEST FROM CONTENT SCRIPT
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});
```

```js
// EXTENSION TO CONTENT SCRIPT
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
```

```js
//RECEIVING END
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  }
);
```

- [x] comm fn rules functions
  - works w/ click on previous tab
    - [ ] query dom with message passing?
- add [x] <https://devmcnichols.bigmachines.com/admin/commerce/actions/list_actions.jsp?doc_id=4653823> to page state matcher
- [x] comm fn actions functions

12/23/20

###### ACTIONS TODO

- [x] distinguish between before and after
- IF TITLE CONTAINS
- [ ] store varname without popup click - query previous tab in popup instead of save from content script
  <https://developer.chrome.com/docs/extensions/reference/tabs/>

###### RULES TODO

- [ ] store varname without popup click

###### CONFIG TODO

- [ ] try to find way around having to click post load.

Meeting 12/24/20

Status Update

###### Publishing to Chrome Webstore

<https://developer.chrome.com/docs/webstore/publish/>
Pay the $5 registration fee 2 Register as Chrome Web Store Developer
<https://chrome.google.com/webstore/devconsole/register>

##### Manifest V3

<https://developer.chrome.com/docs/extensions/mv3/intro/>

- Published on Monday, November 9, 2020

new button for commerce actions and rules

button that opens define function before after in new tab instead of window

12/27/20

####### ACTIONS TODO

- [x] distinguish between before and after
- IF TITLE CONTAINS
- [ ] store varname without popup click - query previous tab in popup instead of save from content script
  <https://developer.chrome.com/docs/extensions/reference/tabs/>
  - define function link -

```js  
<a class="button-text" name="define_function" id="define_function" href="#">Define Function</a> <->
```

```html
  <table onclick="javascript:editPreModifyFunction();bmCancelBubble(event)" onmouseover="bmButtonMouseOver(this,'javascript:editPreModifyFunction()')" onmousedown="bmButtonMouseDown(this,'javascript:editPreModifyFunction()')" onmouseup="bmButtonMouseUp(this,'javascript:editPreModifyFunction()')" onmouseout="bmButtonMouseOut(this,'javascript:editPreModifyFunction()')" class="plain-button" cellspacing="0" cellpadding="0" role="button" aria-label="Define Function" style="cursor: pointer;">
 <tbody><tr>
  <td class="button-left"><img class="button-left" src="/img/button10.gif"></td>
  <td class="button-middle" nowrap="true"><div style="margin: 0px 0px 1px;"><a class="button-text" name="define_function" id="define_function" href="#">Define Function</a></div></td>  <td class="button-right"><img class="button-right" src="/img/button10.gif"></td>
 </tr>
</tbody></table>
```

12/27/20

####### RULES TODO

- [ ] store varname without popup click
  - [ ] TODO: finish new tab query

####### CONFIG TODO

- [ ] try to find way around having to click post load.

####### Chrome Web Store Description
<https://chrome.google.com/webstore/category/extensions?hl=en>

Overview

GIF/Demo Video

Chrome Web Store: <>

Streamline your CPQ workflows, development, administration and maintenance.

LOAD AND UNLOAD your BML scripts to and from Oracle CPQ Cloud.
Use w/ your favorite Text Editor - Visual Studio Code.
Manage your BML code w/ Git Versioning Control

Please create any bugs/issues/feature requests [here](https://github.com/loganbek/streamlineTools/issues/new/choose).

12/28/20

Store listing
Product details
For all languages

Title from package

Streamline Tools
Summary from package

Streamline Tools for Oracle CPQ Cloud!
Description*
0 / 16000
Focus on explaining what the item does and why users should install it
Category*

Developer Tools
arrow_drop_downarrow_drop_down
Language*

English (United States)
arrow_drop_downarrow_drop_down
Specifying your item’s language will help users find it. If you support multiple languages, then you should internationalize your item. Learn more
Graphic assets
Screenshot ordering on this dashboard is not yet available. For now please use the old dashboard to order screenshots.

Store icon

128x128 pixels

Please ensure icon follows image guidelines

Global assets
Global promo video
Youtube URL
Enter a YouTube video URL

Screenshots

Up to a maximum of 5

1280x800 or 640x400

JPEG or 24-bit PNG (no alpha)

At least one is required

Drop image here

Small promo tile

440x280 Canvas

JPEG or 24-bit PNG (no alpha)

Drop image here

Large promo tile

920x680 Canvas

JPEG or 24-bit PNG (no alpha)

Drop image here

Marquee promo tile

1400x560 Canvas

JPEG or 24-bit PNG (no alpha)

Drop image here

Additional fields
Official URL

None
arrow_drop_downarrow_drop_down
Or Add a new site
If your item is associated with a website that you own, select that website from the list. You can register as the owner for a site using Google Search Console.
Homepage URL
Homepage URL
Link to website for your item

Support URL
Support URL
Providing the URLs for description and support pages can improve your users’ experience and help make this item’s ratings and comments more meaningful.
Mature content
Examples of mature content include sexual and suggestive content, strong language, violence, or a focus on the consumption or sale of alcohol, tobacco, or drugs. Learn more
Google analytics ID
UA-
Specify your Google Analytics ID here if you’d like to use Google Analytics to track your item

12/31/20

- [ ] finish rules tab query
- [ ] finish actions tab query

TODO LATER:

####### RULES TODO

- [ ] store varname without popup click
  - [ ] TODO: finish new tab query
  RULES
    - [ ] 1st URL: <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759>
    - [ ] 2nd URL: <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_function.jsp>
    - [ ] /html/body/div[1]/div/div[2]/div[2]/div[1]/div[2]/div[3]/div[2]/div[2]/div[1]/div/div/div/div/div[2]/div[3]/table/tbody/tr[2]/td[2]/em/button/text()
    - [ ] document.querySelector("#x-auto-430 > tbody > tr:nth-child(2) > td.x-btn-mc > em > button")
    - edit functoin button listener
    - document.querySelector("#x-auto-430 > tbody > tr:nth-child(2) > td.x-btn-mc > em > button")
    - 4 dif tabt titles
      - Commerce Rule Editor
      - <https://sung.codes/blog/2019/02/17/getting-dom-content-from-chrome-extension-2>
      - maybe try out lastFocusedWindow

  ACTIONS
  - 1st URL - <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=4723726&doc_id=4653823>
    - 2nd URL - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=472372>
    - 3rd URL - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_function.jsp>

####### CONFIG TODO

- [ ] try to find way around having to click post load.

####### BOTH

- [ ] use tab.title to further break out file structure (comm rules + actions)
MEETING PRE/POST NEW YEAR
- [ ] google analytics
- [ ] web store assets

use for context menu?

START WEB STORE PROCESS
NPM PACKAGE? - <https://docs.github.com/en/free-pro-team@latest/packages/guides/configuring-npm-for-use-with-github-packages>
can invoke browser or page action to capture comm fn? - meh
look into service workers and promises

MV3 Deprecation API
Sunset for deprecated APIs
There are a number of APIs that have long been deprecated. Manifest V3 finally removes support for these deprecated APIs. These include:

chrome.extension.sendRequest()
chrome.extension.onRequest
chrome.extension.onRequestExternal
chrome.extension.lastError
chrome.extension.getURL()
chrome.extension.getExtensionTabs()
chrome.tabs.Tab.selected
chrome.tabs.sendRequest()
chrome.tabs.getSelected()
chrome.tabs.getAllInWindow()
chrome.tabs.onSelectionChanged
chrome.tabs.onActiveChanged
chrome.tabs.onHighlightChanged
As well as the undocumented:

chrome.extension.sendMessage()
chrome.extension.connect()
chrome.extension.onConnect
chrome.extension.onMessage
If your extensions use any of these deprecated APIs, you’ll need to make the appropriate changes when you migrate to MV3.

<https://developer.chrome.com/docs/extensions/mv3/mv3-migration-checklist/>

- <https://www.udemy.com/course/google-chrome-extension/?couponCode=HAPPYNEWYEAR>

query prev tab for

```html
<input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" style="width: 260px;" readonly="" disabled="">
```

- BM sandbox ( no client ) for testing ? - im sure licensing is teh wurst

1/11/21

- popup unload on click - add check for url and then write 2 tab querys
- content script listener w/ name query

- [ ] tab query + send message to adminContentCommerce.js content script

1/13/21

- [ ] map unload click path
POPUP
  - `<button id="unload"> Unload BML <i class="material-icons md-18">keyboard_arrow_right</i><i class="material-icons md-18">keyboard_arrow_right</i></button>`

- `unloadButton.onclick = function(params) {`

    ```js
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "unload" }, function(response) {
            //             console.log(response.filename);
    - adminCommerceContent.js
    ```

```js

//POPUP UNLOAD QUERY
chrome.tabs.query({currentWindow: true}), function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "getCommerceFilename" }, function(response) {
    consoleonsole.log(response.commerceFileName);
    });
});

```

```js

chrome.tabs.query({currentWindow: true}, function(result) {
    result.forEach(function(tab) {
//         do stuff here;
        console.log("TABID");
        console.log(tab.id);
        console.log("TABNAME");
        console.log(tab.name);
    });
});
```

####### NEXT MEETING

STATUS UPDATE

- [ ]

Streamline Tools v0.0.8-alpha
Streamline Tools v1.0.0-beta <- Chrome Webstore Release
<https://semver.org/>
<https://git-scm.com/book/en/v2/Git-Basics-Tagging>

- [ ] Status of Non Client Connected env??? - I know Oracle is prob klibby around this.

- [ ] Webstore Process + assets

1/18/20

make streamline tools commerce actions and rules great finally

- [x] break into adminCommerceRulesContent.js + adminCommerceActionsContent.js
- [ ] try sending message from background script?
  <https://stackoverflow.com/questions/14245334/sendmessage-from-extension-background-or-popup-to-content-script-doesnt-work>

###### COMM RULES URLS

COMM RULE VARNAME PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?document_id=4653823&process_id=4653759>
COMM RULE EDITOR PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_function.jsp>

```html document.getElementsByClassName("bottom-bar")[0].innerHTML;```

###### COMM ACTIONS URLS

COMM ACTION FULL VARNAME LIST - <https://devmcnichols.bigmachines.com/admin/commerce/actions/list_actions.jsp?doc_id=4653823>
COMM ACTION VARNAME PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=54983795&doc_id=4653823>
COMM ACTION EDITOR PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795>

WEBSTORE

- [ ] run through webstore process + assets

1/19/20

COMM RULES
finish testing comm rules
-[x] debug constrain rules function - constrainMultipleFreightGridSelects - downloads some weird chrome partial file (non BML). Seems to work fine today. Keep on eye out for partial downloads bug.
-[ ] rare scenario where underscore in BML filename. <- add fix to rmeove underscores

COMM ACTIONS

- [x] apply similiar logic from comm rules content script
- [ ] comm actions testing

1/20/20

- [x] test
- [ ] code quality / comments / console log
- [ ] weave into master

TODO:

- [ ] look into automating command click on edit function click - LOW PRIORITY
- [ ] rare scenario where underscore in BML filename. <- add fix to remove underscores
- [ ] look into commerce function scroll on load code
- [ ] Please you test script alert fix
- [ ] remove unused files + references
  - [ ] adminCommerceContent.js
  - [ ] adminCommerceInjected.js\
- [ ] util functions should file into utility folder
- [ ] futher build out file structure for rule types
- [ ] Github SSO

1/21+22/20

BEFORE RELEASE

- [ ] code cleanup
  - [ ] remove commments
  - [ ] unused permission check
  - [ ] unued injections?
  - [ ] remove unused cs + inject

Future Work

ALL

- [ ] Github SSO

CONFIG

- [ ] Double Click Fix if Possible. (UX)
- [ ] overlay on load
  - [ ] hide background code?

COMMERCE

- [ ] test script alert fix
- [ ] CH
- [ ] look into automating command click on edit function click (rules + config)

UTILITY

- [ ] util functions correctly file under "Utilities" subfolder

- settings alternate to downloads folder

TESTING

Testing framework to look into - <https://github.com/cypress-io/cypress>

RESEARCH OTHER AREAS OF SITE
printer friendly XSL (can we do something here)
integration XSL
file manager

1/23+24/20

Work on Chrome Web Store Copy + Make new release

Streamline your CPQ workflows, development, administration and maintenance.

<https://github.com/loganbek/streamlineTools/issues>

####### DESCRIPTION - Focus on explaining what the item does and why users should install it

Streamline your Oracle CPQ workflows, development, administration and maintenance.
LOAD and UNLOAD your BML scripts to and from Oracle CPQ Cloud.
Use with your favorite Text Editor - Visual Studio Code instead of the Big Machines web based editors.
Manage your BML code using Git versioning control.
Auto "check" and "validate" to improve code quality and debugging efficiency.

Please create any bugs/issues/feature requests [here](https://github.com/loganbek/streamlineTools/issues/new/choose).

Strip and rip from other chome extensions.

<https://developer.chrome.com/docs/webstore/publish>

- [x] register as chrome developer
- [x] Google Analytics ID - 260194142
- [ ] Graphic Assets
- [x] Store icon
- [ ] Permission justification

128x128 pixels

Please ensure icon follows image guidelines

Global assets
Global promo video
Youtube URL
Enter a YouTube video URL

- [ ] Screenshots + promo tiles

Up to a maximum of 5 screenshots

Screenshots
1280x800 or 640x400
JPEG or 24-bit PNG (no alpha)

Small promo tile
440x280 Canvas
JPEG or 24-bit PNG (no alpha)

Large promo tile
920x680 Canvas
JPEG or 24-bit PNG (no alpha)

Marquee promo tile
1400x560 Canvas
JPEG or 24-bit PNG (no alpha)

1/25+26/20

- [ ] look through CPQ docs for copy
- [ ] finish unused code + comment removal
- [ ] injected.js
  - [ ] fix alert x multiple
- [ ] content.js
  - [ ] CH
  - [ ] check util load validate
- [ ] finish unused code + comment removal round 2

Look @ other CWS extensions to get ideas for description, screenshots, + demo

1/27/20

MEETING

status update
screen grabs (blur out dev minichy stuff)

- [x] restore the rm contentscripts you should nt have rmd
adminCommerceRulesContent.js
adminCommerceRulesInjected.js

- [ ] fix remaining bugs and retest entire application
- [ ] edit chrome web store assets and blur client information.

Write a long description for the Web Store? Can we strip and rip copy from another chrome extension on the store - maybe the web dev app or another developer tool app.

2/2/21

List of final tasks before first release:

- [ ] What else do you need to complete the Chrome Web Store Application Process?
  - [ ] permission cleanup
    - [x]  current perms

    ```json  "permissions": [
        "downloads", // required for BML file downloads in Chrome (onDeterminingFilename specifically).
        "activeTab", // req for access to current tab DOM.
        "declarativeContent", //  req for page state matching + injecting scripts
        "storage", // propbably can remove may need later (currently not used)
        "file://*", // used for injection scripts
        "tabs" // req for requesting specific tab info
    ],
    ```

  - [ ] permission justification
  - [ ] edit chrome web store assets and blur client information.
  - [ ] email Chris copy + assets and get A OK
  - [ ] submit first version for review
  - [ ] review feedback and re-release

- [ ] Dev/Bug Fixes
  - [ ] look through CPQ docs for useable copy
  - [ ] finish unused code + comment removal
  - [ ] injected.js
    - [ ] fix alert x multiple
  - [ ] content.js
    - [ ] CH
    - [ ] check util load validate
  - [ ] finish unused code + comment removal round 2

MEETING 2/4/21

Status Update

- [ ] Preview Dev Console + Store Listing + Privacy Practices + Pricing & Distribution - <https://chrome.google.com/webstore/devconsole/ed6f5e47-5734-4a9b-be3f-7babc417c88e/dpedakjcalecgiigkhblajfgojjhdgoc/edit>
- [ ] Chris - status on non client environment? - Is this possible to get?

Other:

Email regarding remotely hosted code removal in mani v3
