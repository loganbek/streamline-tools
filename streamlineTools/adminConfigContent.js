// let commentHeader = "";
// let code = "";
// let testCode = "";
var code = "";
var testCode = "";
var filename = filename || "";

if (document.getElementById("#x-auto-3-input")) {
    filename = document.getElementById("#x-auto-3-input").value;
    // document.querySelector("#x-auto-3-input")
    console.log(filename);
}

if (window.document.getElementById("#x-auto-3-input")) {
    filename = window.document.getElementById("#x-auto-3-input").value;
    console.log(filename)
}

window.addEventListener('unloadCode', function(evt) {
    // frameList = window.frames;
    // console.log("frameList ->" + frameList);
    // // console.log("frameList.editAreas.value -> " + frameList.editAreas.value);
    // console.log("frameList.editAreas -> " + frameList.editAreas);
    // console.log("frameList.textArea -> " + frameList.textArea);
    // // console.log("frameList.textArea.value -> " + frameList.textArea.value);
    // console.log("frameList" + frameList.value);
    // // console.log("frameList.querySelector" + frameList.querySelector("#textarea"));
    // // #textarea
    // console.log(frameList.contentWindow);
    // console.log(document.getElementsByTagName("iframe")[0].contentWindow); // <- build on this
    // console.log(document.querySelector("#frame_x-auto-143-area"));
    // detail: frame_bm_script.editArea.textarea.value
    // /html/body/div[1]/div[3]/div[2]/textarea
    // document.querySelector("#textarea")
    // [attribute*="value"]
    // console.log()
    detail1 = "@#$@#";
    let event = new CustomEvent("PassCodeToBackground", { detail: detail1 });
    window.dispatchEvent(event);
})

//Listen for the PassToBackground event
window.addEventListener("PassToBackground", function(evt) {
    code = evt.detail;
}, false);

//Listen for the PassCommentHeader event
window.addEventListener("PassCommentHeader", function(evt) {
    commentHeader = evt.detail;
}, false);

//Listen for the code event
window.addEventListener("PassCodeToBackground", function(evt) {
    code = evt.detail;
}, false);

//Listen for the testcode event
window.addEventListener("PassTestCodeToBackground", function(evt) {
    testCode = evt.detail;
}, false);

//Listen for the unloadCode event
// window.addEventListener("unloadCode", function(evt) {
//     code = evt.detail;
// }, false);

function injectJs(link) {
    let scr = document.createElement('script');
    scr.type = "text/javascript";
    scr.src = link;
    document.getElementsByTagName('head')[0].appendChild(scr);
}

injectJs(chrome.extension.getURL('adminConfigInjected.js'));

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // comm rules var name
        // document.getElementById('x-auto-214-input').value;
        //TODO WILD CARD
        // let filename = document.getElementById('x-auto-3-input').value;
        // let filename = document.querySelectorAll("input[id*=x-auto-]");
        // let filename = document.getElementsByName("varName").value;
        // console.log(document.getElementById("#x-auto-3-input").value);
        // if (document.getElementById("#x-auto-3-input")) {
        //     filename = document.getElementById("#x-auto-3-input").value;
        //     console.log(filename);
        // }
        // let filename = "configHardCodeFileName";
        // var wldCardStrSelector = "x-auto-" + "*" + "-input";
        // var contentWindow = document.querySelectorAll(wldCardStrSelector);
        // var contentWindow = document.querySelectorAll('.page-iframe');
        console.log(filename);
        if (filename === "") {
            filename = "setSupplierDescriptionBeforeReady";
        }
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request.greeting ?
            "greeting: " + request.greeting :
            "nogreeting");
        if (request.greeting == "unload") {
            let unloadEvent = new CustomEvent("unloadCode", { detail: request.code });
            window.dispatchEvent(unloadEvent);
            // if (!code.startsWith(commentHeader)) {
            //     code = commentHeader + "\n\n" + code;
            // }
            sendResponse({
                filename: filename,
                code: code
            });
        } else if (request.greeting == "unloadTest") {
            let unloadTestEvent = new CustomEvent("unloadTestCode", { detail: request.code });
            window.dispatchEvent(unloadTestEvent);
            sendResponse({
                filename: filename,
                testCode: testCode
            });
        } else if (request.greeting == "load") {
            let loadEvent = new CustomEvent("loadCode", { detail: request.code });
            window.dispatchEvent(loadEvent);
            var elem = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea");
            console.log(elem);

            elem.click;
            elem.click();

            elem.focus();

            var closestElem = getClosest(elem, '#editor');
            var closestResult = getClosest(elem, "#result");
            // var closestSelection = getClosest(elem, "#selection_field_text"); <- BREAKING
            // var closestContentHighlight = getClosest(elem, "#content_highlight"); <- BREAKING

            var closestContainer = getClosest(elem, "#container");

            var closestBody = getClosest(elem, "body");
            // console.log(closestContentHighlight);
            //#container

            // var closestCursor = getClosest("#cursor_pos"); // errors

            // console.log(closestSelection);
            console.log(closestContainer);
            console.log(closestResult);
            console.log(closestElem);
            console.log(closestBody);
            // console.log(closestCursor);

            // closestCursor.click;
            // closestCursor.click();
            // closestElem.click;
            // closestContentHighlight.click;
            // closestContentHighlight.click();

            // closestSelection.click;
            // closestSelection.click();

            closestBody.click;
            closestBody.click();

            closestContainer.click;
            closestContainer.click();

            closestContainer.focus();

            elem.click;
            elem.click();

            // document.getElementById('elementId').dispatchEvent(new MouseEvent("click",{bubbles: true, cancellable: true}));

            closestElem.dispatchEvent(new MouseEvent("click"), { bubbles: true, cancellable: true });
            closestResult.dispatchEvent(new MouseEvent("click"), { bubbles: true, cancellable: true });

            closestElem.click();
            closestElem.click;

            closestResult.click();
            closestResult.click;
        } else if (request.greeting == "loadTest") {
            console.log(request.code);
            let loadTestEvent = new CustomEvent("loadTestCode", { detail: request.code });
            window.dispatchEvent(loadTestEvent);
        } else if (request.greeting == "filename") {
            sendResponse({
                filename: filename
            });
            // return true;
        }
        // return true;
    });

