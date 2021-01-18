// ADMIN COMMERCE RULES CONTENT

// VARS
var code = "";
var filename;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // let filename2 = document.querySelectorAll("input[id^=x-auto]")[1].value;
        // alert(filename2);
        // let ruleName = document.querySelector("input[name='variable_name']").value;
        // alert(ruleName);
        // let ruleType = window.name;
        // alert(ruleType);
        // let filename = ruleName + "." + ruleType;
        // alert(filename);
        // let filename = "commerceRuleName";
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.greeting ?
            "greeting: " + request.greeting :
            "nogreeting");
        if (request.greeting == "unload") {
            let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
            window.dispatchEvent(unloadEvent);
            chrome.storage.sync.get(['commerceFileName'], function(result) {
                console.log('Value currently is ' + result.key);
                if (result.key !== undefined) {
                    filename = result.key;
                }
            });
            sendResponse({
                filename: filename,
                code: code
            });
        } else if (request.greeting == "load") {
            let loadEvent = new CustomEvent("loadCode", { detail: request.code });
            window.dispatchEvent(loadEvent);
        } else if (request.greeting == "filename") {
            sendResponse({
                filename: filename
            });
        } else if (request.greeting == "commerceFilename") {
            sendResponse({
                filename: "commerceRulesFileNameFromCS"
            });
        }
    });


if (document.getElementsByName('varName').length > 0) {
    filename = document.getElementsByName('varName')[0].value;
    chrome.storage.sync.set({ 'commerceFileName': filename }, function() {
        console.log("you saved me!! comm rules");
        console.log(filename);
        // console.log(result.variable_name);
    });
}