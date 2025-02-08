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
