/**
 * Hot Reload Utility for Streamline Tools
 * 
 * This script enables automatic reloading of the extension during development
 * when files are changed. It watches for file modifications in the extension
 * directory and triggers a reload of the extension and active tab.
 * 
 * @version 1.0.0
 * @license Unlicense
 */

const RELOAD_DELAY = 1000; // 1 second delay between detections
const DEBOUNCE_DELAY = 2000; // 2 second debounce for multiple rapid changes

const filesInDirectory = dir =>
  new Promise(resolve =>
    dir.createReader().readEntries(entries =>
      Promise.all(
        entries
          .filter(e => e.name[0] !== '.')
          .map(e =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise(resolve => e.file(resolve))
          )
      )
        .then(files => [].concat(...files))
        .then(resolve)
    )
  );

const timestampForFilesInDirectory = dir =>
  filesInDirectory(dir).then(files =>
    files.map(f => f.name + f.lastModifiedDate).join()
  );

let reloadTimeoutId = null;
const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), RELOAD_DELAY);
    } else {
      // Clear any pending reload
      if (reloadTimeoutId) {
        clearTimeout(reloadTimeoutId);
      }
      
      // Debounce the reload
      reloadTimeoutId = setTimeout(() => {
        reloadTimeoutId = null;
        
        // Reload extension
        chrome.runtime.reload();
        
        // Reload active tab after extension reload
        setTimeout(() => {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id);
            }
          });
        }, 500); // Small delay to ensure extension is reloaded first
      }, DEBOUNCE_DELAY);
      
      // Continue watching
      watchChanges(dir, timestamp);
    }
  }).catch(error => {
    console.error('Hot reload error:', error);
    setTimeout(() => watchChanges(dir, lastTimestamp), RELOAD_DELAY);
  });
};

// Only run in development mode
chrome.management.getSelf(self => {
  if (self.installType === 'development') {
    chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir));
  }
});
