// add in debugging to the console

const POPUP_SOAP_INTERFACES_DEBUG = true;

function logDebug(message, ...args) {
  if (POPUP_SOAP_INTERFACES_DEBUG) {
    console.log("[POPUP_SOAP_INTERFACES_DEBUG]", message, ...args);
  }
}

// use chrome.windows.getAll to access code in https://devmcnichols.bigmachines.com/rest/v1/interfaceCatalogs/soapCatalog/services/DataTables_v1
// use chrome.windows.getAll to access code in https://devmcnichols.bigmachines.com/rest/v18/metadata-catalog/commerceDocumentsQuickstart_commerce_processQuote_process

chrome.windows.getAll({ populate: true }, function (windows) {
  for (let i = 0; i < windows.length; i++) {
    let window = windows[i];
    // Commented out for development purposes:
    // if (window.type !== "normal") continue; // Skip non-normal windows
    // if (window.tabs.length === 0) continue; // Skip windows with no tabs
    // log the window for debugging visibility
    logDebug("Window:", window);
    console.log("Window", window);
    for (let j = 0; j < window.tabs.length; j++) {
      const tab = window.tabs[j];
      // Check if the tab URL matches the specific pattern
      if (/bigmachines\.com\/rest\/v1\/interfaceCatalogs\/soapCatalog\/services/.test(tab.url)) {
        logDebug("Tab URL matches:", tab.url);{
        console.log("Found tab with URL:", tab.url);
        // Perform actions with the tab here

        // Send getSOAPInterfaces message to the content script
        chrome.tabs.sendMessage(
          tab.id,
          { greeting: "getSOAPInterfaces" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else if (response) {
              console.log("Received response:", response);
              // Process the response as needed
              // save the code response to a file pulling thefilename frome the last part of the URL and the code from the response
              // Extract filename from the last segment of the URL path (e.g., "DataTables_v1" from "/services/DataTables_v1")
              const filename = `${response.url.split("/").pop()}.xml`;
              const code = response.code;
              try {
                if (!code) {
                  throw new Error("Empty response code");
                }
                const blob = new Blob([code], { type: "text/xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log(`Successfully downloaded ${filename}`);
              } catch (error) {
                console.error("Error downloading file:", error);
              }
            }
          }
        );
      }
    }
  }
});
