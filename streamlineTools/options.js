// OPTIONS_DEBUG FLAG
var OPTIONS_DEBUG = false;

function logDebug(message, ...args) {
    if (OPTIONS_DEBUG) {
        console.log("[OPTIONS_DEBUG]", message, ...args);
    }
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('document loaded');

  // restore_options();

  const saveButton = document.getElementById('save');
  if (saveButton) {
    saveButton.addEventListener('click', save_options);
  } else {
    console.error("Element with id 'save' not found.");
  }

  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.onclick = function () {
      window.location = '/popup.html';
    };
  } else {
    console.error("Element with id 'back' not found.");
  }

  const footer = document.getElementById('footer');
  if (footer) {
    footer.innerHTML = getFooter();
  } else {
    console.error("Element with id 'footer' not found.");
  }
});

// FOOTER INFORMATION
const manifest = chrome.runtime.getManifest();

document.addEventListener('DOMContentLoaded', () => {
    logDebug("DOM fully loaded, setting footer information.");
    document.getElementById('footer').innerHTML = getFooter();
});

function getFooter() {
    return '<p>' + manifest.name + ' v' + manifest.version + '</p>';
}