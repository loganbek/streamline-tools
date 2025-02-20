// OPTIONS_DEBUG FLAG
var OPTIONS_DEBUG = true;

function logDebug(message, ...args) {
    if (OPTIONS_DEBUG) {
        console.log("[OPTIONS_DEBUG]", message, ...args);
    }
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('document loaded');

  // Initialize save button
  const saveButton = document.getElementById('save');
  if (saveButton) {
    saveButton.addEventListener('click', save_options);
  } else {
    console.error("Element with id 'save' not found.");
  }

  // Initialize back button
  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.onclick = function () {
      window.location = '/popup.html';
    };
  } else {
    console.error("Element with id 'back' not found.");
  }

  // Set footer content
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

// Function to get footer content
function getFooter() {
    return '<p>' + manifest.name + ' v' + manifest.version + '</p>';
}