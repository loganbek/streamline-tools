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
    frameList = window.frames;
    console.log("frameList ->" + frameList);
    console.log("frameList.editAreas.value -> " + frameList.editAreas.value);
    console.log("frameList.editAreas -> " + frameList.editAreas);
    console.log("frameList.textArea -> " + frameList.textArea);
    // console.log("frameList.textArea.value -> " + frameList.textArea.value);
    console.log("frameList" + frameList.value);
    // console.log("frameList.querySelector" + frameList.querySelector("#textarea"));
    // #textarea
    console.log("frameList.contentWindow");
    console.log(frameList.contentWindow);
    console.log("frameList.contentWindow.querySelector('#frame_x-auto-143-area')")
    console.log(frameList.contentWindow.querySelector("#frame_x-auto-143-area"));
    console.log(document.getElementsByTagName("iframe")[0].contentWindow); // <- build on this
    console.log(document.querySelector("#frame_x-auto-143-area"));
    // detail: frame_bm_script.editArea.textarea.value
    // /html/body/div[1]/div[3]/div[2]/textarea
    // document.querySelector("#textarea")
    // [attribute*="value"]
    // var wldCardStrSelector = " " + "*" + " ";
    // var document.querySelectorAll(wldCardStrSelector);

    // var contentWindow = document.getElementById('.page-iframe').contentWindow
    // var contentWindow = document.querySelectorAll('.page-iframe')
    let event = new CustomEvent("PassCodeToBackground", { detail: frame_bm_script.editArea.textarea.value });
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
    document.getElementById("textarea").value = code;
    document.getElementById("textarea").textareaFocused = true;
    //Perform Validation
    document.getElementsByClassName('x-btn-text ')[16].click();
    // document.getElementById('ext-gen22').click();
    // document.getElementsByClassName('bmx-spellcheck')[0].click();
    // document.getElementById('check').click();
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