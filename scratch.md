# Meeting Notes

## 8/13/20

60 hrs/week max

Things to focus on for sundays meeting:

1. How to get code out of editor. Maybe in hidden attribute. Look into webservices call.

2. Test out native file sys API.

Meeting Structure:

weds - indepth
sat - q and a

## 8/16/20

## 8/19/20

- [ ] DOM BML
- [ ] json path to bml code - x.widget.items[1].component.widget.items[1].component.widget.items[0].component.da

## 8/23/20

### DELIVERABLES 1

- [x] correct json path expression for bml code
      `$..[?(@.componentId=='bmlCodeEditor')].data`
      jsonRespStr
      <http://www.jsonquerytool.com/>

jsonRespStr = "{}";

var response = jsonPath(jsonRespStr.toJSON() , "\$..[?(@.componentId=='bmlCodeEditor')].data");

jsonPath(jsonRespStr, "\$..[?(@.componentId=='bmlCodeEditor')].data");

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
      maybe \$..[?(@.componentId=='mainScriptForm')].data")

### EXTRA CREDIT 1

- [ ] loading bml
- [ ] looking for 1st version of big tools - ON HOLD
- [x] research convert to :) vscode format
- [ ] chrome.browserAction.setBadgeText(object details, function callback)

## 8/27/20

### DEVLIVERABLES 2

## UNLOAD

