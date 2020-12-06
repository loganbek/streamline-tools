//ADMIN CONFIG INJECT

window.addEventListener('load', function() {
    main();
})

//Listen for the code event
// window.addEventListener("PassCodeToBackground", function(evt) {
//     code = evt.detail;
// }, false);

//Listen for unload code event
// window.addEventListener('unloadCode', function(evt) {
//     //     alert(frame_bm_script.editArea.textarea.value);
//     let code = document.getElementById('textarea');
//     alert(code);
//     let event = new CustomEvent("PassCodeToBackground", { detail: code });
//     window.dispatchEvent(event);
// }, false);

window.addEventListener('unloadCode', function(evt) {

    // https://stackoverflow.com/questions/1938294/select-div-using-wildcard-id
    // Called as: document.getElementsByRegex("pattern").
    // Returns an array of all elements matching a given regular expression on id.
    // 'pattern' argument is a regular expression string.
    //

    document['getElementsByRegex'] = function(pattern) {
        var arrElements = []; // to accumulate matching elements
        var re = new RegExp(pattern); // the regex to match with

        function findRecursively(aNode) { // recursive function to traverse DOM
            if (!aNode)
                return;
            if (aNode.id !== undefined && aNode.id.search(re) != -1)
                arrElements.push(aNode); // FOUND ONE!
            for (var idx in aNode.childNodes) // search children...
                findRecursively(aNode.childNodes[idx]);
        };

        findRecursively(document); // initiate recursive matching
        return arrElements; // return matching elements
    };


    //     frameList = window.frames;
    //     console.log("frameList ->" + frameList);
    //     console.log("frameList.editAreas.value -> " + frameList.editAreas.value);
    //     console.log("frameList.editAreas -> " + frameList.editAreas);
    //     console.log("frameList.textArea -> " + frameList.textArea);
    //     // console.log("frameList.textArea.value -> " + frameList.textArea.value);
    //     console.log("frameList" + frameList.value);
    //     // console.log("frameList.querySelector" + frameList.querySelector("#textarea"));
    //     // #textarea
    //     console.log("frameList.contentWindow");
    //     console.log(frameList.contentWindow);
    //     console.log("frameList.contentWindow.querySelector('#frame_x-auto-*-area')")
    //         //     console.log(frameList.contentWindow.querySelector("#frame_x-auto-*-area"));
    //     console.log("document.getElementsByRegex('frame_x-auto-*-area')");
    //     console.log(document.getElementsByRegex('frame_x-auto-*-area')); // doesn't work
    //     console.log(document.getElementsByTagName("iframe")[0].contentWindow); // <- build on this
    // frame_x-auto-*-rea
    // <iframe name="frame_x-auto-175-area" id="frame_x-auto-175-area" frameborder="0" style="border-width: 0px; overflow: hidden; display: inline; width: 989px; height: 643px;"></iframe>
    console.log(document.getElementsByTagName("iframe")[1]);
    console.log("CONTENT DOCUMENT");
    //     /html/body / div[1] / div[3] / div[2] / textarea
    // /html/body/div[1]/div[3]/div[2]/textarea
    console.log(document.getElementsByTagName("iframe")[1].contentDocument);
    console.log(document.getElementsByTagName("iframe")[1].contentDocument.innerHTML);
    console.log(document.getElementsByTagName("iframe")[1].contentDocument.html);
    console.log(document.getElementsByTagName("iframe")[1].contentDocument.body.querySelector("#textarea").parent);
    // editArea.textarea.value
    // .editArea.textarea.value
    // .div[1].div[3].div[2].textArea
    console.log("CONTENT WINDOW");
    console.log(document.getElementsByTagName("iframe")[1].contentWindow);
    console.log(document.getElementsByTagName("iframe")[1].contentWindow.innerHTML);
    console.log(document.getElementsByTagName("iframe")[1].contentWindow.html);
    // document.querySelector("#textarea")
    // console.log(document.getElementsByTagName("iframe")[1]).contentDocument; // <- build on this
    // document.querySelector("#textarea")
    // console.log(document.getElementsByTagName("iframe")[1].editArea.textarea.value);
    // console.log(document.getElementsByTagName("iframe").getElementById("textarea"));
    console.log(document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").value);
    // document.querySelector("#textarea")
    // document.querySelector("#textarea")
    // document.querySelector("#textarea");
    //     console.log(document.getElementsByTagName("iframe")[2].contentWindow);
    //     console.log(document.getElementsByTagName("iframe")[3].contentWindow);
    //     console.log("document.querySelector('#frame_x-auto-143-area'");
    //     console.log(document.querySelector("#frame_x-auto-143-area"));
    //     document.querySelectorAll('iframe').forEach(item =>
    //         // console.log(item.contentWindow.document)
    //         textAreaReference = item.contentWindow.document.querySelector('#textarea'),
    //         // console.log(textAreaReference)
    //     );
    //     console.log(frameList.contentWindow);
    //     console.log(document.querySelectorAll('iframe').contentWindow);
    //     console.log(document.querySelector('iframe').querySelector('#textarea'));
    // document.querySelector("#textarea")
    textAreaCode = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").value;
    console.log(textAreaCode);
    if (textAreaCode) {
        testConfigCode = textAreaCode;
    } else {
        testConfigCode = "\n";
    }
    console.log(textAreaCode);
    console.log(testConfigCode);
    // detail: frame_bm_script.editArea.textarea.value
    // /html/body/div[1]/div[3]/div[2]/textarea
    // document.querySelector("#textarea")
    // [attribute*="value"]
    // var wldCardStrSelector = " " + "*" + " ";
    // var document.querySelectorAll(wldCardStrSelector);

    // var contentWindow = document.getElementById('.page-iframe').contentWindow
    // var contentWindow = document.querySelectorAll('.page-iframe')
    //     let event = new CustomEvent("PassCodeToBackground", { detail: frame_bm_script.editArea.textarea.value });
    let event = new CustomEvent("PassCodeToBackground", { detail: testConfigCode });
    window.dispatchEvent(event);
})

//Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    code = evt.detail;
    // frame_bm_script.editArea.textarea.value = code;
    // frame_bm_script.editArea.textareaFocused = true;
    // frame_bm_script_id.editArea.textarea.value = code;
    // frame_bm_script_id.editArea.textareaFocused = true;
    // window.editArea.textarea.value = code;
    // window.editArea.textareaFocused = true;
    // console.log(window.editArea)

    //     document.querySelector("#textarea").value = "test";
    //     document.querySelector("#textarea").textareaFocused = true;
    // document.getElementById("textarea").value = code;
    // document.getElementById("textarea").textareaFocused = true;

    // id="x-auto-3-input" for varname
    console.log(document.getElementById("x-auto-3-input"));

    // WIP: LOAD TRIALS
    // console.log("parent.editArea.textarea.value = code;" + "parent.editArea.textareaFocused = true");
    textarea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea");
    textarea.value = code;
    // textarea.onchange(); <- seems to do nothing
    // https://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
    // textarea.click;
    // textarea.execCommand("onchange");
    // textarea.editArea.textareaFocused = true;

    // validateButton.click();
    // updateTextArea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").reload();
    // textarea.onchange(); <- Does nothing
    // textarea.value; <- does nothing
    // updateTextArea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").onblur;
    // updateTextArea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").textareaFocused = true;
    // updateTextArea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").click();
    // updateTextArea = document.getElementsByTagName("iframe")[1].contentDocument.querySelector("#textarea").click;

    document.querySelector("body")
        // TODO LOGAN - parent parent click - 
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    console.log("Hello");
    sleep(2000).then(() => { console.log("World!"); });

    // console.log(parent.window.document.getElementById('textarea'));
    // parent.window.document.getElementById('textarea').click();

    // document.body.parentNode; // Returns the <html> element
    // document.body.parentElement; // Returns the <html> element

    // document.documentElement.parentNode; // Returns the Document node
    // document.documentElement.parentElement;
    // javascript:editArea.textareaFocused=true;
    // document.querySelector("#textarea").click();
    // innerText === "Validate";
    // outerText === "Validate";
    // document.getElementById('ext-gen22').click();
    // document.getElementsByClassName('bmx-spellcheck')[0].click();
    // document.getElementById('check').click();
    //Perform Validation
    // console.log("HTML COLLECTION");
    // console.log(document.getElementsByClassName('x-btn-text '));
    // document.getElementsByClassName('x-btn-text ')[16].click(); // TODO FIGURE OUT HOW TO FILTER
    // document.getElementsByClassName('x-btn-text ')[15].click(); // clicking close?
    buttonCollection = document.getElementsByClassName('x-btn-text ');
    //Maybe loop through collection and check for "Validate"?
    for (let item of buttonCollection) {
        // console.log(item.id);
        // console.log(item.innerHTML);
        // console.log(item.innerText);
        // console.log(item.outerText);
        if (item.innerText === "Validate") {
            console.log("found validate button");
            validateButton = item;
        }
    }

    validateButton.click();
}, false);

function main() {
    let textArea = document.getElementById('textarea');
    // if (document.title) {
    //     alert(document.title);
    // }
    // if (textArea.value) {
    //     alert(textArea.value);
    //     code = textArea.value;
    // }

    code = document.querySelector("#textarea").value;
    alert(code);

    let event = new CustomEvent("PassToBackground", { code });
    window.dispatchEvent(event);
}

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