// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const script = document.createElement('script');
script.setAttribute("type", "module");
script.setAttribute("src", chrome.extension.getURL('jsonpath-0.8.0.js'));
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(script, head.lastChild);

let unloaded = false;

let unloadButton = document.getElementById('unload');

let loadButton = document.getElementById('load');

function saveText(filename, text) {
  var tempElem = document.createElement('a');
  tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  tempElem.setAttribute('download', filename);
  tempElem.click();
}

unloadButton.onclick = function (params) {
  console.log("unload clicked");
  //TODO: BML code selector
  let unloaded = true;
  // let filename = document.getElementById('variableName').value;
  // console.log(jsonRespStr);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "unload" }, function (response) {
      console.log(response.filename);
      console.log(response.code);
      if (response.code && response.filename) {
        saveText(response.filename + ".bml", response.code);
      }
    });
  });

  // jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");

  // let myStrText = "returnarray = String[];\n\n//Loop through document again to set MODEL totals Kyle 4/28/14\nfor eachDocNum in docNumList{\n\n\ttmp = \"\";\n\ttempNum = eachDocNum;\n\ttempQuantity = 0;\n\ttempModelPrice = 0.0;\n\ttempNetPriceEach = 0.0;\n\tburiedFreightModelTot = 0.0;\n\ttempSaleType = \"\";\n\tseqNum = 0;\n\textNet = get(extNetPriceValue, eachDocNum);\n\n\tif(containsKey(itemSaleTypeDict, eachDocNum)){\n\t\tcurrentDocSaleType = get(itemSaleTypeDict, eachDocNum);\n\t\tseqNum = get(lineDocSeqNumDict, eachDocNum);\n\n\t\tif(find(currentDocSaleType, \"Stock Only\") <> -1){\n\t\t\ttempSaleType = \"Stock\";\n\t\t}elif(startswith(currentDocSaleType, \"Processed\")){\n\t\t\ttempSaleType = \"Process\";\n\t\t}elif(startswith(currentDocSaleType, \"Sample\")){\n\t\t\ttempSaleType = \"Sample\";\n\t\t}elif(startswith(currentDocSaleType, \"Internal\") OR startswith(currentDocSaleType, \"Cut\") OR startswith(currentDocSaleType, \"JDE\")){\n\t\t\ttempSaleType = \"Labor\";\n\t\t}elif(startswith(currentDocSaleType, \"Custom Product\")){\n\t\t\ttempSaleType = \"Custom\";\n\t\t}\n\t}\n\t\n\tif(containsKey(parentDocNumDict, eachDocNum)){\n\t\t\ttempNum = get(parentDocNumDict, eachDocNum);\n\t\t\ttempQuantity = get(model_eachQuantity_Dict, eachDocNum);\n\t}\n\n\tif(containsKey(model_Weight_dict,tempNum) AND (tempSaleType <> \"Stock\" AND tempSaleType <> \"Sample\")){\n\t\t//print \"contains key: \" + string(get(model_Weight_dict,tempNum));\n\t\ttmp = tmp + eachDocNum + \"~modelWeight_line~\" + string(get(model_Weight_dict,tempNum)) + \"|\";\n\t}\n\tif(containsKey(model_Width_Dict,tempNum) AND (tempSaleType <> \"Stock\" AND tempSaleType <> \"Sample\")){\n\t\t//print \"contains key: \" + string(get(model_Weight_dict,tempNum));\n\t\ttmp = tmp + eachDocNum + \"~modelWidth_line~\" + string(get(model_Width_Dict,tempNum)) + \"|\";\n\t}\n\tif(containsKey(model_Length_Dict,tempNum) AND (tempSaleType <> \"Stock\" AND tempSaleType <> \"Sample\")){\n\t\t//print \"contains key: \" + string(get(model_Weight_dict,tempNum));\n\t\ttmp = tmp + eachDocNum + \"~modelLength_line~\" + string(get(model_Length_Dict,tempNum)) + \"|\";\n\t}\n\tif(containsKey(model_Quantity_Dict,tempNum)){\n\t\ttmp = tmp + eachDocNum + \"~modelQuantity_Line~\" + string(get (model_Quantity_Dict,tempNum)) + \"|\";\n\t}\n\tif(containsKey(model_Tolerance_Dict,tempNum)){\n\t\ttmp = tmp + eachDocNum + \"~tolerance_line~\" + get(model_Tolerance_Dict,tempNum) + \"|\";\n\t}\n\tif(containsKey(model_EndPlates_Dict,tempNum)){\n\t\ttmp = tmp + eachDocNum + \"~showNoEndPlates_line~\" + get(model_EndPlates_Dict,tempNum) + \"|\";\n\t}\n\t\n\tif(containsKey(model_Price_Dict,tempNum)){\n\t\ttmp = tmp + eachDocNum + \"~modelSubtotal_line~\" + string(get(model_Price_Dict,tempNum)) + \"|\";\n\t\ttempModelPrice = get(model_Price_Dict,tempNum);\n\t}\n\tif(tempQuantity <> 0){\n\t\ttempModelUnitPrice = extNet / tempQuantity;\n\t}\n\telse{\n\t\ttempModelUnitPrice = 0.0;\n\t}\n\t\t\n\ttmp = tmp + eachDocNum + \"~modelUnitPrice_line~\" + string(tempModelUnitPrice) + \"|\";\n\t\t\n\tif(containsKey(lineDocSeqNumDict, eachDocNum)){\n\t\tseqNum = get(lineDocSeqNumDict, eachDocNum);\n\t}\n\tif(containsKey(extNetPriceValue, eachDocNum)){\n\t\textNet = get(extNetPriceValue, eachDocNum);\n\t}\n\n\tif(seqNum == seqNumOfFirstModelMainItem_quote){\n\t\tif(containsKey(model_Price_Dict,tempNum)){\n\t\t\ttempModelPrice = get(model_Price_Dict,tempNum);\n\t\t}\n\t\tif(includeFreightPriceinItem == \"true\"){\n\t\t\tif(tempSaleType == \"Process\" OR tempSaleType == \"Labor\" OR tempSaleType == \"Custom\"){\n\t\t\t\tburiedFreightModelTot = tempModelPrice + freight_quote;\n\t\t\t\tif(tempQuantity <> 0){\n\t\t\t\t\ttempModelUnitPrice = buriedFreightModelTot/tempQuantity;\n\t\t\t\t\t//tempModelUnitPrice = tempModelUnitPrice + (freight_quote/tempQuantity);\n\t\t\t\t}\n\t\t\t}\n\t\t\tif(tempSaleType == \"Stock\" OR tempSaleType == \"Sample\"){\n\t\t\t\tburiedFreightModelTot = extNet + freight_quote;\n\t\t\t\tif(tempQuantity <> 0){\n\t\t\t\t\ttempModelUnitPrice = buriedFreightModelTot/tempQuantity;\n\t\t\t\t}\n\t\t\t}\n\t\t\ttmp = tmp + eachDocNum + \"~modelUnitPrice_line~\" + string(tempModelUnitPrice) + \"|\";\n\t\t}\n\t\telse{\n\t\t\tif(tempSaleType == \"Process\" OR tempSaleType == \"Labor\" OR tempSaleType == \"Custom\"){\n\t\t\t\tburiedFreightModelTot = tempModelPrice;\n\n\t\t\t}\n\t\t\tif(tempSaleType == \"Stock\" or tempSaleType == \"Sample\"){\n\t\t\t\tburiedFreightModelTot = extNet;\n\n\t\t\t}\n\t\t\ttmp = tmp + eachDocNum + \"~modelUnitPrice_line~\" + string(tempModelUnitPrice) + \"|\";\n\t\n\t\t}\n\n\t\ttmp = tmp + \"1~buriedFreightModelTotal_quote~\" + string(buriedFreightModelTot) + \"|\";\n\n\t}\n\tappend(returnarray,tmp);\n}\n\nreturn join(returnarray,\"\");";

  // saveText("pricing.bml", myStrText);

  function saveText(filename, text) {
    var tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
  }

  // chrome.downloads.onDeterminingFilename.addListener(function(item, suggest) {
  //   suggest({filename: item.filename,
  //   conflict_action: 'overwrite',
  //   conflictAction: 'overwrite'});
  // });

  // innerhtml
  //*[@id="selection_field_text"]/strong/text()[1]
  // let code = document.getElementsByClassName('bml');
  // /html/body/div[1]/div[3]/div[2]/div[7]/strong/text()[1]


  // #selection_field > strong
  // let code = document.getElementById('selection_field_text');


  // console.log(code);

  // HTMLCollection
  //TODO: Send to local VSCode
}

loadButton.onclick = function (params) {
  console.log("load clicked");
  //TODO: load BML from local file
  // readTextFile(); 
  // read file

  let file = "file://Users/loganbek/Downloads/prepareViewAllRFQData.bml";
  readFile = readTextFile(file);

  function readTextFile(file)
  {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function ()
      {
          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                  var allText = rawFile.responseText;
                  alert(allText);
              }
          }
      }
      rawFile.send(null);
  }
  //TODO: Insert back in DOM

  let unloaded = false;
}

// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

// changeColor.onclick = function(element) {
//   let color = element.target.value;
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.executeScript(
//         tabs[0].id,
//         {code: 'document.body.style.backgroundColor = "' + color + '";'});
//   });
// };