function getElementsStartsWithId(id) {
    var children = document.body.getElementsByTagName('*');
    var elements = [],
        child;
    for (var i = 0, length = children.length; i < length; i++) {
        child = children[i];
        if (child.id.substr(0, id.length) == id)
            elements.push(child);
    }
    return elements;
}

//OLD CONTENT SCRIPT MANIFEST
// "content_scripts": [{
//     "matches": [
//         "*://*.bigmachines.com/*"
//     ],
//     "js": [
//         "jsonpath-1.0.2.js",
//         "content.js"
//     ],
//     "all_frames": true
// }],

// filename = document.querySelector("#x-auto-3-input").value;

// chrome.storage.sync.set({ 'filename': 'filename' }, function() {
//     console.log("you saved me!!");
//     console.log(result.variable_name);
// });

// chrome.storage.sync.get(['filename'], function(result) {
//     if (result.variable_name == undefined) {
//         console.log("I am retrieved!!");
//         console.log(result.variable_name);
//     }
// });

if (document.querySelector("#x-auto-3-input")) {
    filename = document.querySelector("#x-auto-3-input").value;
}

chrome.storage.sync.set({ 'filename': 'filename' }, function() {
    console.log("you saved me!!");
    console.log(result.variable_name);
});

chrome.storage.sync.get(['filename'], function(result) {
    if (result.variable_name == undefined) {
        console.log("I am retrieved!!");
        console.log(result.variable_name);
    }
});

/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
var getClosest = function(elem, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem;
    }

    return null;

};

/**
 * Get all of an element's parent elements up the DOM tree
 * @param  {Node}   elem     The element
 * @param  {String} selector Selector to match against [optional]
 * @return {Array}           The parent elements
 */
var getParents = function(elem, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Setup parents array
    var parents = [];

    // Get matching parent elements
    for (; elem && elem !== document; elem = elem.parentNode) {

        // Add matching parents to array
        if (selector) {
            if (elem.matches(selector)) {
                parents.push(elem);
            }
        } else {
            parents.push(elem);
        }

    }

    return parents;

};

/**
 * Get all of an element's parent elements up the DOM tree until a matching parent is found
 * @param  {Node}   elem     The element
 * @param  {String} parent   The selector for the parent to stop at
 * @param  {String} selector The selector to filter against [optionals]
 * @return {Array}           The parent elements
 */
var getParentsUntil = function(elem, parent, selector) {

    // Element.matches() polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Setup parents array
    var parents = [];

    // Get matching parent elements
    for (; elem && elem !== document; elem = elem.parentNode) {

        if (parent) {
            if (elem.matches(parent)) break;
        }

        if (selector) {
            if (elem.matches(selector)) {
                parents.push(elem);
            }
            break;
        }

        parents.push(elem);

    }

    return parents;

};


// var elem = document.querySelector('#some-element');
// var parents = getParents(elem, '.some-class');
// var allParents = getParents(elem.parentNode);

// var elem = document.querySelector('#example');
// var parents = getClosest(elem.parentNode, '[data-sample]');

// var elem = document.querySelector('#some-element');
// var parentsUntil = getParentsUntil(elem, '.some-class');
// var parentsUntilByFilter = getParentsUntil(elem, '.some-class', '[data-something]');
// var allParentsUntil = getParentsUntil(elem);
// var allParentsExcludingElem = getParentsUntil(elem.parentNode);