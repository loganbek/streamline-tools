//ADMIN COMMERCE INJECT

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
    // #textarea
    iframes = document.getElementsByTagName("iframe");
    console.log(iframes);
    textAreaCode = document.getElementsByTagName("iframe")[0].contentDocument.querySelector("#textarea").value;
    console.log(textAreaCode);
    if (textAreaCode) {
        testCommerceCode = textAreaCode;
    } else {
        testCommerceCode = "\n";
    }
    console.log(textAreaCode);
    console.log(testCommerceCode);
    let event = new CustomEvent("PassCodeToBackground", { detail: testCommerceCode });
    window.dispatchEvent(event);
})

//Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    code = evt.detail;
    // frame_bm_script.editArea.textarea.value = code;
    // frame_bm_script.editArea.textareaFocused = true;
    // frame_bm_script_id.editArea.textarea.value = code;
    // frame_bm_script_id.editArea.textareaFocused = true;

    textarea = document.getElementsByTagName("iframe")[0].contentDocument.querySelector("#textarea");
    textarea.value = code;

    //     document.querySelector("#textarea").value = "test";
    //     document.querySelector("#textarea").textareaFocused = true;
    //     document.getElementById("textarea").value = code;
    //     document.getElementById("textarea").textareaFocused = true;
    //Perform Validation
    // document.getElementById('ext-gen22').click();
    // document.getElementsByClassName('bmx-spellcheck')[0].click();
    document.getElementById('check').click();
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

    // let elements = document.getElementsByClassName("varName");
    // console.log(elements);
    // console.log(elements[0].value);


}