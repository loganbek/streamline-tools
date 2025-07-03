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

  // Load existing options
  loadOptions();

  // Initialize save button
  const saveButton = document.getElementById('save');
  if (saveButton) {
    function save_options() {
      logDebug("Saving options...");
      
      // Get values from form elements
      const options = {
        githubClientId: document.getElementById('githubClientId').value.trim(),
        // Add your options here, for example:
        // setting1: document.getElementById('setting1').value,
        // setting2: document.getElementById('setting2').checked,
      };

      // Save to Chrome storage
      chrome.storage.local.set(options, function() {
        // Update status to let user know options were saved
        const status = document.getElementById('status');
        if (status) {
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 2000);
        }
        
        logDebug("Options saved:", options);
      });
    }

    saveButton.addEventListener('click', save_options);
  } else {
    console.error("Element with id 'save' not found.");
  }

  // Initialize back button
  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.onclick = function () {
      window.location = '/popup/popup.html';
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

/**
 * Load existing options from storage
 */
function loadOptions() {
  chrome.storage.local.get(['githubClientId'], function(result) {
    if (result.githubClientId) {
      document.getElementById('githubClientId').value = result.githubClientId;
      logDebug("Loaded GitHub Client ID from storage");
    }
  });
}

// FOOTER INFORMATION
const manifest = chrome.runtime.getManifest();

// Function to get footer content
function getFooter() {
    try {
        const name = manifest.name ? manifest.name.replace(/[<>]/g, '') : 'Unknown';
        const version = manifest.version || '0.0.0';
        const text = document.createTextNode(`${name} v${version}`);
        const p = document.createElement('p');
        p.appendChild(text);
        return p.outerHTML;
    } catch (error) {
        logDebug('Error creating footer:', error);
        return '<p>Extension Info Unavailable</p>';
    }
}