- [ ] FIX - var response = jsonPath(jsonRespStr , "\$..[?(@.componentId=='bmlCodeEditor')].data");
- [x] - WORKING -> jsonPath(jsonRespStr, "\$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
- [x] messagePassing
      jsonPath(jsonRespStr, "\$.[?(@.componentId=='bmlCodeEditor')].data");

## 8/31/20

- [ ] use \$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data" for now
- [ ] json path lib that supports query
- [x] test mp w code
- [x] isolate why mp errors - erros on reload of extension w/o page refresh

## 9/6/20

### DELIVERABLES 3

1. - [x] chrome.runtime.onMessage.addListener(
         function (request, sender, sendResponse) { <- size limit
         There does not appear to be a limit or atleast there isn't one mentioned in the docs: <https://developer.chrome.com/extensions/runtime#event-onMessage>
         works fine for pricing in devMcnichols - 3972 loc

2. - [x] use \$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data" for now

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

Next Verison (Working POC) v0.1.0 alpha: - [ ] finish LOAD BML - [x] READ - [ ] pass from content.js -> inject.js - [ ] update DOM in inject.js - [ ] hide functionality besides LOAD BML/UNLOAD BML

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
<textarea
  id="textarea"
  wrap="off"
  onchange='editArea.execCommand("onchange");'
  onfocus="javascript:editArea.textareaFocused=true;"
  onblur="javascript:editArea.textareaFocused=false;"
  style="width: 5919px; height: 2355px; font-family: monospace; font-size: 10pt; line-height: 15px; margin-left: 0px; margin-top: 0px;"
  classname="null hidden"
  class="null hidden"
  spellcheck="false"
></textarea>
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
<table
  onclick="javascript:bmSubmitForm('edit_action.jsp', document.bmForm, bmValidateForm0, 'addCmAction', false, false, false);bmCancelBubble(event)"
  onmouseover="bmButtonMouseOver(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')"
  onmousedown="bmButtonMouseDown(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')"
  onmouseup="bmButtonMouseUp(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')"
  onmouseout="bmButtonMouseOut(this,'javascript:bmSubmitForm(\'edit_action.jsp\', document.bmForm, bmValidateForm0, \'addCmAction\', false, false, false)')"
  class="plain-button"
  cellspacing="0"
  cellpadding="0"
  role="button"
  aria-label="Apply"
  style="cursor: pointer;"
>
  <tbody>
    <tr>
      <td class="button-left">
        <img class="button-left" src="/img/button10.gif" />
      </td>
      <td class="button-middle" nowrap="true">
        <div style="margin: 0px 0px 1px;">
          <a class="button-text" name="apply" id="apply" href="#">Apply</a>
        </div>
      </td>
      <td class="button-right">
        <img class="button-right" src="/img/button10.gif" />
      </td>
    </tr>
  </tbody>
</table>
```

```html
<table
  onclick="javascript:editPreModifyFunction();bmCancelBubble(event)"
  onmouseover="bmButtonMouseOver(this,'javascript:editPreModifyFunction()')"
  onmousedown="bmButtonMouseDown(this,'javascript:editPreModifyFunction()')"
  onmouseup="bmButtonMouseUp(this,'javascript:editPreModifyFunction()')"
  onmouseout="bmButtonMouseOut(this,'javascript:editPreModifyFunction()')"
  class="plain-button"
  cellspacing="0"
  cellpadding="0"
  role="button"
  aria-label="Define Function"
  style="cursor: pointer;"
>
  <tbody>
    <tr>
      <td class="button-left">
        <img class="button-left" src="/img/button10.gif" />
      </td>
      <td class="button-middle" nowrap="true">
        <div style="margin: 0px 0px 1px;">
          <a
            class="button-text"
            name="define_function"
            id="define_function"
            href="#"
            >Define Function</a
          >
        </div>
      </td>
      <td class="button-right">
        <img class="button-right" src="/img/button10.gif" />
      </td>
    </tr>
  </tbody>
</table>
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
Yes that's correct. I believe you tested before and confirmed the Extension runs even when you open the BML Editor in a new window versus another tab. We need the Load and Unload to run on the BML Editor window but ideally we can find a way to Load either the Before Formulas or After Formulas from the "General" tab on the Attribute page. I think Tat even had separate buttons in the extention to handle this but I may be making that up.

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

- [x] UNLOAD w/ hardcoding
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
if (typeof filename == 'undefined') {
  if (document.querySelectorAll('input[id^=x-auto]')[1].value) {
    let filename = document.querySelectorAll('input[id^=x-auto]')[1].value
    alert(filename)
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
      `<input type="text" class=" x-form-field x-form-text" id="x-auto-3-input" name="varName" tabindex="0" style="width: 340px;" readonly="" disabled="">`
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
  - [ ] adminconfigContent chrome.runtime.onMessage.addListener vs. content chrome.runtime.onMessage.addListener - [ ] filename var - [ ] make the addlisteners code match around filename var check if works + go for walk.
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
function fn(elem){
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
document
  .querySelectorAll('iframe')
  .forEach(item =>
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
chrome.tabs.query(
  {
    active: false
  },
  tabs => {
    let tab = tabs.reduce((previous, current) => {
      return previous.lastAccessed > current.lastAccessed ? previous : current
    })
    // previous tab
    console.log(tab)
  }
)
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
<textarea
  style="width: 242px; height: 44px;"
  autocomplete="off"
  id="ext-comp-1055"
  name="testScript"
  class=" x-form-textarea x-form-field"
></textarea>
```

COMMERCE TEST TEXT AREA

```html
<textarea
  style="width: 242px; height: 44px;"
  autocomplete="off"
  id="ext-comp-1080"
  name="testScript"
  class=" x-form-textarea x-form-field "
></textarea>
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
if (document.querySelector('.xpanel-header-text')) {
  header = document.querySelector('.x-panel-header-text')
  isUtil = header.innerHTML.includes('Util')
  isCommerce = header.innerHTML.includes('Commerce')
  if (isCommerce) {
    bmSiteType = 'commerce'
  } else if (isUtil) {
    bmSiteType = 'util'
  } else {
    bmSiteType = 'configuration'
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

  - sent email regarding action id associate with action var name - need to play with this more - <https://www.geeksforgeeks.org/wildcard-selectors-and-in-css-for-classes/?ref=rp> - <input[name="varName"]> - <>
    [attribute^=”str”] Selector: The [attribute^=”value”] selector is used to select those elements whose attribute value begins with a specified value str.
    [attribute$=”str”] Selector: The [attribute$=”value”] selector is used to select those elements whose attribute value ends with a specified value str.
    [attribute*=”str”] Selector: The [attribute*=”str”] selector is used to select that elements whose attribute value contains the specified sub string str. This example shows how to use a wildcard to select all div with a class that contains str. This could be at the start, the end or in the middle of the class.

```css
        <!-- multi contains selector? -->
        div[class^="tocolor-"], div[class*=" tocolor-"] { <- something like this maybe

    }
```

- editAreas
- [x] add in (site) folder - devmcnichols, etc.
- [ ]

```js
document
  .querySelectorAll('iframe')
  .forEach(item =>
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
<input
  type="text"
  class=" x-form-field x-form-text"
  id="x-auto-3-input"
  name="varName"
  tabindex="0"
  style="width: 340px;"
  readonly=""
  disabled=""
/>
```

```js
document.querySelector('#x-auto-3-input')
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

`html <input type="text" class=" x-form-field x-form-text" id="x-auto-214-input" name="varName" tabindex="0" readonly="" disabled="" style="width: 260px;">`

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
  - `html <span class="x-panel-header-text" id="ext-gen55">Util BML Library Function Editor: Properties &amp; Parameters</span>`

TEMP NOTES

```html
<textarea
  id="textarea"
  wrap="off"
  onchange='editArea.execCommand("onchange");'
  onfocus="javascript:editArea.textareaFocused=true;"
  onblur="javascript:editArea.textareaFocused=false;"
  style="width: 492px; height: 2325px; font-family: monospace; font-size: 10pt; line-height: 15px; margin-left: 0px; margin-top: 0px;"
  classname="null hidden"
  class="null hidden"
  spellcheck="false"
></textarea>
```

```css
#textarea
```

```js
document.querySelector('#textarea')
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
function getElementByXpath (path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
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
<div
  id="selection_field"
  class=""
  style="display: block; font-family: monospace; font-size: 10pt; line-height: 15px; top: 15px; width: 2468px;"
>
  <span></span><strong></strong><span> // </span>
</div>
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
$('#foo').on('click', function () {
  alert($(this).text())
})
$('#foo').trigger('click')
```

```js
$('#foo').on('custom', function (event, param1, param2) {
  alert(param1 + '\n' + param2)
})
$('#foo').trigger('custom', ['Custom', 'Event'])
```

TRIGGER TRIALS

```js
$('#textrea').on('click', function () {
  alert($(this).text())
})
$('#textrea').trigger('click')
```

```js
var jq = document.createElement('script')
jq.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'
document.getElementsByTagName('head')[0].appendChild(jq)
// ... give time for script to load, then type (or see below for non wait option)
jQuery.noConflict()
```

```js
$('textarea')
  .last()
  .click()

$('textarea')
  .last()
  .on('click', function () {
    alert($(this).text())
  })

$('#textrea')
  .last()
  .trigger('click')
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
chrome.runtime.sendMessage({ greeting: 'hello' }, function (response) {
  console.log(response.farewell)
})
```

```js
// EXTENSION TO CONTENT SCRIPT
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { greeting: 'hello' }, function (
    response
  ) {
    console.log(response.farewell)
  })
})
```

```js
//RECEIVING END
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  )
  if (request.greeting == 'hello') sendResponse({ farewell: 'goodbye' })
})
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
Pay the \$5 registration fee 2 Register as Chrome Web Store Developer
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
<table
  onclick="javascript:editPreModifyFunction();bmCancelBubble(event)"
  onmouseover="bmButtonMouseOver(this,'javascript:editPreModifyFunction()')"
  onmousedown="bmButtonMouseDown(this,'javascript:editPreModifyFunction()')"
  onmouseup="bmButtonMouseUp(this,'javascript:editPreModifyFunction()')"
  onmouseout="bmButtonMouseOut(this,'javascript:editPreModifyFunction()')"
  class="plain-button"
  cellspacing="0"
  cellpadding="0"
  role="button"
  aria-label="Define Function"
  style="cursor: pointer;"
>
  <tbody>
    <tr>
      <td class="button-left">
        <img class="button-left" src="/img/button10.gif" />
      </td>
      <td class="button-middle" nowrap="true">
        <div style="margin: 0px 0px 1px;">
          <a
            class="button-text"
            name="define_function"
            id="define_function"
            href="#"
            >Define Function</a
          >
        </div>
      </td>
      <td class="button-right">
        <img class="button-right" src="/img/button10.gif" />
      </td>
    </tr>
  </tbody>
</table>
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
Language

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
<input
  type="text"
  class=" x-form-field x-form-text"
  id="x-auto-214-input"
  name="varName"
  tabindex="0"
  style="width: 260px;"
  readonly=""
  disabled=""
/>
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
chrome.tabs.query({ currentWindow: true }, function (result) {
  result.forEach(function (tab) {
    //         do stuff here;
    console.log('TABID')
    console.log(tab.id)
    console.log('TABNAME')
    console.log(tab.name)
  })
})
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

`html document.getElementsByClassName("bottom-bar")[0].innerHTML;`

###### COMM ACTIONS URLS

COMM ACTION FULL VARNAME LIST - <https://devmcnichols.bigmachines.com/admin/commerce/actions/list_actions.jsp?doc_id=4653823>
COMM ACTION VARNAME PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=54983795&doc_id=4653823>
COMM ACTION EDITOR PAGE - <https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795>

WEBSTORE

- [ ] run through webstore process + assets

1/19/20

COMM RULES
finish testing comm rules -[x] debug constrain rules function - constrainMultipleFreightGridSelects - downloads some weird chrome partial file (non BML). Seems to work fine today. Keep on eye out for partial downloads bug. -[ ] rare scenario where underscore in BML filename. <- add fix to rmeove underscores

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

Streamline your Oracle CPQ Cloud implementations, workflows, development, administration, and maintenance.

LOAD and UNLOAD your BML scripts to and from Oracle CPQ Cloud.

Compatible with:

- Configuration (Recommendations, Constraints, Hiding Attributes, Recommended Items) - Advanced Conditions

- Commerce Library Functions and Test Scripts + Actions (Advanced Modify - Before/After Formulas) + Rules (Constraint, Hiding, Validation - Advanced Conditions)

- Utility Functions + Test Scripts

Use with your favorite Text Editor instead of the Big Machines web-based editors.

Manage your BML code using Git versioning control.

Auto "check" and "validate" to improve code quality and debugging efficiency.

Please create any bugs/issues/feature requests [here](https://github.com/loganbek/streamlineTools/issues/new/choose).

Strip and rip from other chome extensions.

<https://developer.chrome.com/docs/webstore/publish>

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

  - [x] register as chrome developer
  - [x] Google Analytics ID - 260194142
  - [ ] permission cleanup

    - [x] current perms

    ```json  "permissions": [
        "downloads", // required for BML file downloads in Chrome (onDeterminingFilename specifically).
        "activeTab", // req for access to current tab DOM.
        "declarativeContent", //  req for page state matching + injecting scripts
        "storage", // propbably can remove may need later (currently not used)
        "file://*", // used for injection scripts
        "tabs" // req for requesting specific tab info
    ],
    ```

  - [x] permission justification + add to privacy practices.

  The "downloads" permission is required in order to download the BML scripts locally.

  The "activeTab" permission is required in order to access the current tab DOM and grab information such as the filename.

  The "declarativeContent" permission is required in for the page state matcher and injecting content scripts.

  The "storage" permission is used to store the filename and commentHeader in certain instances. It's also used to store options selections made by the user.

  The "file://\*" permission is required to executeContent + injection scripts. // Not need I guess

  The "tabs" permission is required for requesting specific tab info, much like the "activeTab" permission.

  - [ ] edit chrome web store assets and blur client information.
  - [x] email Chris copy + assets (TODO) and get A OK
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

<https://chrome.google.com/webstore/category/extensions?hl=en>

Other:

Email regarding remotely hosted code removal in mani v3

Status Update

- [ ] Preview Dev Console + Store Listing + Privacy Practices + Pricing & Distribution - <https://chrome.google.com/webstore/devconsole/ed6f5e47-5734-4a9b-be3f-7babc417c88e/dpedakjcalecgiigkhblajfgojjhdgoc/edit>
- [ ] Chris Q's
  - status on non client environment? - Is this possible to get?
  - what license would you like to release under?

MEETING 2/5/21

Sample Exteion Description from Chrome Web Store

Talend API Tester - Free Edition

Visually interact with REST, SOAP and HTTP APIs.
Welcome to Talend API Tester - Free Edition, formerly known as Restlet Client. Talend API Tester makes it easy to invoke, discover and test HTTP and REST APIs.

Talend API Tester - Free Edition's main functions include:

1.Send requests and inspect responses

Talend API Tester - Free Edition handles all HTTP requests, no matter how complex. Requests can be made dynamic by inserting variables. Security and authentication are fully supported, as well as hypermedia and HTML forms. You can visualize, prettify and inspect HTTP responses.

2.Validate API behavior

Whether you want to check that your API is behaving as specified, or you need to confirm how well third-party APIs are responding, Talend API Tester lets you perform many sorts of API response tests. Use assertions to validate values of headers, parts of the body or response time among others. Environments variables can also be created to increase the reusability of your tests.

Key features:

- Interact with REST or simple HTTP APIs through a visual and easy-to-use UI
- View and search your call history. Edit and re-send requests from history.
  - Save and organize your requests into projects and services.
  - Build dynamic requests with custom variables, security and authentication.
  - Visualise and inspect responses of different format (JSON, XML, HTML, images...) using different views (raw, pretty, preview)
  - Validate responses with assertions (status, headers, XML and JSON body, response time...)
  - Easily import your Postman Collections, Swagger / OAS / OpenAPI and HAR (HTTP Archive).

---

Why does Talend API Tester require "Read and change all your data on the websites you visit" and "Communicate with cooperating websites" permissions?

Chrome extensions which need access to internet resources must have the resources declared in their manifest which can be a list of URLs or URL mask. For example, http://*/* allow access to any URL. Allowing access to any URL is a primary function of Talend API Tester. The URL mask with wildcards is interpreted by Chrome Web Store as Talend API Tester can read and change all your data on the websites you visit, without meaning that the app is doing something wrong.

FUTURE: KEYMAP EXTENSIONS

## 3/1-7/21

## 4/4 Meeting Notes

- [x] devmcnichols login (password incorrect) - Chris - maybe env updates?
- [ ] review code base (Logan)
- [ ] Chrome Web Store Review (near completion) - Logan
- [ ] take + blurr screenshots/assets - Logan
- [ ] smoke test - Logan
- [ ] functionality check - Logan
- [ ] list of tasks before release
  - [ ] config extra click solution (new branch)
  - [ ] look for loading modal in editor and recreate onload in config
  - [ ] discuss other config solutions @ next meeting
  - [ ] milestone texts throughout week

## Other

- [ ] Streamline hireing push spring/summer + resume session.

## 4/6/21

- [ ] config loading modal planning
  - [ ] ideally replicate modal from other editors on site.
    - [x] review other editors
      - [x] pricing has loading modal on page load, maybe can use debugger to copy as is.
      - [x] same w/ config loading modal

### CONFIG LOADING MODAL DEV STEPS

- [ ] determine where to add modal within DOM
  - [ ] try within div w/ `id="editor"` or `id="result"`
  - [ ] `/html/body/div[6]/div[12]`
- [ ] create loading modal w/ same styling
- [ ] add to DOM
- [ ] remove from DOM on click event

```html
<div id="bmui-loading">
  <div class="loading-indicator">
    <img
      src="/img/default/loading.gif"
      style="width:16px;height:16px;"
      align="absmiddle"
    />
    <div id="bmui-message">&nbsp;Loading...</div>
  </div>
</div>
```

```css
/* color: black;
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
font-size: 8pt;
margin: 0;
position: absolute;
left: 45%;
top: 40%;
border: 1px solid #6593cf;
padding: 2px;
background: #c3daf9;
width: 150px;
text-align: center;
z-index: 20001; */
```

```js
document.querySelector('#bmui-loading')
```

```lang-xml
/html/body/div[1]/div[4]
```

```xml
//*[@id="bmui-loading"]
```

## 4/7+11/21

- [ ] config loading modal planning

  - pricing function (106 requests pre validate, 110 post validate)

  - [ ] create modal
    - [ ] loading gif
    - [ ] top padding/margin?

MODAL FROM PRICING FUNCTION

```css
#bmui-loading {
  position: absolute;
  left: 45%;
  top: 40%;
  border: 1px solid #6593cf;
  padding: 2px;
  background: #c3daf9;
  width: 150px;
  text-align: center;
  z-index: 20001;
}
#bmui-loading .loading-indicator {
  border: 1px solid #a3bad9;
  background: white repeat-x;
  color: #003366;
  font: bold 13px tahoma, arial, helvetica;
  padding: 10px;
  margin: 0;
}
```

COMPUTED STYLE:

```css
/* align-content normal
align-items normal
align-self auto
alignment-baseline auto
all
animation-delay 0s
animation-direction normal
animation-duration 0s
animation-fill-mode none
animation-iteration-count 1
animation-name none
animation-play-state running
animation-timing-function ease
appearance none
aspect-ratio auto
backdrop-filter none
backface-visibility visible
background-attachment scroll
background-blend-mode normal
background-clip border-box
background-color rgb(195, 218, 249)
background-image none
background-origin padding-box
background-position-x 0%
background-position-y 0%
background-repeat-x
background-repeat-y
background-size auto
baseline-shift 0px
block-size 54px
border-block-end-color rgb(101, 147, 207)
border-block-end-style solid
border-block-end-width 1px
border-block-start-color rgb(101, 147, 207)
border-block-start-style solid
border-block-start-width 1px
border-bottom-color rgb(101, 147, 207)
border-bottom-left-radius 0px
border-bottom-right-radius 0px
border-bottom-style solid
border-bottom-width 1px
border-collapse separate
border-end-end-radius 0px
border-end-start-radius 0px
border-image-outset 0
border-image-repeat stretch
border-image-slice 100%
border-image-source none
border-image-width 1
border-inline-end-color rgb(101, 147, 207)
border-inline-end-style solid
border-inline-end-width 1px
border-inline-start-color rgb(101, 147, 207)
border-inline-start-style solid
border-inline-start-width 1px
border-left-color rgb(101, 147, 207)
border-left-style solid
border-left-width 1px
border-right-color rgb(101, 147, 207)
border-right-style solid
border-right-width 1px
border-start-end-radius 0px
border-start-start-radius 0px
border-top-color rgb(101, 147, 207)
border-top-left-radius 0px
border-top-right-radius 0px
border-top-style solid
border-top-width 1px
bottom 795.609px
box-shadow none
box-sizing content-box
break-after auto
break-before auto
break-inside auto
buffered-rendering auto
caption-side top
caret-color rgb(0, 0, 0)
clear none
clip auto
clip-path none
clip-rule nonzero
color rgb(0, 0, 0)
color-interpolation srgb
color-interpolation-filters linearrgb
color-rendering auto
color-scheme normal
column-count auto
column-fill balance
column-gap normal
column-rule-color rgb(0, 0, 0)
column-rule-style none
column-rule-width 0px
column-span none
column-width auto
contain none
contain-intrinsic-size auto
content normal
content-visibility visible
counter-increment none
counter-reset none
counter-set none
cursor auto
cx 0px
cy 0px
d none
direction ltr
display block
dominant-baseline auto
empty-cells show
fill rgb(0, 0, 0)
fill-opacity 1
fill-rule nonzero
filter none
flex-basis auto
flex-direction row
flex-grow 0
flex-shrink 1
flex-wrap nowrap
float none
flood-color rgb(0, 0, 0)
flood-opacity 1
font-family "Helvetica Neue", Helvetica, Arial, sans-serif
font-feature-settings normal
font-kerning auto
font-optical-sizing auto
font-size 10.6667px
font-stretch 100%
font-style normal
font-variant-caps normal
font-variant-east-asian normal
font-variant-ligatures normal
font-variant-numeric normal
font-variation-settings normal
font-weight 400
forced-color-adjust auto
grid-auto-columns auto
grid-auto-flow row
grid-auto-rows auto
grid-column-end auto
grid-column-start auto
grid-row-end auto
grid-row-start auto
grid-template-areas none
grid-template-columns none
grid-template-rows none
height 54px
hyphens manual
image-orientation from-image
image-rendering auto
inline-size 150px
inset-block-end 795.609px
inset-block-start 570.391px
inset-inline-end 1000.66px
inset-inline-start 946.344px
isolation auto
justify-content normal
justify-items normal
justify-self auto
left 946.344px
letter-spacing normal
lighting-color rgb(255, 255, 255)
line-break auto
line-height normal
list-style-image none
list-style-position outside
list-style-type disc
margin-block-end 0px
margin-block-start 0px
margin-bottom 0px
margin-inline-end 0px
margin-inline-start 0px
margin-left 0px
margin-right 0px
margin-top 0px
marker-end none
marker-mid none
marker-start none
mask none
mask-type luminance
max-block-size none
max-height none
max-inline-size none
max-width none
min-block-size 0px
min-height 0px
min-inline-size 0px
min-width 0px
mix-blend-mode normal
object-fit fill
object-position 50% 50%
offset-distance 0px
offset-path none
offset-rotate auto 0deg
opacity 1
order 0
orphans 2
outline-color rgb(0, 0, 0)
outline-offset 0px
outline-style none
outline-width 0px
overflow-anchor auto
overflow-wrap normal
overflow-x visible
overflow-y visible
overscroll-behavior-block auto
overscroll-behavior-inline auto
overscroll-behavior-x auto
overscroll-behavior-y auto
padding-block-end 2px
padding-block-start 2px
padding-bottom 2px
padding-inline-end 2px
padding-inline-start 2px
padding-left 2px
padding-right 2px
padding-top 2px
page auto
page-orientation
paint-order normal
perspective none
perspective-origin 78px 30px
pointer-events auto
position absolute
quotes auto
r 0px
resize none
right 1000.66px
row-gap normal
ruby-position over
rx auto
ry auto
scroll-behavior auto
scroll-margin-block-end 0px
scroll-margin-block-start 0px
scroll-margin-bottom 0px
scroll-margin-inline-end 0px
scroll-margin-inline-start 0px
scroll-margin-left 0px
scroll-margin-right 0px
scroll-margin-top 0px
scroll-padding-block-end auto
scroll-padding-block-start auto
scroll-padding-bottom auto
scroll-padding-inline-end auto
scroll-padding-inline-start auto
scroll-padding-left auto
scroll-padding-right auto
scroll-padding-top auto
scroll-snap-align none
scroll-snap-stop normal
scroll-snap-type none
shape-image-threshold 0
shape-margin 0px
shape-outside none
shape-rendering auto
size
speak normal
stop-color rgb(0, 0, 0)
stop-opacity 1
stroke none
stroke-dasharray none
stroke-dashoffset 0px
stroke-linecap butt
stroke-linejoin miter
stroke-miterlimit 4
stroke-opacity 1
stroke-width 1px
tab-size 8
table-layout auto
text-align center
text-align-last auto
text-anchor start
text-combine-upright none
text-decoration-color rgb(0, 0, 0)
text-decoration-line none
text-decoration-skip-ink auto
text-decoration-style solid
text-decoration-thickness auto
text-indent 0px
text-orientation mixed
text-overflow clip
text-rendering auto
text-shadow none
text-size-adjust auto
text-transform none
text-underline-offset auto
text-underline-position auto
top 570.391px
40% #bmui-loading
touch-action auto
transform none
transform-box view-box
transform-origin 78px 30px
transform-style flat
transition-delay 0s
transition-duration 0s
transition-property all
transition-timing-function ease
unicode-bidi normal
user-select auto
vector-effect none
vertical-align baseline
visibility visible
white-space normal
widows 2
width 150px
will-change auto
word-break normal
word-spacing 0px
writing-mode horizontal-tb
x 0px
y 0px
z-index 20001
zoom 1
-webkit-app-region none
-webkit-border-horizontal-spacing 0px
-webkit-border-vertical-spacing 0px
-webkit-box-align stretch
-webkit-box-decoration-break slice
-webkit-box-direction normal
-webkit-box-flex 0
-webkit-box-ordinal-group 1
-webkit-box-orient horizontal
-webkit-box-pack start
-webkit-box-reflect none
-webkit-font-smoothing auto
-webkit-highlight none
-webkit-hyphenate-character auto
-webkit-line-clamp none
-webkit-locale "en-US"
-webkit-mask-box-image-outset 0
-webkit-mask-box-image-repeat stretch
-webkit-mask-box-image-slice 0 fill
-webkit-mask-box-image-source none
-webkit-mask-box-image-width auto
-webkit-mask-clip border-box
-webkit-mask-composite source-over
-webkit-mask-image none
-webkit-mask-origin border-box
-webkit-mask-position-x 0%
-webkit-mask-position-y 0%
-webkit-mask-repeat-x
-webkit-mask-repeat-y
-webkit-mask-size auto
-webkit-perspective-origin-x
-webkit-perspective-origin-y
-webkit-print-color-adjust economy
-webkit-rtl-ordering logical
-webkit-tap-highlight-color rgba(0, 0, 0, 0.18)
-webkit-text-combine none
-webkit-text-decorations-in-effect none
-webkit-text-emphasis-color rgb(0, 0, 0)
-webkit-text-emphasis-position over right
-webkit-text-emphasis-style none
-webkit-text-fill-color rgb(0, 0, 0)
-webkit-text-security none
-webkit-text-stroke-color rgb(0, 0, 0)
-webkit-text-stroke-width 0px
-webkit-transform-origin-x
-webkit-transform-origin-y
-webkit-transform-origin-z
-webkit-user-drag auto
-webkit-user-modify read-only
-webkit-border-image none
-webkit-ruby-position before
-webkit-text-orientation vertical-right */
```

MODAL FROM CONFIG

```html
<div class="ext-el-mask-msg" style="display: block; left: 1014px; top: 694px;">
  <div>Loading...</div>
</div>
```

```css
.ext-el-mask {
  background-color: #ccc;
}
.ext-el-mask-msg {
  border-color: #6593cf;
  background-color: #c3daf9;
  background-image: url(../images/default/box/tb-blue.gif);
}
.ext-el-mask-msg div {
  background-color: white;
  border-color: #a3bad9;
  color: #222;
  font: normal 11px tahoma, arial, helvetica, sans-serif;
}
.x-mask-loading div {
  background-color: #fbfbfb;
  background-image: url(../images/default/grid/loading.gif);
}
```

`https://devmcnichols.bigmachines.com/gwt/gxt/css/gxt-all.css`

```html
<td class="x-btn-mc">
  <em class="" unselectable="on"
    ><button
      class="x-btn-text "
      type="button"
      style="position: relative; width: 69px;"
      tabindex="0"
    >
      Validate<img
        src="https://devmcnichols.bigmachines.com/gwt/ConfigRuleEditor/clear.cache.gif"
        style='width: 16px; height: 16px; background: url("https://devmcnichols.bigmachines.com/img/bmx/icons/spellcheck.png") 0px 0px no-repeat; position: absolute; left: -1px; top: -1px;'
        border="0"
        role="presentation"
        class=" x-btn-image"
      /></button
  ></em>
</td>
```

### COMMERCE LIBS

- [ ] commerce pricing test

> chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/content.js:55:25
>
> > Error in event handler: ReferenceError: contentHeader is not defined at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/content.js:55:25

### COMMERCE RULESS

### UTIL

- [ ] util lib test

> Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
> popup.js:88 unload clicked
> popup.html:1 Unchecked runtime.lastError: The message port closed before a response was received.
> popup.html:1 Error handling response: TypeError: Cannot read property 'code' of undefined
> at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/popup.js:93:26

- [ ] config

## 4/19/21 Config Modal DEV

- [ ] reconstruct config loading modal
- [ ] review DOM to determine modal parent
- [ ] post click anywhere on page remove modal
- [ ] validate

- [ ] Config Modal Loading Dialog development

  - [ ] Develop gameplan

    - [ ] Create HTML in content.js or injected.js script
    - [ ] On LOAD event add loading modal to

      - [ ] find where to append?
      - [ ] maybe use append child

        ```jsx
        var obj = document.createElement('div')
        obj.id = '::img'
        obj.style.cssText =
          'position:absolute;top:300px;left:300px;width:200px;height:200px;-moz-border-radius:100px;border:1px  solid #ddd;-moz-box-shadow: 0px 0px 8px  #fff;display:none;'

        document.getElementById('divInsteadOfDocument.Write').appendChild(obj)
        /* You can also see how to set the the CSS in one go (using element.style.cssText).*/
        ```

    - [ ] On click event anywhere on page remove modal
      - [ ] Then click validate

## Cleanup

- [ ] rm adminConfigContent logging
- [ ] rm adminConfigInjected logging

## 4/26/21 Streamline Tools Sync

<https://www.notion.so/Streamline-Tools-Update-4-26-21-f518209b04704e63ad42be0a08193220>

## Remaining Tasks (Development + Testing + Error fixes)

### Utility Function

- [ ] fix error:

```console
from the extension
VM285 content.js:48 greeting: unload
VM285 content.js:54 CH
6Error in event handler: ReferenceError: contentHeader is not defined
    at <URL>
VM285 content.js:45 from the extension
VM285 content.js:48 greeting: filename
VM285 content.js:45 from the extension
VM285 content.js:48 greeting: unload
VM285 content.js:54 CH
```

```console
https://devmcnichols
popup.js:35 devmcnichols
popup.js:37 bigmachines
popup.js:38 com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274220560%27,folder_id:%274133367%27,process_id:%27-1%27,doc_id:%27-1%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271
popup.js:40 commerce
popup.js:60 getMaxDiscount
popup.js:88 unload clicked
popup.html:1 Unchecked runtime.lastError: The message port closed before a response was received.
popup.html:1 Error handling response: TypeError: Cannot read property 'code' of undefined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/popup.js:93:26
```

### Configuration (Recommendations, Constraints, Hiding Attributes, Recommended Items) - Advanced Conditions

- [ ] test loading modal on all advanced condition types

```js
document.querySelector('#editor')
```

### Commerce Library Functions and Test Scripts + Actions (Advanced Modify - Before/After Formulas) + Rules (Constraint, Hiding, Validation - Advanced Conditions)

- [ ] fix error:

```console
Error in event handler: ReferenceError: contentHeader is not defined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/content.js:55:25
```

```console
popup.html:1 Unchecked runtime.lastError: The message port closed before a response was received.
popup.html:1 Error handling response: TypeError: Cannot read property 'code' of undefined
    at chrome-extension://emnmnbbfkjncmideeepckbclmilhcboc/popup.js:93:26
```

### Other Enhancements

- [ ] improve troublshooting steps
- [ ] auto command (alt) click view/edit button

```html
<button
  class="x-btn-text "
  type="button"
  style="position: relative; width: 157px;"
  tabindex="0"
>
  View/Edit the BML Function<img
    src="https://devmcnichols.bigmachines.com/gwt/ConfigRuleEditor/clear.cache.gif"
    style='width: 16px; height: 16px; background: url("https://devmcnichols.bigmachines.com/img/bmx/icons/script_edit.png") 0px 0px no-repeat; position: absolute; left: 0px; top: -1px;'
    border="0"
    role="presentation"
    class=" x-btn-image"
  />
</button>
```

RESOURCES COPY
Resource Gathering

## Chrome Extension

<https://www.youtube.com/watch?time_continue=2&v=bmxr75CV36A&feature=emb_logo>

<https://developer.chrome.com/extensions/getstarted>

<https://developer.chrome.com/extensions/api_index>

<https://developer.chrome.com/extensions/overview>

<https://developer.chrome.com/extensions/declarativeContent>

<https://developer.chrome.com/extensions/content_scripts>

asynch js call to local file system - <https://web.dev/native-file-system/>

<https://developer.chrome.com/apps/fileSystem>

<https://developer.chrome.com/apps/app_codelab_filesystem>

<https://github.com/loganbek/text-editor>

<https://developer.chrome.com/extensions/messaging>

<https://stackoverflow.com/questions/45379920/loading-libraries-for-use-in-a-content-script>

<https://developer.chrome.com/extensions/options#:~:text=A%20user%20can%20view%20an,then%20selection%20the%20options%20link.>

You are going to need to write a Chrome extension that exposes an API to your website. This is the easy part. You inject a content script to your website, and then use `chrome.extension.sendMessage` to communicate back to your extension.

The hard part is to actually open the bat file from your extension. With NPAPI, this would have been easy, since you could just write a C++ plugin that calls CreateProcess or something. Contrary to what you said, it's a pretty good solution. But unfortunately, NPAPI isn't an option, since it's being deprecated.

So what you should do is to use Native Messaging. Basically, it's a Chrome API that allows extensions to exchange messages with native applications using standard input and output streams.

Read more about it here: <https://developer.chrome.com/extensions/messaging#native-messaging-host>

Content scripts are less trustworthy than the extension background page (e.g., a malicious web page might be able to compromise the renderer process where the content scripts run). Assume that messages from a content script might have been crafted by an attacker and make sure to validate and sanitize all input.

```javascript
chrome.tabs.sendMessage(tab.id, { greeting: 'hello' }, function (response) {
  // JSON.parse does not evaluate the attacker's scripts.
  var resp = JSON.parse(response.farewell)
})

chrome.tabs.sendMessage(tab.id, { greeting: 'hello' }, function (response) {
  // innerText does not let the attacker inject HTML elements.
  document.getElementById('resp').innerText = response.farewell
})
```

### Extension Logic

- [x] manifest.json
- [ ] background.js
- [ ] contentscript.js

### UI

- [x] popup.html
- [ ] popup.js
- [x] options.html
- [ ] options.js

### Color Scheme

- [ ] #80CFE2 - lightest blue
- [ ] #00A0C6 - lighter blue
- [ ] #0C5FA8 - light blue
- [ ] #60017C - purple
- [ ] #AC057E - pink
- [ ] #F0037F - hot pink
- [ ] #4F1E72 - purp2

### Github API

<https://developer.github.com/v3/>

### VSCode/Text Editor

<https://code.visualstudio.com/api>

#### VSCode BML Extension

<https://marketplace.visualstudio.com/items?itemName=CPQConsultant.cpq-devkit-o&utm_source=www.vsixhub.com>

### BigMachines

Pricing Function URL - <https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274658213%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}}&token=pyrJ5oRVa-f9q9NpJ4L8q8rI3_U>

### JS util libs - TBD

jQuery?
maybe FE lib

VSCode Chrome Extension Debugging
<https://www.freecodecamp.org/news/how-to-set-up-the-debugger-for-chrome-extension-in-visual-studio-code-c0b3e5937c01/>
Launch Chrome w/ Remote Debugging

```sh
    `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222`
```

<https://github.com/Microsoft/vscode-chrome-debug#other-optional-launch-config-fields>

## CE Shortcuts

CE Shortcuts Guide (user)-
<https://obie.ai/blog/how-to-add-and-remove-custom-keyboard-shortcuts-and-hotkeys-for-a-chrome-extension-in-5-seconds-flat/>

CE Shortcuts Guide (dev)
<https://dev.to/paulasantamaria/adding-shortcuts-to-your-chrome-extension-2i20>

<chrome://extensions/shortcuts>
<https://developer.chrome.com/docs/extensions/reference/commands/>

<https://dev.to/paulasantamaria/chrome-extensions-adding-a-badge-644>

- pageactions cannot have badges
  <https://developer.chrome.com/docs/extensions/reference/pageAction/>

  shrotcut - chrome vs. global command scropes?

```html
<div class="ext-el-mask" style="display: block;"></div>
```

copy styles ext-el-mask

```css
div.ext-el-mask {
  color: black;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';
  font-size: 8pt;
  visibility: visible;
  margin: 0;
  padding: 0;
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
  width: 100%;
  height: 100%;
  zoom: 1;
  background-color: #ccc;
  display: block;
}
```

```html
<div class="ext-el-mask" style="display: block;">
  <div class="ext-el-mask-msg" style="display: block; left: 955px; top: 726px;">
    <div>Loading...</div>
  </div>
</div>
```

```html
<div class="ext-el-mask-msg" style="display: block; left: 955px; top: 726px;">
  <div>Loading...</div>
</div>
```

copy styles - ext-el-mask-msg

```css
div.ext-el-mask-msg {
  color: black;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 8pt;
  visibility: visible;
  margin: 0;
  z-index: 101;
  position: absolute;
  border: 1px solid;
  background: repeat-x 0 -16px;
  padding: 2px;
  border-color: #6593cf;
  background-color: #c3daf9;
  background-image: url(../images/default/box/tb-blue.gif);
  display: block;
  left: 955px;
  top: 726px;
}
```

copy styles - div

```css
.ext-el-mask-msg > div {
  visibility: visible;
  margin: 0;
  padding: 5px 10px 5px 10px;
  border: 1px solid;
  cursor: wait;
  background-color: white;
  border-color: #a3bad9;
  color: #222;
  font: normal 11px tahoma, arial, helvetica, sans-serif;
}
```

configModalHook - #x-auto-154
or class=" x-window x-component x-window-maximized x-masked"

```js
document.getElementsByClassName(
  ' x-window x-component x-window-maximized x-masked'
)[0]
```

### CLEANUP

```sh
➜ lint-concise
standard: Use JavaScript Standard Style (https://standardjs.com)
33     'chrome' is not defined
29     Expected '===' and instead saw '=='
29     'CustomEvent' is not defined
25     'code' is not defined
25     Unexpected tab character
18     'fileStringArray' is not defined
18     'textAreaCode' is not defined
12     'testCommerceCode' is not defined
10     'textarea' is not defined
6      'iframes' is not defined
6      'alert' is not defined
4      'commentHeader' is not defined
4      'textArea' is assigned a value but never used
4      Opening curly brace does not appear on the same line as controlling statement
3      Unexpected var, use let or const instead
3      'modalHook' is not defined
3      'testConfigCode' is not defined
3      'jsonRespStr' is not defined
3      'frame_bm_script' is not defined
2      'testCode' is not defined
2      'detail1' is not defined
2      'elem' is assigned a value but never used
2      'divXWindow' is not defined
2      'buttonCollection' is not defined
2      Unexpected mix of '&&' and '||'
2      Do not access Object.prototype method 'hasOwnProperty' from target object
2      'unloaded' is assigned a value but never used
2      'unloadedTest' is assigned a value but never used
1      'filenameAfter' is defined but never used
1      'filenameBefore' is defined but never used
1      'filename' was used before it was defined
1      'getElementsStartsWithId' is defined but never used
1      'target' is not defined
1      Expected '!==' and instead saw '!='
1      'validateButton' is not defined
1      Duplicate key 'pageUrl'
1      'contentHeader' is not defined
1      Unnecessary escape character
1      eval can be harmful
1      'message1' is assigned a value but never used
1      'message3' is assigned a value but never used
1      'message2' is assigned a value but never used
1      Identifier 'save_options' is not in camel case
1      Identifier 'restore_options' is not in camel case
1      'commentHeader' is defined but never used
1      'url' is defined but never used
1      'header' is defined but never used
1      'fileName' is assigned a value but never used
1      'options' is assigned a value but never used
```

<https://www.freecodecamp.org/news/chrome-extension-with-parcel-tailwind/>
<https://www.freecodecamp.org/news/chrome-extension-message-passing-essentials/>

```js
<script type="text/javascript">
var _BM_USER_LANGUAGE='en';
var _BM_USER_CURRENCY='USD';
var _BM_USER_CURRENCY_SYMBOL='$';
var _BM_USER_CURRENCY_FORMAT='0';
var _BM_USER_LOGIN='CWilliams';
var _BM_USER_EMAIL='cwilliams@streamlinecpq.com';
var _BM_USER_COMPANY='DevMcNichols';
var _BM_USER_NUMBER_FORMAT='0';
var _BM_CSRF_TOKEN='jkJm-_SD5nEWBsGBm0X5DwvQOlp0lBArQy-vPudC-ESjrSFgnqNilNGSFIw';
var _BM_HOST_COMPANY='devmcnichols';
var _BM_STORED_PRECISION='4';var userDateInfo = { dateFormat : 'MM/dd/yyyy', userTimeZoneId : 'America/Los_Angeles', defaultTimeZoneId : 'America/New_York', dateTimeFormat : 'MM/dd/yyyy HH:mm', jQueryDateFormat : 'mm/dd/yy', defaultTimeZone : 300, userTimeZone : 480 };var _BM_IS_IN_GLOBAL_DEBUG_MODE=false;var _BM_USE_ALTA_HEADER=false;var _BM_APPLY_IOS_SCROLL_FIX=true;var _BM_USER_FULL_ACCESS=true;</script>
```

Maybe useful later for showing current user + versioning

look into using tailwind.css

<https://smashingmagazine.com/2017/04/browser-extension-edge-chrome-firefox-opera-brave-vivaldi/>

<!-- OLD options -->

```json
"options_ui": {
"page": "options.html",
"open_in_tab": true
},
```

PageStateMatching Revision
Commerce + Utils
<https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:%274658214%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}&inputdata={appid:%27sampleApp%27,service:%27bmllibraryservice%27,operation:%27getLibPageData%27,version:%271.0%27,header:%27%27,params:%20{componentid:%27libraryEditorPage%27,uicmd:%27defineComponent%27,%20id:%274658214%27,folder_id:%27-1%27,process_id:%274653759%27,doc_id:%274653823%27}}&token=KI3u8AmlT7WoWdKtjOJPVc36Ad3xrEFDRI5vysQcaHoCt3Gq-9gzpPpEu5c>

Config

<https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5048369&rule_type=11&pline_id=-1&segment_id=11&model_id=-1&fromList=true>

```js
/**
 * The BigMachines JavaScript Framework v2
 * @version Mon Dec 19 11:24:51 2011
 **/
(function(context) { 
  var setup = {}, initiate_require, bootstrap, repeat_until;
  /**
   * This is the setup section of the BigMachines JavaScript Framework.
   * Set "active" to true for any pages that you want to customize with Javascript
   * Then write your code in the corresponding file in the File Manager
   *
   * For instance, if I set homepage:true then I can write my code in homepage.js
   */
  setup.pages = {
   homepage: {
    active:true
   },
   commerce: {
    active:true
   },
   commerce_line: { 
    active:true
   },
   config: {
    active:true
    //active:false
   },
   sitewide: {
    active:false
   }
  };
 
 /**
  * Support Code Starts here. Do not edit below this line.
  **/
 /**
  * Simple polling. repeat_until(function, delay).and_then(function).timeout(function, time); 
  */
 (function(context) {
  repeat_until = function(test, delay) {
   var done = false, me,
    success_timer, success_callback, failure_timer, test_result, repeat;

   delay = delay !== undefined ? delay : 20;

   repeat = function() {
    test_result = test();
    if(test_result === false) {
     success_timer = window.setTimeout(repeat, delay);
    } else {
     done = true;
     if(success_callback) {
      success_callback(test_result);
     }
     window.clearTimeout(failure_timer);
    }
   };

   me = {
    and_then: function(success) {
     success_callback = success;
     if(done && test_result !== false) {
      success_callback(test_result);
     }
     return me;
    },
    timeout: function(failure, time) {
     time = time !== undefined ? time : 7000;
     failure_timer = window.setTimeout(function() {
      if(!done) {
       done = true;
       failure();
       window.clearTimeout(success_timer);
      }
     }, time);
     return me;
    }
   };

   repeat();

   return me;
  };
  context.repeat_until = repeat_until;
 }(context));
 /**
  * Bare-bones, fast publish/subscribe
  **/
 (function(context) {
  var ps = {};
  ps.functions = {};
  ps.sub = function(topic, callback) {
   if(!ps.functions[topic]) {
    ps.functions[topic] = [];
   }
   ps.functions[topic].push(callback);
  };
  ps.pub = function(topic, args) {
   var i, ii, funcs = ps.functions[topic];

   if(!funcs) {return;}
   
   for(i = 0, ii = funcs.length; i<ii; i++) {
    funcs[i].apply(this, args || []);
   }
  };
  ps.clear = function(topic) {
   if(!topic) { 
    ps.functions = {};
   } else {
    ps.functions[topic] = [];
   }
  };

  context.pubsub = ps;
 }(context));
 initiate_require = function(context, bootstrap) {
    var base_url = context.base_url || "/bmfsweb/" + _BM_HOST_COMPANY + "/image/javascript";

    // ====== REQUIRE =====
  /*
   RequireJS 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
   Available via the MIT or new BSD license.
   see: http://github.com/jrburke/requirejs for details
  */
    var requirejs,require,define;(function(){function J(a){return M.call(a)==="[object Function]"}function E(a){return M.call(a)==="[object Array]"}function Z(a,b,c){for(var e in b)!(e in K)&&(!(e in a)||c)&&(a[e]=b[e]);return d}function N(a,b,c){return a=Error(b+"\nhttp://requirejs.org/docs/errors.html#"+a),c&&(a.originalError=c),a}function $(a,b,c){var d,e,f;for(d=0;f=b[d];d++)f=typeof f=="string"?{name:f}:f,e=f.location,c&&(!e||e.indexOf("/")!==0&&e.indexOf(":")===-1)&&(e=c+"/"+(e||f.name)),a[f.name]={name:f.name,location:e||f.name,main:(f.main||"main").replace(da,"").replace(aa,"")}}function V(a,b){a.holdReady?a.holdReady(b):b?a.readyWait+=1:a.ready(!0)}function ea(a){function b(a,b){var c,d;if(a&&a.charAt(0)==="."&&b){t.pkgs[b]?b=[b]:(b=b.split("/"),b=b.slice(0,b.length-1)),c=a=b.concat(a.split("/"));var e;for(d=0;e=c[d];d++)if(e===".")c.splice(d,1),d-=1;else if(e==="..")if(d!==1||c[2]!==".."&&c[0]!=="..")d>0&&(c.splice(d-1,2),d-=2);else break;d=t.pkgs[c=a[0]],a=a.join("/"),d&&a===c+"/"+d.main&&(a=c)}return a}function c(a,c){var d=a?a.indexOf("!"):-1,e=null,f=c?c.name:null,g=a,h,i;return d!==-1&&(e=a.substring(0,d),a=a.substring(d+1,a.length)),e&&(e=b(e,f)),a&&(e?h=(d=x[e])&&d.normalize?d.normalize(a,function(a){return b(a,f)}):b(a,f):(h=b(a,f),i=w[h],i||(i=r.nameToUrl(h,null,c),w[h]=i))),{prefix:e,name:h,parentMap:c,url:i,originalName:g,fullName:e?e+"!"+(h||""):h}}function e(){var a=!0,b=t.priorityWait,c,d;if(b){for(d=0;c=b[d];d++)if(!y[c]){a=!1;break}a&&delete t.priorityWait}return a}function f(a,b,c){return function(){var d=ga.call(arguments,0),e;return c&&J(e=d[d.length-1])&&(e.__requireJsBuild=!0),d.push(b),a.apply(null,d)}}function g(a,b){var c=f(r.require,a,b);return Z(c,{nameToUrl:f(r.nameToUrl,a),toUrl:f(r.toUrl,a),defined:f(r.requireDefined,a),specified:f(r.requireSpecified,a),isBrowser:d.isBrowser}),c}function h(a){var b,e,f;f=a.callback;var g=a.map,h=g.fullName,i=a.deps,j=a.listeners;if(f&&J(f)){if(t.catchError.define)try{e=d.execCb(h,a.callback,i,x[h])}catch(k){b=k}else e=d.execCb(h,a.callback,i,x[h]);h&&(a.cjsModule&&a.cjsModule.exports!==void 0?e=x[h]=a.cjsModule.exports:e===void 0&&a.usingExports?e=x[h]:(x[h]=e,F[h]&&(I[h]=!0)))}else h&&(e=x[h]=f,F[h]&&(I[h]=!0));z[a.id]&&(delete z[a.id],a.isDone=!0,r.waitCount-=1,r.waitCount===0&&(A=[])),delete D[h],d.onResourceLoad&&!a.placeholder&&d.onResourceLoad(r,g,a.depArray);if(b)return e=(h?c(h).url:"")||b.fileName||b.sourceURL,f=b.moduleTree,b=N("defineerror",'Error evaluating module "'+h+'" at location "'+e+'":\n'+b+"\nfileName:"+e+"\nlineNumber: "+(b.lineNumber||b.line),b),b.moduleName=h,b.moduleTree=f,d.onError(b);for(b=0;f=j[b];b++)f(e)}function i(a,b){return function(c){a.depDone[b]||(a.depDone[b]=!0,a.deps[b]=c,a.depCount-=1,a.depCount||h(a))}}function j(a,b){var c=b.map,e=c.fullName,f=c.name,i=E[a]||(E[a]=x[a]),j;b.loading||(b.loading=!0,j=function(a){b.callback=function(){return a},h(b),y[b.id]=!0,s()},j.fromText=function(a,b){var c=O;y[a]=!1,r.scriptCount+=1,r.fake[a]=!0,c&&(O=!1),d.exec(b),c&&(O=!0),r.completeLoad(a)},e in x?j(x[e]):i.load(f,g(c.parentMap,!0),j,t))}function k(a){z[a.id]||(z[a.id]=a,A.push(a),r.waitCount+=1)}function l(a){this.listeners.push(a)}function m(a,b){var d=a.fullName,e=a.prefix,f=e?E[e]||(E[e]=x[e]):null,g,i;return d&&(g=D[d]),!g&&(i=!0,g={id:(e&&!f?C++ +"__p@:":"")+(d||"__r@"+C++),map:a,depCount:0,depDone:[],depCallbacks:[],deps:[],listeners:[],add:l},v[g.id]=!0,d&&(!e||E[e]))&&(D[d]=g),e&&!f?(d=m(c(e),!0),d.add(function(){var b=c(a.originalName,a.parentMap),b=m(b,!0);g.placeholder=!0,b.add(function(a){g.callback=function(){return a},h(g)})})):i&&b&&(y[g.id]=!1,r.paused.push(g),k(g)),g}function n(a,b,d,e){var a=c(a,e),f=a.name,j=a.fullName,l=m(a),n=l.id,o=l.deps,p;if(j){if(j in x||y[n]===!0||j==="jquery"&&t.jQuery&&t.jQuery!==d().fn.jquery)return;v[n]=!0,y[n]=!0,j==="jquery"&&d&&S(d())}l.depArray=b,l.callback=d;for(d=0;d<b.length;d++)if(n=b[d])n=c(n,f?a:e),p=n.fullName,b[d]=p,p==="require"?o[d]=g(a):p==="exports"?(o[d]=x[j]={},l.usingExports=!0):p==="module"?l.cjsModule=o[d]={id:f,uri:f?r.nameToUrl(f,null,e):void 0,exports:x[j]}:!(p in x)||p in z||j in F&&!(j in F&&I[p])?(j in F&&(F[p]=!0,delete x[p],B[n.url]=!1),l.depCount+=1,l.depCallbacks[d]=i(l,d),m(n,!0).add(l.depCallbacks[d])):o[d]=x[p];l.depCount?k(l):h(l)}function o(a){n.apply(null,a)}function p(a,b){if(!a.isDone){var d=a.map.fullName,e=a.depArray,f,g,h,i;if(d){if(b[d])return x[d];b[d]=!0}if(e)for(f=0;f<e.length;f++)if(g=e[f])if((h=c(g).prefix)&&(i=z[h])&&p(i,b),(h=z[g])&&!h.isDone&&y[g])g=p(h,b),a.depCallbacks[f](g);return d?x[d]:void 0}}function q(){var a=t.waitSeconds*1e3,b=a&&r.startTime+a<(new Date).getTime(),a="",c=!1,f=!1,g;if(r.pausedCount<=0){if(t.priorityWait)if(e())s();else return;for(g in y)if(!(g in K)&&(c=!0,!y[g]))if(b)a+=g+" ";else{f=!0;break}if(c||r.waitCount){if(b&&a)return g=N("timeout","Load timeout for modules: "+a),g.requireType="timeout",g.requireModules=a,d.onError(g);if(f||r.scriptCount)(G||ba)&&!W&&(W=setTimeout(function(){W=0,q()},50));else{if(r.waitCount){for(H=0;a=A[H];H++)p(a,{});r.paused.length&&s(),X<5&&(X+=1,q())}X=0,d.checkReadyState()}}}}var r,s,t={waitSeconds:7,baseUrl:"./",paths:{},pkgs:{},catchError:{}},u=[],v={require:!0,exports:!0,module:!0},w={},x={},y={},z={},A=[],B={},C=0,D={},E={},F={},I={},L=0;return S=function(a){!r.jQuery&&(a=a||(typeof jQuery!="undefined"?jQuery:null))&&(!t.jQuery||a.fn.jquery===t.jQuery)&&("holdReady"in a||"readyWait"in a)&&(r.jQuery=a,o(["jquery",[],function(){return jQuery}]),r.scriptCount)&&(V(a,!0),r.jQueryIncremented=!0)},s=function(){var a,b,c,f,g,h;L+=1,r.scriptCount<=0&&(r.scriptCount=0);for(;u.length;){if(a=u.shift(),a[0]===null)return d.onError(N("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));o(a)}if(!t.priorityWait||e())for(;r.paused.length;){g=r.paused,r.pausedCount+=g.length,r.paused=[];for(f=0;a=g[f];f++)b=a.map,c=b.url,h=b.fullName,b.prefix?j(b.prefix,a):!B[c]&&!y[h]&&(d.load(r,h,c),B[c]=!0);r.startTime=(new Date).getTime(),r.pausedCount-=g.length}L===1&&q(),L-=1},r={contextName:a,config:t,defQueue:u,waiting:z,waitCount:0,specified:v,loaded:y,urlMap:w,urlFetched:B,scriptCount:0,defined:x,paused:[],pausedCount:0,plugins:E,needFullExec:F,fake:{},fullExec:I,managerCallbacks:D,makeModuleMap:c,normalize:b,configure:function(a){var b,c,d;a.baseUrl&&a.baseUrl.charAt(a.baseUrl.length-1)!=="/"&&(a.baseUrl+="/"),b=t.paths,d=t.pkgs,Z(t,a,!0);if(a.paths){for(c in a.paths)c in K||(b[c]=a.paths[c]);t.paths=b}if((b=a.packagePaths)||a.packages){if(b)for(c in b)c in K||$(d,b[c],c);a.packages&&$(d,a.packages),t.pkgs=d}a.priority&&(c=r.requireWait,r.requireWait=!1,r.takeGlobalQueue(),s(),r.require(a.priority),s(),r.requireWait=c,t.priorityWait=a.priority),(a.deps||a.callback)&&r.require(a.deps||[],a.callback)},requireDefined:function(a,b){return c(a,b).fullName in x},requireSpecified:function(a,b){return c(a,b).fullName in v},require:function(b,e,f){if(typeof b=="string")return J(e)?d.onError(N("requireargs","Invalid require call")):d.get?d.get(r,b,e):(e=c(b,e),b=e.fullName,b in x?x[b]:d.onError(N("notloaded","Module name '"+e.fullName+"' has not been loaded yet for context: "+a)));(b&&b.length||e)&&n(null,b,e,f);if(!r.requireWait)for(;!r.scriptCount&&r.paused.length;)r.takeGlobalQueue(),s();return r.require},takeGlobalQueue:function(){U.length&&(ha.apply(r.defQueue,[r.defQueue.length-1,0].concat(U)),U=[])},completeLoad:function(a){var b;for(r.takeGlobalQueue();u.length;){if(b=u.shift(),b[0]===null){b[0]=a;break}if(b[0]===a)break;o(b),b=null}b?o(b):o([a,[],a==="jquery"&&typeof jQuery!="undefined"?function(){return jQuery}:null]),S(),d.isAsync&&(r.scriptCount-=1),s(),d.isAsync||(r.scriptCount-=1)},toUrl:function(a,b){var c=a.lastIndexOf("."),d=null;return c!==-1&&(d=a.substring(c,a.length),a=a.substring(0,c)),r.nameToUrl(a,d,b)},nameToUrl:function(a,c,e){var f,g,h,i,j=r.config,a=b(a,e&&e.fullName);if(d.jsExtRegExp.test(a))c=a+(c?c:"");else{f=j.paths,g=j.pkgs,e=a.split("/");for(i=e.length;i>0;i--){if(h=e.slice(0,i).join("/"),f[h]){e.splice(0,i,f[h]);break}if(h=g[h]){a=a===h.name?h.location+"/"+h.main:h.location,e.splice(0,i,a);break}}c=e.join("/")+(c||".js"),c=(c.charAt(0)==="/"||c.match(/^\w+:/)?"":j.baseUrl)+c}return j.urlArgs?c+((c.indexOf("?")===-1?"?":"&")+j.urlArgs):c}},r.jQueryCheck=S,r.resume=s,r}function ia(){var a,b,c;if(m&&m.readyState==="interactive")return m;a=document.getElementsByTagName("script");for(b=a.length-1;b>-1&&(c=a[b]);b--)if(c.readyState==="interactive")return m=c;return null}var ja=/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,ka=/require\(\s*["']([^'"\s]+)["']\s*\)/g,da=/^\.\//,aa=/\.js$/,M=Object.prototype.toString,r=Array.prototype,ga=r.slice,ha=r.splice,G=typeof window!="undefined"&&!!navigator&&!!document,ba=!G&&typeof importScripts!="undefined",la=G&&navigator.platform==="PLAYSTATION 3"?/^complete$/:/^(complete|loaded)$/,ca=typeof opera!="undefined"&&opera.toString()==="[object Opera]",K={},u={},U=[],m=null,X=0,O=!1,d,r={},I,w,y,z,v,A,B,H,C,S,W;if(typeof define=="undefined"){if(typeof requirejs!="undefined"){if(J(requirejs))return;r=requirejs,requirejs=void 0}typeof require!="undefined"&&!J(require)&&(r=require,require=void 0),d=requirejs=function(a,b,c){var d="_",e;return!E(a)&&typeof a!="string"&&(e=a,E(b)?(a=b,b=c):a=[]),e&&e.context&&(d=e.context),c=u[d]||(u[d]=ea(d)),e&&c.configure(e),c.require(a,b)},d.config=function(a){return d(a)},require||(require=d),d.toUrl=function(a){return u._.toUrl(a)},d.version="1.0.0",d.jsExtRegExp=/^\/|:|\?|\.js$/,w=d.s={contexts:u,skipAsync:{}};if(d.isAsync=d.isBrowser=G)if(y=w.head=document.getElementsByTagName("head")[0],z=document.getElementsByTagName("base")[0])y=w.head=z.parentNode;d.onError=function(a){throw a},d.load=function(a,b,c){d.resourcesReady(!1),a.scriptCount+=1,d.attach(c,a,b),a.jQuery&&!a.jQueryIncremented&&(V(a.jQuery,!0),a.jQueryIncremented=!0)},define=function(a,b,c){var d,e;typeof a!="string"&&(c=b,b=a,a=null),E(b)||(c=b,b=[]),!b.length&&J(c)&&c.length&&(c.toString().replace(ja,"").replace(ka,function(a,c){b.push(c)}),b=(c.length===1?["require"]:["require","exports","module"]).concat(b)),O&&(d=I||ia())&&(a||(a=d.getAttribute("data-requiremodule")),e=u[d.getAttribute("data-requirecontext")]),(e?e.defQueue:U).push([a,b,c])},define.amd={multiversion:!0,plugins:!0,jQuery:!0},d.exec=function(b){return eval(b)},d.execCb=function(a,b,c,d){return b.apply(d,c)},d.addScriptToDom=function(a){I=a,z?y.insertBefore(a,z):y.appendChild(a),I=null},d.onScriptLoad=function(a){var b=a.currentTarget||a.srcElement,c;if(a.type==="load"||b&&la.test(b.readyState))m=null,a=b.getAttribute("data-requirecontext"),c=b.getAttribute("data-requiremodule"),u[a].completeLoad(c),b.detachEvent&&!ca?b.detachEvent("onreadystatechange",d.onScriptLoad):b.removeEventListener("load",d.onScriptLoad,!1)},d.attach=function(a,b,c,e,f,g){var h;return G?(e=e||d.onScriptLoad,h=b&&b.config&&b.config.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script"),h.type=f||"text/javascript",h.charset="utf-8",h.async=!w.skipAsync[a],b&&h.setAttribute("data-requirecontext",b.contextName),h.setAttribute("data-requiremodule",c),h.attachEvent&&!ca?(O=!0,g?h.onreadystatechange=function(){h.readyState==="loaded"&&(h.onreadystatechange=null,h.attachEvent("onreadystatechange",e),g(h))}:h.attachEvent("onreadystatechange",e)):h.addEventListener("load",e,!1),h.src=a,g||d.addScriptToDom(h),h):(ba&&(importScripts(a),b.completeLoad(c)),null)};if(G){v=document.getElementsByTagName("script");for(H=v.length-1;H>-1&&(A=v[H]);H--){y||(y=A.parentNode);if(B=A.getAttribute("data-main")){r.baseUrl||(v=B.split("/"),A=v.pop(),v=v.length?v.join("/")+"/":"./",r.baseUrl=v,B=A.replace(aa,"")),r.deps=r.deps?r.deps.concat(B):[B];break}}}d.checkReadyState=function(){var a=w.contexts,b;for(b in a)if(!(b in K)&&a[b].waitCount)return;d.resourcesReady(!0)},d.resourcesReady=function(a){var b,c;d.resourcesDone=a;if(d.resourcesDone)for(c in a=w.contexts,a)!(c in K)&&(b=a[c],b.jQueryIncremented)&&(V(b.jQuery,!1),b.jQueryIncremented=!1)},d.pageLoaded=function(){document.readyState!=="complete"&&(document.readyState="complete")},G&&document.addEventListener&&!document.readyState&&(document.readyState="loading",window.addEventListener("load",d.pageLoaded,!1)),d(r),d.isAsync&&typeof setTimeout!="undefined"&&(C=w.contexts[r.context||"_"],C.requireWait=!0,setTimeout(function(){C.requireWait=!1,C.takeGlobalQueue(),C.jQueryCheck(),C.scriptCount||C.resume(),d.checkReadyState()},0))}})(),define("requireLib",function(){}),define("domReady",[],function(){function a(a){for(var b=0,c;c=a[b];b++)c(g)}function b(){var b=h,c=i;f&&(b.length&&(h=[],a(b)),j.resourcesDone&&c.length&&(i=[],a(c)))}function c(){f||(f=!0,l&&clearInterval(l),b())}function d(a){return f?a(g):h.push(a),d}var e=typeof window!="undefined"&&window.document,f=!e,g=e?document:null,h=[],i=[],j=requirejs||require||{},k=j.resourcesReady,l;return"resourcesReady"in j&&(j.resourcesReady=function(a){k&&k(a),a&&b()}),e&&(document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):window.attachEvent&&(window.attachEvent("onload",c),self===self.top&&(l=setInterval(function(){try{document.body&&(document.documentElement.doScroll("left"),c())}catch(a){}},30))),document.readyState==="complete"&&c()),d.withResources=function(a){return f&&j.resourcesDone?a(g):i.push(a),d},d.version="1.0.0",d.load=function(a,b,c,e){e.isBuild?c(null):d(c)},d}),require(["domReady"],function(a){}),define("setup-domready",function(){});
    // ====== END REQUIRE =====
    
  // set initial require settings, to find base path and give slower IE some time
  require.config({ 
   baseUrl: base_url,
      waitSeconds: 15
  });

  // setup require.ready and then launch the bootstrap
    require(["domReady"], function(domReady) {
      require.ready = domReady;
      bootstrap(context);
    });

  // expose the require library to the Global Scope
  var expose = function(varname, val) {
   window[varname] = window[varname] || val;
  };
  expose("require", require); 
  expose("define", define);
  expose("requirejs", requirejs); 
 };
 /**
  * The Bootstrap, by Michael Wheeler
  * Loads up sections of code based on:
  *  - The active pages in setup
  *  - Which page is currently being viewed in BigMachines
  **/
 bootstrap = function(context) {
  var me = {}, repeat_until = context.repeat_until, ps = context.pubsub, log = {}, debug = window["framework/debug"] || false;

  if(!setup) {return;}

  me.window_url = document.location.href;

  /**
   * This function allows us to add details to the setup
   **/
  setup.extend = function(name, add) {
   var i, root;
   root = setup.pages[name];
   //don't spend time on inactive pages
   if(!root || !root.active) {return;}
   for(i in add) {
    if(!add.hasOwnProperty(i)) {continue;}
    root[i] = add[i];
   }
  };
  /**
   * The pages object is used to identify which page is being viewed
   **/
  setup.extend("sitewide", {
   always: true
  });
  setup.extend("commerce", {
   url_regex: ["/commerce/"],
   match: function() {
    var doc_form_exists;
    if(typeof jQuery !==  "function") {return false;}

    doc_form_exists = jQuery("form[name='bmDocForm']").length > 0;
    if(doc_form_exists) {
     return me.get_doc_number() === 1;
    }
    
    return false;
   }
  });
  setup.extend("commerce_line", {
   url_regex: ["/commerce/buyside/document.jsp"],
   match: function() {
    var doc_form_exists;
    if(typeof jQuery !==  "function") {return false;}

    doc_form_exists = jQuery("form[name='bmDocForm']").length > 0;
    if(doc_form_exists) {
     return me.get_doc_number() > 1;
    }
   
    return false;
   }
  });
  setup.extend("config", {
   //url_regex:["/model_configs.jsp"],
   url_regex:[""],//changed this to blank to support the Config embedded in CRM.
   match: function() {
        // when adding lines, the model_configs url shows in commerce
    var conf_form_exists = jQuery("form[name='configurationForm']").length > 0;
    if(conf_form_exists) {
     return true;
    }
    return false;
   }
  });
  setup.extend("homepage", {
   url_regex: ["commerce/display_company_profile.jsp", "/commerce/buyside/document.jsp"],
   match: function() {
    //requires a custom variable in the alt-homepage js
    if(window["framework/homepage"]) {return true;}
    if(typeof jQuery !==  "function") {return false;}

    if(me.window_url.search("commerce/display_company_profile.jsp") > -1) {
     return true;
    }
    
    //last and slowest check
    return jQuery("form[name='homePageForm']").length > 0;
   }
  });

 
  me.run= function(name) {
   var files = [name], page = setup.pages[name];
   if(page.preload) {
    files = files.concat(page.preload);
   }
   require(files);
  };
  me.get_doc_number = function() {
   var number = jQuery("input[name='_document_number']").val();
   number = parseInt(number);

   //only perform the DOM crawl once per page
   if(number) {
    me.get_doc_number = function() { return number; };
   }

   return number;
  };

  me.test_regex = function(page) {
   var i, ii, regex = page.url_regex || [];
   if(regex.length === 0) {return true;}

   for(i = 0, ii = regex.length; i<ii; i++) {
    if(me.window_url.search(regex[i]) > -1) {
     return true;
    }
   }

   return false;
  };

  me.test_match = function(page) {
   var test = page.match || function() {return true;};

   return test();
  };

  me.search_for = function(name, page) {
   //don't check for sitewide code
   if(page.always === true) {
    me.run(name);
    return;
   }

   // filter on URL before starting
   if(me.test_regex(page) !== true) {return;}

   //add to queue of searches to be performed
   ps.sub("searches", function() {
    if(me.test_match(page)) {
     ps.pub("found-match", [name]);
    };
   });
  };

  me.show_log = function() {    
   var key, res="", div;
   for(key in log) {
    if(!log.hasOwnProperty(key)) {continue;}
    res += key + ": " + log[key]+"; ";
   }
     
   div = document.createElement("div");
   div.style.position = "absolute"; div.style.top = "100"; div.style.left = "10";div.style.color="red";
   div.innerHTML = "bm-framework.js log results:("+res+")";
   document.body.appendChild(div);
  };

  /**
   * The magic starts here.
   */
  me.begin = function() {
   var i, curr_page, 
    delay = setup.delay || 50, 
    timeout = setup.timeout || 5000,
    testees=setup.pages || [];

   ps.sub("found-match", function(name) {
    ps.clear("searches");
    me.run(name);
    if(debug) { log["page"] = name; }
   });

   ps.sub("search-timeout", function() {
    ps.clear("searches");
   });

   for(i in testees) {
    if(!testees.hasOwnProperty(i)) {continue;}
    if(testees[i].active !== true) {continue;}
    curr_page = setup.pages[i];
    if(!curr_page) {
     throw new Error("Problem initiating BigMachines JavaScript framework. File "+ i + " has not been configured.");
    }

    me.search_for(i, curr_page);
   }

   //this function will fire over and over until the searches are cleared
   repeat_until(function() {
    var search_topic = ps.functions["searches"];

    if(search_topic && search_topic.length > 0) {
     ps.pub("searches");
     return false;
    }
    return true;
   }, delay).timeout(function() {
    ps.pub("search-timeout");
   }, timeout);
  };

  me.begin();
  require.ready(function() {
   if(debug) { me.show_log(); }
  });
 };
 
 // only load if there is an active page
  // wait for _BM_HOST_COMPANY - necessary in config
 (function() {
  var i, maxtime=5000, go;

  go = function() {
   context.repeat_until(function() {
    return typeof _BM_HOST_COMPANY === "string";
   }).and_then(function() {
    initiate_require(context, bootstrap);
   }).timeout(function() {
    throw new Error("BigMachines Critical Framework Error: Timed out looking for _BM_HOST_COMPANY. Try putting the reference to bm-framework.js in the footer. If that still doesn't help you may need to manually set _BM_HOST_COMPANY in the header.");
   }, maxtime);
  };

  for(i in setup.pages) {
   if(!setup.pages.hasOwnProperty(i)) {continue;}
   if(setup.pages[i].active === true){go();break;}
  }
 }());

 context.setup = setup;
 context.initiate_require = initiate_require;
 context.bootstrap = bootstrap;
}(window["framework/testing-hook"] || {}));
```

TODO v1 and Beyond

- [ ] gather up bm libs
- [ ] polish shortcut keys
  - (which ones make sense?)
  - if we can only have for is there away to open the popup + (un)load buttons
  - [ ] link to unload + load buttons
- [ ] gulp
- [ ] maybe add recommend setup and usage
- [ ] remove hot-reload from release version
- [ ] logs access/generation from bm-framework?
- [ ] first options to add?
- [ ] is it useful to display _BM_USER_ vars information in app, maybe login, email, company, host company, bm user full access?
- [ ] effort to port over to other browsers
  - [ ] edge, firefox, safari, + others
  - [ ] What do most bigmachine admins use? Chrome + Edge?
- [ ] testing? Will cost a lot up front but may improve dev speed/quality later
- [ ] think about bringing in react + tailwind
- [ ] MAybe can log this? : BigMachines Critical Framework Error: Timed out looking for _BM_HOST_COMPANY. Try putting the reference to bm-framework.js in the footer. If that still doesn't help you may need to manually set_BM_HOST_COMPANY in the header."
- [ ] found match?
- [ ] "Problem initiating BigMachines JavaScript framework. File "+ i + " has not been configured.
- [ ] bm framework search?
- [ ]   me.show_log
- [ ]   <https://stackoverflow.com/questions/7287061/log-in-to-my-web-from-a-chrome-extension>
- [ ]

``` js
var _BM_USER_LANGUAGE='en';
var _BM_USER_CURRENCY='USD';
var _BM_USER_CURRENCY_SYMBOL='$';
var _BM_USER_CURRENCY_FORMAT='0';
var _BM_USER_LOGIN='CWilliams';
var _BM_USER_EMAIL='cwilliams@streamlinecpq.com';
var _BM_USER_COMPANY='DevMcNichols';
var _BM_USER_NUMBER_FORMAT='0';
var _BM_CSRF_TOKEN='jkJm-_SD5nEWBsGBm0X5DwvQOlp0lBArQy-vPudC-ESjrSFgnqNilNGSFIw';
var _BM_HOST_COMPANY='devmcnichols';
var _BM_STORED_PRECISION='4';var userDateInfo = { dateFormat : 'MM/dd/yyyy', userTimeZoneId : 'America/Los_Angeles', defaultTimeZoneId : 'America/New_York', dateTimeFormat : 'MM/dd/yyyy HH:mm', jQueryDateFormat : 'mm/dd/yy', defaultTimeZone : 300, userTimeZone : 480 };var _BM_IS_IN_GLOBAL_DEBUG_MODE=false;var _BM_USE_ALTA_HEADER=false;var _BM_APPLY_IOS_SCROLL_FIX=true;var _BM_USER_FULL_ACCESS=true;</script>
```

```js
<head>
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Welcome to DevMcNichols</title>
<script>
if (navigator.appName=="Netscape"){
 window.captureEvents(Event.KEYPRESS);
}

function SearchSNOnReturnKey(e) {
 return bmSubmitOnUpdate(e, '/commerce/parts/serial_number_search_results.jsp', document.bmform_serial_number, bmSNValidateForm);
}

function SearchPNOnReturnKey(e) {
 if (typeof document.forms['bmform_parts_attr_search'] != 'undefined'){
  return bmSubmitOnUpdate(e, '/commerce/parts/part_search_results.jsp', document.bmform_parts_attr_search, bmPNValidateForm);
 }
 return bmSubmitOnUpdate(e, '/commerce/parts/part_search_results.jsp', document.bm_parts_attribute_search_form, bmPNValidateForm);
}

function SearchKeywordOnReturnKey(e) {
 return bmSubmitOnUpdate(e, '/commerce/parts/part_search_results.jsp', document.bmform_parts_search_keyword, bmKeywordValidateForm);
}
/**
 * Validation for Serial Number group.
 **/
function bmSNValidateForm(form) {
 setPriceBook(form);

 validateSnCustomAttribute(form);

 // perform number/integer validation
 validateSnAttrNumber(form);
 
 if (form.serial_number != undefined) { 
  if( form.serial_number.value != "" ) {
   return true;
  }
 }
 // perform checking to make sure at least 1 form field is filled
 if (validateSnAttrCheck(form)) {
  return true;
 }
 bmErrorString += "Please fill in at least one search attribute.\n";
 return false;
}

/**
 * Validation for Part Search by Keyword group.
 **/
function bmKeywordValidateForm(form) {
 setPriceBook(form);

 if( form.companies.selectedIndex == -1 ) {
  bmErrorString += "You must select at least one company to search on.\n";
 }
 if (form.q != undefined) {
  if(form.q.value == "" ) {
   bmErrorString += "The keyword input field cannot be blank.\n";
  }
 }
}

/**
 * Validation for Part Number group.
 **/
function bmPNValidateForm(form) {
 setPriceBook(form);
 
  if (form.query != undefined) { 
  if( form.query.value != "" ) {
      selectEmptyMs(form);    
   return true;
  }
 }
 
 // perform checking to make sure at least 1 form field is filled
 if (validatePnAttrCheck(form)) {
  return true;
 }
 
 bmErrorString += "Please fill in at least one search attribute.\n";
 selectEmptyMs(form);
}

/*
 *   This method will select the first blank option of Part multiselect attribute if none is selected (value is "").
 *   Assumption: only 2 part multiselect attributes available: field16 and field17
 */
function selectEmptyMs(aForm) {
 var partSearchForm = aForm;
 if (partSearchForm == null) {
  return ;
 }
 
 if (partSearchForm.elements != null && partSearchForm.elements.length > 0) {
  for (var i=0; i < partSearchForm.elements.length; i++) { 
   if (partSearchForm.elements[i].name == 'field16' || partSearchForm.elements[i].name == 'field17') { 
    var multiSelect =  partSearchForm.elements[i]; 
    if (multiSelect.value == "") { 
     multiSelect.options[0].selected = true;
    } 
   }
  }
 } 
} 

/**
 *   This method return a true if ONLY the first blank option of Part multiselect attribute is selected.
 *   A selection of first black option and other valid option will let the method to return false.
 *   A selection of other valid option will let the method to return false.
 *   Assumption: only 2 part multiselect attributes available: field16 and field17
 */
function isFirstEmptyMsOptionSelected(fieldName, form) {
 var partSearchForm = form;
 if (partSearchForm == null) {
  return false;
 }
 var result = false;
 if (partSearchForm.elements != null && partSearchForm.elements.length > 0) {
  for (var i=0; i < partSearchForm.elements.length; i++) { 
   if (partSearchForm.elements[i].name == fieldName) { 
    var multiSelect =  partSearchForm.elements[i]; 
    if (multiSelect.value == "") { 
     if (multiSelect.options[0].selected == true) {
      result = true;
     }  
     for(var x=1; x < multiSelect.options.length; x++) {
      if (multiSelect.options[x].selected == true) {
       result = false;
       break;
      }
     }
    } 
   }
  }
 } 
 return result;
} 
</script>
<link rel="stylesheet" type="text/css" href="/style/commerce/buyside/jquery.autocomplete.css">
<link rel="STYLESHEET" href="/bmfsweb/devmcnichols/global/devmcnichols.css" type="text/css">
<link rel="STYLESHEET" href="/bmfsweb/devmcnichols/global/devmcnicholsAlt.css" type="text/css">
<link rel="STYLESHEET" href="/bmfsweb/devmcnichols/navmenu/style/nav_menu.css" type="text/css">
<link rel="STYLESHEET" href="/bmfsweb/devmcnichols/navmenu/style/_alt_nav_menu.css" type="text/css">
<link rel="SHORTCUT ICON" href="/img/favicon.ico" type="image/x-icon">
<link rel="STYLESHEET" href="/bmfsweb/devmcnichols/homepage/style/devmcnichols_Hp_Alt.css" type="text/css">


<script type="text/javascript" src="/js/lib/prototype.js"></script>
<script type="text/javascript">if (typeof(window.Bm) == 'undefined') window.Bm = {};
if (typeof(Bm.Common) == 'undefined') Bm.Common = {};
Bm.I18n={"Popup":{"Ok":"OK","Alert":"Alert","Cancel":"Cancel"},"SessionTimeout":{"continueButton":"Continue Working","expireMessage":"Your session is about to expire.","timeLeft":"%1 seconds left."}}</script>
<script type="text/javascript" src="/bmfsweb/jsmessage/message_en.js"></script>
<script type="text/javascript">
var _BM_USER_LANGUAGE='en';
var _BM_USER_CURRENCY='USD';
var _BM_USER_CURRENCY_SYMBOL='$';
var _BM_USER_CURRENCY_FORMAT='0';
var _BM_USER_LOGIN='CWilliams';
var _BM_USER_EMAIL='cwilliams@streamlinecpq.com';
var _BM_USER_COMPANY='DevMcNichols';
var _BM_USER_NUMBER_FORMAT='0';
var _BM_CSRF_TOKEN='jwRSwuYNMsvaSFvI4Q-i4zbdILT3tlszS54HPC7lzN8mE6WXtVdsqfhr0YQ';
var _BM_HOST_COMPANY='devmcnichols';
var _BM_STORED_PRECISION='4';var userDateInfo = { dateFormat : 'MM/dd/yyyy', userTimeZoneId : 'America/Los_Angeles', defaultTimeZoneId : 'America/New_York', dateTimeFormat : 'MM/dd/yyyy HH:mm', jQueryDateFormat : 'mm/dd/yy', defaultTimeZone : 300, userTimeZone : 480 };var _BM_IS_IN_GLOBAL_DEBUG_MODE=false;var _BM_USE_ALTA_HEADER=false;var _BM_APPLY_IOS_SCROLL_FIX=true;var _BM_USER_FULL_ACCESS=true;</script>
<script type="text/javascript" src="/js/lib/jquery-1.6.2.cache.js"></script>
<script type="text/javascript" src="/theme/js/common/jquery.patches.js"></script>
<script type="text/javascript" src="/js/BmJavascript-21.1.8-FINAL.cache.js"></script><style>#session-timeout-popup{position:fixed;top:0;left:0;width:100%;z-index:9999;background-color:#FF0;border:1px solid #AA0;_position:absolute;_top:expression(eval(document.body.scrollTop));}</style>
<script type="text/javascript">var _loadingImage = "/img/spinner_progress.gif";closeLoadingDialog();</script>

<script type="text/javascript" src="/js/lib/jquery.autocomplete.min.js"></script>
<script type="text/javascript" src="/js/homepage/Hashtable_DDL.js"></script>
<script type="text/javascript" src="/js/ScrollingPageTabs.js"></script>
<script type="text/javascript" src="/dwr/bs/engine.js"></script>
<script type="text/javascript" src="/dwr/bs/util.js"></script>
<script type="text/javascript" src="/dwr/bs/interface/RespTime.js"></script>

<!-- Include the declaration for _BM_USER_GROUPS JS variable. -->
<script type="text/javascript">
var userGroupsArray = new Array('operationsSoutheast', 'cps', 'managementSoutheast', 'sales4', 'admin');
var _BM_USER_GROUPS = userGroupsArray;
</script>

<script type="text/javascript" src="/js/common/Overload.js"></script>
<script type="text/javascript">Bm.Overload.isOverload = false;Bm.Overload.message = 'The&#32;environment&#32;is&#32;currently&#32;experiencing&#32;extremely&#32;high&#32;loads,&#32;otherwise&#32;known&#32;as&#32;&#34;Overcrowded&#32;Mode&#34;. The&#32;CPQ&#32;site&#32;will&#32;temporarily&#32;prevent&#32;users,&#32;integrations,&#32;and&#32;BML&#32;URL&#32;functions&#32;from&#32;creating&#32;new&#32;sessions. During&#32;this&#32;restriction&#32;period,&#32;the&#32;timeout&#32;of&#32;idle&#32;sessions&#32;is&#32;reduced&#32;to&#32;ensure&#32;active&#32;users&#32;can&#32;complete&#32;their&#32;Transactions. Administrators&#32;should&#32;delay&#32;scheduled&#32;events&#32;such&#32;as&#32;deployments,&#32;migrations&#32;or&#32;bulk&#32;operations&#32;to&#32;improve&#32;system&#32;performance.';</script>

 <script type="text/javascript" src="/bmfsweb/devmcnichols/homepage/js/definition/11_1601726793890.js"></script>
<script type="text/javascript" src="/bmfsweb/devmcnichols/homepage/js/definition/11_4764341_1601726793890.js"></script>
<script type="text/javascript" src="/bmfsweb/devmcnichols/homepage/js/definition/11_4764319_1601726793890.js"></script>

 <script type="text/javascript" src="/bmfsweb/devmcnichols/homepage/js/devmcnichols_Hp_Alt.js"></script>


<script type="text/javascript">
<!--
function submitenter(myfield,e){
	var keycode;
	if (window.event){
		keycode = window.event.keyCode;
	} else if (e){
		keycode = e.which;
	} else {
		return true;
	}
	if (keycode == 13){
		// we have to call this because otherwise validation gets skipped on enter...
		bmSubmitForm('/commerce/display_company_profile.jsp', document.loginform , validate_form_login);
	   return false;
	}else {
	   return true;
	}
}
function validate_form_login(frm){
  //add the # history data from url to the redirect url
  var url = 'redirectUrl';
  if(document.loginform[url] && document.loginform[url].value.length > 0) {
	  if(document.loginform['hash_param'] && document.loginform['hash_param'].value.length > 0) {
	      document.loginform[url].value += (isIE ? "&"  : "") + "#" + document.loginform['hash_param'].value;
	  }
  }
  bmCheckString(frm.username, "Username@Company");
  bmCheckString(frm.psword, "Password");
}
//opens popup window with password secrete questions
function openPasswordHelper() {
   var login = document.loginform.username.value;
   url = "/forgot_password.jsp?login="+login;
   bmCreatePopup(url, "password_helper", false, false, 550, 400);
}

//-->
</script>
<style>
    .login-button a:hover, .login-button a:focus{
        text-decoration: underline;
    }
</style>

```html
<script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="homepage" src="/bmfsweb/devmcnichols/image/javascript/homepage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="return_to_quote_button" src="/bmfsweb/devmcnichols/image/javascript/return_to_quote_button.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="qs_homepage" src="/bmfsweb/devmcnichols/image/javascript/qs_homepage.js"></script><script type="text/javascript" charset="utf-8" async="" data-requirecontext="_" data-requiremodule="jquery_cookie" src="/bmfsweb/devmcnichols/image/javascript/jquery_cookie.js"></script>


```

- [ ] extension clipboard + snippets?

``` js
function copyToClipboard(pipelineLink) {
    const input = document.createElement("input");
    input.style.position = "fixed";
    input.style.opacity = 0;
    input.value = pipelineLink;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    document.body.removeChild(input);
};
```

notifications? prob meh

Triggering a Notification

Again, very straightforward thanks to the chrome.notifications API:

```js
function createNotification(pipelineName, pipelineLocation) {
    var opt = {
        type: "basic",
        title: "Pipeline Link Copied",
        message: pipelineName,
        contextMessage: pipelineLocation,
        iconUrl: "img/icon-80.png"
    };
    chrome.notifications.create(null, opt, function (notificationId) {
        timer = setTimeout(function () {
            chrome.notifications.clear(notificationId);
        }, 3000);
    });
}
```

bm browser action?

"clipboardRead" Required if the extension uses document.execCommand('paste'). Read data you copy and paste
"clipboardWrite" Indicates the extension uses document.execCommand('copy') or document.execCommand('cut'). Modify data you copy and paste

enabled
boolean
show
show(downloadId: number): void
Show the downloaded file in its folder in a file manager.

PARAMETERS
downloadId
number
The identifier for the downloaded file.

showDefaultFolder
showDefaultFolder(): void
Show the default Downloads folder in a file manager.

setShelfEnabled [x]
setShelfEnabled(enabled: boolean): void
Enable or disable the gray shelf at the bottom of every window associated with the current browser profile. The shelf will be disabled as long as at least one extension has disabled it. Enabling the shelf while at least one other extension has disabled it will return an error through runtime.lastError. Requires the "downloads.shelf" permission in addition to the "downloads" permission.

open
open(downloadId: number): void
Open the downloaded file now if the DownloadItem is complete; otherwise returns an error through runtime.lastError. Requires the "downloads.open" permission in addition to the "downloads" permission. An onChanged event will fire when the item is opened for the first time.

<https://developer.chrome.com/docs/extensions/reference/downloads/>
<https://developer.chrome.com/docs/extensions/reference/debugger/>
onInstalled
onInstalled.addListener(listener: function)
Fired when an app or extension has been installed.

EVENT
listener
function
The listener parameter should be a function that looks like this:

```js
(info: ExtensionInfo) => {...}
infos
ExtensionInfo
get
get(id: string): Promise<object>
get(id: string, callback?: function): void
```

Promise
Returns information about the installed extension, app, or theme that has the given ID.

```js
createAppShortcut
createAppShortcut(id: string): Promise<object>
createAppShortcut(id: string, callback?: function): void
```

Promise
Display options to create shortcuts for an app. On Mac, only packaged app shortcuts can be created.

PARAMETERS
id
string
This should be the id from an app item of management.ExtensionInfo.

ExtensionInstallType
How the extension was installed. One of
admin: The extension was installed because of an administrative policy,
development: The extension was loaded unpacked in developer mode,
normal: The extension was installed normally via a .crx file,
sideload: The extension was installed by other software on the machine,
other: The extension was installed by other means.

ENUM
"admin", "development", "normal", "sideload", or "other"

ExtensionType
The type of this extension, app, or theme.

ENUM
"extension", "hosted_app", "packaged_app", "legacy_packaged_app", "theme", or "login_screen_extension"

<https://developer.chrome.com/docs/extensions/mv3/devguide/>
Events
onButtonClicked
onButtonClicked.addListener(listener: function)
The user pressed a button in the notification.

EVENT
listener
function
The listener parameter should be a function that looks like this:

(notificationId: string, buttonIndex: number) => {...}
notificationId
string
buttonIndex
number
onClicked
onClicked.addListener(listener: function)
The user clicked in a non-button area of the notification.

EVENT
listener
function
The listener parameter should be a function that looks like this:

(notificationId: string) => {...}
notificationId
string
Resolving Git line ending issues in containers (resulting in many modified files)#
Since Windows and Linux use different default line endings, Git may report a large number of modified files that have no differences aside from their line endings. To prevent this from happening, you can disable line ending conversion using a .gitattributes file or globally on the Windows side.

Typically adding or modifying a .gitattributes file in your repository is the most reliable way to solve this problem. Committing this file to source control will help others and allows you to vary behaviors by repository as appropriate. For example, adding the following to .gitattributes file to the root of your repository will force everything to be LF, except for Windows batch files that require CRLF:

- text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
Note that this works in Git v2.10+, so if you are running into problems, be sure you've got a recent Git client installed. You can add other file types in your repository that require CRLF to this same file.

If you would prefer to still always upload Unix-style line endings (LF), you can use the input option.

git config --global core.autocrlf input
If you'd prefer to disable line-ending conversion entirely, run the following instead:

git config --global core.autocrlf false
Finally, you may need to clone the repository again for these settings to take effect
Avoid using Electron modules#
While it can be convenient to rely on built-in Electron or VS Code modules not exposed by the extension API, it's important to note that VS Code Server runs a standard (non-Electron) version of Node.js. These modules will be missing when running remotely. There are a few exceptions, like keytar, where there is specific code in place to make them work.

Use base Node.js modules or modules in your extension VSIX to avoid these problems. If you absolutely have to use an Electron module, be sure to have a fallback if the module is missing.

The example below will use the Electron original-fs node module if found, and fall back to the base Node.js fs module if not.

function requireWithFallback(electronModule: string, nodeModule: string) {
  try {
    return require(electronModule);
  } catch (err) {}
  return require(nodeModule);
}

const fs = requireWithFallback('original-fs', 'fs');
Try to avoid these situations whenever possible.

Known issues#
There are a few extension problems that could be resolved with some added functionality for Workspace Extensions. The following table is a list of known issues under consideration:

Problem Description
Cannot access attached devices from Workspace extension Extensions that access locally attached devices will be unable to connect to them when running remotely. We are investigating the best approach to solve this problem.

Using native Node.js modules#
Native modules bundled with (or dynamically acquired for) a VS Code extension must be recompiled using Electron's electron-rebuild. However, VS Code Server runs a standard (non-Electron) version of Node.js, which can cause binaries to fail when used remotely.

To solve this problem:

Include (or dynamically acquire) both sets of binaries (Electron and standard Node.js) for the "modules" version in Node.js that VS Code ships.
Check to see if vscode.extensions.getExtension('your.extensionId').extensionKind === vscode.ExtensionKind.Workspace to set up the correct binaries based on whether the extension is running remotely or locally.
You may also want to add support for non-x86_64 targets and Alpine Linux at the same time by following similar logic.
You can find the "modules" version VS Code uses by going to Help > Developer Tools and typing process.versions.modules in the console. However, to make sure native modules work seamlessly in different Node.js environments, you may want to compile the native modules against all possible Node.js "modules" versions and platforms you want support (Electron Node.js, official Node.js Windows/Darwin/Linux, all versions). The node-tree-sitter module is a good example of a module that does this well.

Communicating between extensions using commands#
Some extensions return APIs as a part of their activation that are intended for use by other extensions (via vscode.extension.getExtension(extensionName).exports). While these will work if all extensions involved are on the same side (either all UI Extensions or all Workspace Extensions), these will not work between UI and Workspace Extensions.

Fortunately, VS Code automatically routes any executed commands to the correct extension regardless of its location. You can freely invoke any command (including those provided by other extensions) without worrying about impacts.

If you have a set of extensions that need to interact with one another, exposing functionality using a private command can help you avoid unexpected impacts. However, any objects you pass in as parameters will be "stringified" (JSON.stringify) before being transmitted, so the object cannot have cyclic references and will end up as a "plain old JavaScript object" on the other side.

<https://stackoverflow.com/questions/7287061/log-in-to-my-web-from-a-chrome-extension>

<https://www.aspsnippets.com/Articles/Open-Show-jQuery-UI-Dialog-Modal-Popup-on-Button-Click.aspx>

<!-- ANCHOR - Used to indicate a section in your file
TODO - An item that is awaiting completion
FIXME - An item that requires a bugfix
STUB - Used for generated default snippets
NOTE - An important note for a specific code section
REVIEW - An item that requires additional review
SECTION - Used to define a region (See 'Hierarchical anchors')
LINK - Used to link to a file that can be opened within the editor (See 'Link Anchors') -->

### NOTE meeting 5/27

light gray for config modal
translucent background - reference

Loading... Click me!
  C   click to edit

streamine tools colors for config modal

  more opaque

  new jet interface knockout js modal is cleaner
  file dialogue photo

```css
}.ext-el-mask {
    background-color: #ccc;
}
.ext-el-mask-msg {
    border-color:#6593cf;
    background-color:#c3daf9;
    background-image:url(../images/default/box/tb-blue.gif);
}
.ext-el-mask-msg div {
    background-color: white;
    border-color:#a3bad9;
    color:#222;
    font:normal 11px tahoma, arial, helvetica, sans-serif;
}
.x-mask-loading div {
    background-color:#fbfbfb;
    background-image:url(../images/default/grid/loading.gif);
}
```

```html
<div class="x-shadow" style="display: block; z-index: 1013; left: -4px; top: 3px; width: 1272px; height: 1016px;"><div class="xst"><div class="xstl"></div><div class="xstc" style="width: 1260px;"></div><div class="xstr"></div></div><div class="xsc" style="height: 1004px;"><div class="xsml"></div><div class="xsmc" style="width: 1260px;"></div><div class="xsmr"></div></div><div class="xsb"><div class="xsbl"></div><div class="xsbc" style="width: 1260px;"></div><div class="xsbr"></div></div></div>
```

<https://github.com/orbitbot/chrome-extensions-examples/blob/master/pageaction_by_content/background.js>
maybe use for psm dom matching

update
chrome.tabs.update(integer tabId, object updateProperties, function callback)
Modifies the properties of a tab. Properties that are not specified in updateProperties are not modified. Note: This function can be used without requesting the 'tabs' permission in the manifest.

Parameters
tabId ( optional integer )
Defaults to the selected tab of the current window.
updateProperties ( object )
url ( optional string )
A URL to navigate the tab to.
active ( optional boolean )
Whether the tab should be active.
highlighted ( optional boolean )
Adds or removes the tab from the current selection.
pinned ( optional boolean )
Whether the tab should be pinned.
openerTabId ( optional integer )
The ID of the tab that opened this tab. If specified, the opener tab must be in the same window as this tab.
callback ( optional function )
Callback
If you specify the callback parameter, it should specify a function that looks like this:

function(Tab tab) {...};
tab ( optional Tab )
Details about the updated tab, or null if the 'tabs' permission has not been requested.

add changelog + release drafter

```html
<div class='loading-indicator'>
```

<https://devmcnichols.bigmachines.com/admin/commerce/actions/edit_action.jsp?id=6112520&doc_id=4653823>

Auto command click advanced modify before and after "Define Function"

```js
let beforeFormulasButton = document.querySelector("#general > table > tbody > tr:nth-child(20) > td.form-input > table > tbody > tr:nth-child(2) > td:nth-child(2) > table");

if (beforeFormulasButton.getAttribute("onclick").includes("editPreModify")){
  console.log("correctButton")
}

```

editPreModify - Before

```html
<table onclick="javascript:editPreModifyFunction();bmCancelBubble(event)" onmouseover="bmButtonMouseOver(this,'javascript:editPreModifyFunction()')" onmousedown="bmButtonMouseDown(this,'javascript:editPreModifyFunction()')" onmouseup="bmButtonMouseUp(this,'javascript:editPreModifyFunction()')" onmouseout="bmButtonMouseOut(this,'javascript:editPreModifyFunction()')" class="plain-button" cellspacing="0" cellpadding="0" role="button" aria-label="Define Function" style="cursor: pointer;">
 <tbody><tr>
  <td class="button-left"><img class="button-left" src="/img/button10.gif"></td>
  <td class="button-middle" nowrap="true"><div style="margin:0px 0px 1px 0px;"><a class="button-text" name="define_function" id="define_function" href="#">Define Function</a></div></td>  <td class="button-right"><img class="button-right" src="/img/button10.gif"></td>
 </tr>
</tbody></table>
```

editModify - After

```js
let afterForumulasButton = document.querySelector('#general > table > tbody > tr:nth-child(22) > td.form-input > table > tbody > tr:nth-child(2) > td:nth-child(2) > table')

if(afterFormulasButton.getAttribute("onclick").includes("editModify")){
  console.log("correctButton")
}
```

```html
<table onclick="javascript:editModifyFunction();bmCancelBubble(event)" onmouseover="bmButtonMouseOver(this,'javascript:editModifyFunction()')" onmousedown="bmButtonMouseDown(this,'javascript:editModifyFunction()')" onmouseup="bmButtonMouseUp(this,'javascript:editModifyFunction()')" onmouseout="bmButtonMouseOut(this,'javascript:editModifyFunction()')" class="plain-button" cellspacing="0" cellpadding="0" role="button" aria-label="Define Function" style="cursor: pointer;">
 <tbody><tr>
  <td class="button-left"><img class="button-left" src="/img/button10.gif"></td>
  <td class="button-middle" nowrap="true"><div style="margin: 0px 0px 1px;"><a class="button-text" name="define_function" id="define_function" href="#">Define Function</a></div></td>  <td class="button-right"><img class="button-right" src="/img/button10.gif"></td>
 </tr>
</tbody></table>
```

```js
document.getElementAttribute('onclick').value;

element.addEventListener('click', function (e) {
  console.log(e.shiftKey); // shift
  console.log(e.ctrlKey); // ctrl
  console.log(e.altKey); // alt
  console.log(e.metaKey); // command/windows (meta) key
});
// ="javascript:editModifyFunction();bmCancelBubble(event)"
```

```js

//cmd + ctrl
document.addEventListener('click', function (e) {
  if (e.ctrlKey || e.metaKey) {
    console.log('With ctrl or cmd or windows, do something...');
    return;
  }
});

```js
event.initMouseEvent(type, canBubble, cancelable, view, 
                     detail, screenX, screenY, clientX, clientY, 
                     ctrlKey, altKey, shiftKey, metaKey, 
                     button, relatedTarget);


        function simulateClick() {
    // create a new mouse event
    var evt = document.createEvent("MouseEvents");

    // initialize all the parameters of the event
    evt.initMouseEvent("click", true, true, window,
      0, 0, 0, 0, 0,
      false, false, false, false,  // ctrl, alt, shift, meta
      0, null);

    var cb = document.getElementById("checkbox");

    // actually fire the event on the `cb` element
    var canceled = !cb.dispatchEvent(evt);

    // if the event was cancelled...
    if(canceled) {
        //...
    }
}
  ```

```js

(Modified version to make it work without prototype.js)

function simulate(element, eventName)
{
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers)
    {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent)
    {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents')
        {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        }
        else
        {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    }
    else
    {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}

function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}
```

```js
simulate(document.getElementById("btn"), "click");
<!-- Note that as a third parameter you can pass in 'options'. The options you don't specify are taken from the defaultOptions (see bottom of the script). So if you for example want to specify mouse coordinates you can do something like: -->

simulate(document.getElementById("btn"), "click", { pointerX: 123, pointerY: 321 })
```

```js
function simulatedClick(target, options) {

  var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {},
      opts = { // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 1,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

  //Merge the options with the defaults
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      opts[key] = options[key];
    }
  }

  //Pass in the options
  event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
  );

  //Fire the event
  target.dispatchEvent(event);
}

function simulatedClick(target, options) {

  var event = target.ownerDocument.createEvent('MouseEvents'),
      options = options || {},
      opts = { // These are the default values, set up for un-modified left clicks
        type: 'click',
        canBubble: true,
        cancelable: true,
        view: target.ownerDocument.defaultView,
        detail: 1,
        screenX: 0, //The coordinates within the entire page
        screenY: 0,
        clientX: 0, //The coordinates within the viewport
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button: 0, //0 = left, 1 = middle, 2 = right
        relatedTarget: null,
      };

  //Merge the options with the defaults
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      opts[key] = options[key];
    }
  }

  //Pass in the options
  event.initMouseEvent(
      opts.type,
      opts.canBubble,
      opts.cancelable,
      opts.view,
      opts.detail,
      opts.screenX,
      opts.screenY,
      opts.clientX,
      opts.clientY,
      opts.ctrlKey,
      opts.altKey,
      opts.shiftKey,
      opts.metaKey,
      opts.button,
      opts.relatedTarget
  );

  //Fire the event
  target.dispatchEvent(event);
}

Puppetry or Jest for testing
starting w/ puppetry
https://github.com/puppeteer/puppeteer/tree/6522e4f524bdbc1f1b9d040772acf862517ed507/utils/browser

make setShelfEnabled in option.html
add download success to UI
  - what should this look like?


check on CH

work on alt command click - comm advanced
not needed for config
