//ADMIN COMMERCE INJECT

window.addEventListener('load', function() {
    main();
})

//Listen for the code event
window.addEventListener("PassCodeToBackground", function(evt) {
    code = evt.detail;
}, false);

//Listen for unload code event
window.addEventListener('unloadCode', function(evt) {
    //     alert(frame_bm_script.editArea.textarea.value);
    let code = document.getElementById('textarea');
    alert(code);
    let event = new CustomEvent("PassCodeToBackground", { detail: code });
    window.dispatchEvent(event);
}, false);

//Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    code = evt.detail;
    frame_bm_script.editArea.textarea.value = code;
    frame_bm_script.editArea.textareaFocused = true;

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
    if (textArea) {
        alert(textArea);
    }

    let event = new CustomEvent("PassToBackground", { detail: frame_bm_script.editArea.textarea.value });
    window.dispatchEvent(event);
}