// Listen for messages
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     // If the received message has the expected format...
//     if (msg.text === 'report_back') {
//         // Call the specified callback, passing
//         // the web-page's DOM content as argument
//         sendResponse(document.all[0].outerHTML);
//     }
// });

// window.addEventListener("getChromeData", function (evt) {
//     var request = evt.detail;
//     var response = { requestId: request.id };
//     // do Chrome things with request.data, add stuff to response.data
//     window.dispatchEvent(new CustomEvent("sendChromeData", { detail: response }));
// }, false);

var code = "nocode";

//Listen for the event
window.addEventListener("PassToBackground", function (evt) {
    // alert(evt);
    // chrome.runtime.sendMessage(evt.detail);
    code = evt.detail;
    // alert(code);
}, false);


function injectJs(link) {
    var scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr)
    //document.body.appendChild(scr);
}

injectJs(chrome.extension.getURL('injected.js'));

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "unload") {
            // chrome.tabs.executeScript({
            //     file: 'jsonPath-0.8.0.js'
            // });
            let filename = document.getElementById('variableName').value;
            if (!filename) {
                filename = "nofilename";
            }
            // console.log(jsonRespStr);
            // const windowData = new ExtractPageVariable('jsonRespStr').data;
            // windowData.then(console.log);
            // windowData.then(data => {
            //     // Do work here
            //     console.log(data);
            // });
            // code = "// Commerce BML Library > emailNotificationGenerator\ntotalMarginVal = \"\";\ntotalDiscVal = \"\";\ntotalVal = \"\";\napprovalReason = \"your\";\nemailBodyOM = \"\"; //Manual Estimate Approval\nif(ReasonName == \"Manual Estimate Approval\"){\n\tapprovalReason = \"Manual Estimate\";\n}elif(ReasonName == \"Management Approval\"){\n\tapprovalReason = \"Manager\";\n}elif(ReasonName == \"VP Sales Approval\"){\n\tapprovalReason = \"VP\";\n}\nemailBodyOM =\tpreparedByName_quote + \" has submitted quote \" + quoteNumber_quote + \" for \" + approvalReason \n\t\t\t+ \" review.\\n\\n\"\n\t\t\t+ \"You can use the link below to review the transaction.\\n\"\n\t\t\t+ \"\\tDirect Link:\\n\\n\"\n\t\t\t+ \"\\t\\t\" + TransactionURL;\n\nemailBody =\tpreparedByName_quote + \" has submitted quote \" + quoteNumber_quote + \" for \" + approvalReason +\" review.\\n\"\n\t\t+ \"\\n\"\n\t\t+ \"Please Respond to this email with the word Approve or Reject in the first line.\\n\"\n\t\t+ \"Add any comments you may have on the second line.\\n\"\n\t\t+ \"\\n\";\nif(len(SubmitComment) > 0){\n\temailBody = emailBody \t+ \"Requester's Comment:\\n\"\n\t\t\t\t+ \"\\t\" + SubmitComment + \"\\n\"\n\t\t\t\t+ \"\\n\";\n}\nif(len(ReasonDescription) > 0){\n\temailBody = emailBody \t+ \"Reason for Approval:\\n\"\n\t\t\t \t+ \"\\t\" + ReasonDescription + \"\\n\"\n\t\t\t\t+ \"\\n\";\n}\nif(string(totalMarginDollar_quote) <> \"\"){\n\tmarginArr = split(string(totalMarginDollar_quote),\".\");\n\tif(len(marginArr[1]) == 1){\n\t\ttotalMarginVal = string(totalMarginDollar_quote) + \"0\";\n\t}else{\n\t\ttotalMarginVal = string(totalMarginDollar_quote);\n\t}\n}\n\nif(string(totalDiscount_quote) <> \"\"){\n\tdiscArr = split(string(totalDiscount_quote),\".\");\n\tif(len(discArr[1]) == 1){\n\t\ttotalDiscVal = string(totalDiscount_quote) + \"0\";\n\t}else{\n\t\ttotalDiscVal = string(totalDiscount_quote);\n\t}\n}\n\nif(string(total_quote) <> \"\"){\n\ttotalArr = split(string(total_quote),\".\");\n\tif(len(totalArr[1]) == 1){\n\t\ttotalVal = string(total_quote) + \"0\";\n\t}else{\n\t\ttotalVal = string(total_quote);\n\t}\n}\n\nemailBody = emailBody \t+ \"Quote Information:\\n\"\n\t\t\t+ \"\\n\";\nif(ReasonName == \"Discount Above Threshold\" OR ReasonName == \"Total Margin Below Threshold\" OR ReasonName == \"Management Approval\"){\n\temailBody = emailBody \t+ \"\\tTotal Quote Margin:       \" + string(totalMarginPercent_quote) + \"%\\n\"\n\t\t\t\t+ \"\\tTotal Quote Margin:     $ \" + totalMarginVal + \"\\n\"\n\t\t\t\t+ \"\\tTotal Quote Discount:   $ \" + totalDiscVal + \"\\n\";\n}\nemailBody = emailBody \t+ \"\\tTotal Quote Value:      $ \" + totalVal + \"\\n\"\n\t\t\t+ \"\\n\"\n\t\t\t+ \"You can use the link below to review the transaction.\\n\"\n\t\t\t+ \"\\tDirect Link:\\n\"\n\t\t\t+ \"\\t\\t\" + TransactionURL + \"\\n\"\n\t\t\t+ \"\\n\";\n\n// add in the xsl view of the Quote\nxslName = \"propsal\";\nif(ReasonName == \"Manual Estimate Approval\"){\n\treturn emailBodyOM + \"$,$\" + xslName;\n}\nreturn emailBody + \"$,$\" + xslName;";
            testCode = "PLACEHOLDER TEST CODE";
            // <input type="checkbox" autocomplete="off" id="useScript" name="useScript" class=" x-form-checkbox x-form-field" checked="">
            // <textarea style="width: 242px; height: 44px;" autocomplete="off" id="ext-comp-1080" name="testScript" class=" x-form-textarea x-form-field "></textarea>
            // maybe $..[?(@.componentId=='mainScriptForm')].data")
            // header = "// " + filename + ".bml";
            // footer = "// modified by: ";

            // code = jsonPath(jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
            // ExtractPageVariable('jsonRespStr').data.then(pageVar => {
            //     // Do work here 💪
            //     console.log("pageVar");
            //     console.log(pageVar);
            //     code = pageVar;
            // });
            // chrome.tabs.executeScript(tabId, {code:'var w = window; console.log(w);'});
            // jsonPath(window.jsonRespStr, "$.widget.items[1].component.widget.items[1].component.widget.items[0].component.data");
            sendResponse({
                filename: filename,
                code: code
                // header: header,
                // footer: footer
            });
        }
        // else if (request.greeting == "unloadTest") {
        //     sendResponse({
        //         filename: filename,
        //         code: testCode
        //     });
        // }
    });

// class ExtractPageVariable {
//     constructor(variableName) {
//         this._variableName = variableName;
//         this._handShake = this._generateHandshake();
//         this._inject();
//         this._data = this._listen();
//     }

//     get data() {
//         return this._data;
//     }

//     // Private

//     _generateHandshake() {
//         const array = new Uint32Array(5);
//         return window.crypto.getRandomValues(array).toString();
//     }

//     _inject() {
//         function propagateVariable(handShake, variableName) {
//             const message = { handShake };
//             message[variableName] = window[variableName];
//             window.postMessage(message, "*");
//         }

//         const script = `( ${propagateVariable.toString()} )('${this._handShake}', '${this._variableName}');`
//         const scriptTag = document.createElement('script');
//         const scriptBody = document.createTextNode(script);

//         scriptTag.id = 'chromeExtensionDataPropagator';
//         scriptTag.appendChild(scriptBody);
//         document.body.append(scriptTag);
//     }

//     _listen() {
//         return new Promise(resolve => {
//             window.addEventListener("message", ({ data }) => {
//                 // We only accept messages from ourselves
//                 if (data.handShake != this._handShake) return;
//                 resolve(data);
//             }, false);
//         })
//     }
// }
