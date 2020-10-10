//ADMIN COMMERCE INJECT

window.addEventListener('load', function() {
    main();
})

//Listen for unload code event
window.addEventListener('unloadCode', function(evt) {
    alert(frame_bm_script.editArea.textarea.value);
    let event = new CustomEvent("PassCodeToBackground", { detail: frame_bm_script.editArea.textarea.value });
    window.dispatchEvent(event);
});

//Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    code = evt.detail;
    frame_bm_script.editArea.textarea.value = code;
    frame_bm_script.editArea.textareaFocused = true;

    //Perform Validation
    // document.getElementById('ext-gen22').click();
    // document.getElementsByClassName('bmx-spellcheck')[0].click();
}, false);

function main() {
    if (document.title) {
        alert(document.title);
    }
}