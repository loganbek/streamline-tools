// Add stylesheet listeners for the
// 

//  https://devmcnichols.bigmachines.com/bmfsweb/devmcnichols/global/devmcnichols.css

// Add DEBUG flag for adminStylesheetsContent.js
let ADMIN_STYLESHEETS_CONTENT_DEBUG = true;

// Function to log debug messages
function logDebug(message, ...optionalParams) {
  if (ADMIN_STYLESHEETS_CONTENT_DEBUG) {
    console.log("[ADMIN_STYLESHEETS_CONTENT_DEBUG]", message, ...optionalParams);
  }
}

// UI elements

// Generate the code to pull the CSS files from the page

    function clickStylesheetLinks() {
        if (document.querySelector('a[href*="devmcnichols.css"]')) {
            document.querySelector('a[href*="devmcnichols.css"]').click();
        }
        if (document.querySelector('a[href*="devmcnicholsAlt.css"]')) {
            document.querySelector('a[href*="devmcnicholsAlt.css"]').click();
        }
        if (document.querySelector('a[href*="devmcnicholsAlta.css"]')) {
            document.querySelector('a[href*="devmcnicholsAlta.css"]').click();
        }
    }
    
    document.addEventListener('DOMContentLoaded', clickStylesheetLinks);

/*{} <table style="width:99%" border="0" cellspacing="0" cellpadding="1" class="dashed-table">
              <tbody><tr class="bgcolor-form">
                <td class="view-header" colspan="2">CSS Upload/Download Center</td>
              </tr>
              <tr class="bgcolor-list-odd">
              
                <td class="form-label" width="30%" nowrap="">Click to Download CSS:</td>
                <td class="form-input" style="padding-left:9px;"><a class="general-text" href="/bmfsweb/devmcnichols/global/devmcnichols.css">Download Stylesheet</a></td>
              </tr>
              <tr class="bgcolor-list-odd">
                <td class="form-label">Alternate CSS File:</td>
                <td class="form-input" style="padding-left:9px;"><input value="" type="file" maxlength="255" class="form-input" size="30" name="_additionalCSS"></td>
              </tr>
    
              <tr class="bgcolor-list-odd">
                <td class="form-label" nowrap="true">Click to Download Alternate CSS:</td>
                <td class="form-input" style="padding-left:9px;"><a class="general-text" href="/bmfsweb/devmcnichols/global/devmcnicholsAlt.css">Download Stylesheet</a>
                </td>
              </tr>
              <tr class="bgcolor-list-even">
                <td class="form-label" nowrap="">Delete Alternate CSS:</td>
                <td class="form-input" style="padding-left:9px;"><input type="checkbox" name="_deleteAdditionalCSS" value="1"></td>
              </tr>
     
          <tr class="bgcolor-list-odd">
            <td class="form-label">JET CSS File:</td>
            <td class="form-input" style="padding-left:9px;"><input value="" type="file" maxlength="255" class="form-input" size="30" name="_altaCSS"></td>
          </tr>
     
              <tr class="bgcolor-list-odd">
                <td class="form-label" nowrap="true">Click to Download JET CSS:</td>
                <td class="form-input" style="padding-left:9px;"><a class="general-text" href="/bmfsweb/devmcnichols/global/devmcnicholsAlta.css">Download Stylesheet</a>
                </td>
              </tr>
              <tr class="bgcolor-list-even">
                <td class="form-label" nowrap="">Delete JET CSS:</td>
                <td class="form-input" style="padding-left:9px;"><input type="checkbox" name="_deleteAltaCSS" value="1"></td>
              </tr>
     



     
            </tbody></table> }*/


// https://devmcnichols.bigmachines.com/admin/ui/branding/edit_site_branding.jsp

// Set up event listeners for the adminStylesheetsContent.js script
window.addEventListener('PassToBackground', function (evt) {
  code = evt.detail;
}, false);

window.addEventListener('PassCommentHeader', function (evt) {
    commentHeader = evt.detail;
    }
, false);

