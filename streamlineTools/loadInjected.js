// window.addEventListener('load', function () {
//     // alert("It's loaded!");
//     main();
// })

// function main() {

// }

//Listen for the load code event
window.addEventListener("loadCode", function(evt) {
    // alert(evt);
    // chrome.runtime.sendMessage(evt.detail);
    code = evt.detail;
    // alert(code);
    frame_bm_script.editArea.textarea.value = code;
    frame_bm_script.editArea.textareaFocused = true;

    //Perform Validation
    document.getElementById('ext-gen22').click();
}, false);