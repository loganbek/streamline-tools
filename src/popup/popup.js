'use strict';

// Debugging Flag
const POPUP_DEBUG = true;

/**
 * Logs debug messages to the console if debugging is enabled.
 * @param {string} message - The debug message.
 * @param {...any} args - Additional arguments to log.
 */
function logDebug(message, ...args) {
    if (POPUP_DEBUG) {
        console.log("[POPUP_DEBUG]", message, ...args);
    }
}

// Global Variables
let bmSiteSubDomain = '';
let bmSiteType = '';
let bmRuleType = '';
let bmFileType = 'bml';

// URL MATCHERS and Rules Types
// Config - Recommendation - https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=5268044&rule_type=1&pline_id=-1&segment_id=11&model_id=-1&fromList=true
// Config - Constraint - https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=4889573&rule_type=2&pline_id=-1&segment_id=11&model_id=-1&fromList=true
// Config - Hiding - https://devmcnichols.bigmachines.com/admin/configuration/rules/edit_rule.jsp?rule_id=4951171&rule_type=11&pline_id=-1&segment_id=11&model_id=-1&fromList=true

// Commerce - Action Before Formulas - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=30&process_id=4653759&document_id=4653823&action_id=54983795
// Commerce - Action After Formulas - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp?area=18&process_id=4653759&document_id=4653823&action_id=54983795
// Commerce - Rule - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?rule_id=1&fromList=true
// Commerce - Constraint Rule - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?rule_id=1&fromList=true
// Commerce - Hiding Rule - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?rule_id=1&fromList=true
// Commerce - Validation Rule - https://devmcnichols.bigmachines.com/admin/commerce/rules/edit_rule.jsp?rule_id=1&fromList=true

// Utils - https://devmcnichols.bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor&pageParams={id:'EXAMPLE_ID',folder_id:'EXAMPLE_FOLDER',process_id:'-1',doc_id:'-1'}&inputdata={appid:'sampleApp',service:'bmllibraryservice',operation:'getLibPageData',version:'1.0',header:'',params: {componentid:'libraryEditorPage',uicmd:'defineComponent', id:'EXAMPLE_ID',folder_id:'EXAMPLE_FOLDER',process_id:'-1',doc_id:'-1'}}&token=EXAMPLE_TOKEN

// Interfaces List - https://devmcnichols.bigmachines.com/admin/interfaceCatalogs/list_ics_resources.jsp
// Interfaces - REST - https://devmcnichols.bigmachines.com/rest/v1/quote/1
// Interfaces - SOAP - https://devmcnichols.bigmachines.com/rest/v1/interfaceCatalogs/soapCatalog/services/Security_v1

// Stylesheets - Stylesheet Manager - https://devmcnichols.bigmachines.com/admin/ui/branding/edit_site_branding.jsp
// Stylesheets - Header & Footer = https://devmcnichols.bigmachines.com/admin/ui/branding/edit_site_branding.jsp

// Documents  -global xsl - https://devmcnichols.bigmachines.com/admin/document-designer/4653759/editor/134737862


// URL matchers for different sections and rule types
const URL_MATCHERS = {
    config: {
        recommendation: {
            pattern: "bigmachines.com/admin/configuration/rules/edit_rule.jsp",
            ruleType: 1,
            fileType: "bml",
        },
        constraint: {
            pattern: "bigmachines.com/admin/configuration/rules/edit_rule.jsp",
            ruleType: 2,
            fileType: "bml",
        },
        hiding: {
            pattern: "bigmachines.com/admin/configuration/rules/edit_rule.jsp",
            ruleType: 11,
            fileType: "bml",
        },
        bommapping: {
            pattern: "bigmachines.com/admin/configuration/rules/edit_rule.jsp",
            ruleType: 23,
            fileType: "bml",
        },
        generic: "bigmachines.com/admin/configuration/rules",
    },
    commerce: {
        action: {
            pattern: "bigmachines.com/admin/commerce/actions/edit_action.jsp",
            fileType: "bml",
        },
        constraint: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule.jsp",
            fileType: "bml",
        },
        hiding: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule.jsp",
            fileType: "bml",
        },
        validation: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule.jsp",
            fileType: "bml",
        },
        library: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp",
            fileType: "bml",
        },
        rule: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule.jsp",
            fileType: "bml",
        },
        ruleInputs: {
            pattern: "bigmachines.com/admin/commerce/rules/edit_rule_inputs.jsp",
            fileType: "bml",
        },
        generic: "bigmachines.com/admin/commerce/rules",
    },
    utils: {
        url: "bigmachines.com/spring/bmllibrary?format=jsp&view=bmllibraryeditor",
        fileType: "bml",
    },
    interfaces: {
        rest: {
            url: "bigmachines.com/rest/v1/quote/",
            fileType: "json",
        },
        soap: {
            url: "bigmachines.com/soap/",
            fileType: "xml",
        },
        generic: "bigmachines.com/admin/interfaceCatalogs/list_ics_resources.jsp",
    },
    stylesheets: {
        stylesheetManager: {
            url: "bigmachines.com/admin/ui/branding/edit_site_branding.jsp",
            fileType: "css",
        },
        headerFooter: {
            url: "bigmachines.com/admin/ui/branding/edit_header_footer.jsp",
            fileType: "html",
        },
    },
    documents: {
        url: "bigmachines.com/admin/document-designer/",
        fileType: "xsl",
    },
};

// Utility function to check if URL matches a pattern
function matchesUrlPattern(url, patternKey, subPatternKey = null) {
    if (!url) return false;

    if (subPatternKey) {
        const pattern = URL_MATCHERS[patternKey][subPatternKey];
        return typeof pattern === 'string' ?
            url.includes(pattern) :
            url.includes(pattern.pattern);
    } else {
        const pattern = URL_MATCHERS[patternKey];
        return typeof pattern === 'string' ?
            url.includes(pattern) : false;
    }
}

/**
 * Extracts the value of a specified query parameter from a URL.
 * @param {string} url - The URL to search for the query parameter.
 * @param {string} name - The name of the query parameter to extract.
 * @returns {string} The decoded value of the query parameter, or an empty string if not present.
 */
function getUrlParameter(url, name) {
    const escapedName = name.replace(/[[\]\\]/g, '\\$&');
    const regex = new RegExp(`[?&]${escapedName}=([^&#]*)`);
    const results = regex.exec(url);
    return results ? decodeURIComponent(results[1].replace(/\+/g, ' ')) : '';
}

/**
 * Determines the rule type based on the `rule_type` parameter in the URL.
 * @param {string} url - The URL to analyze.
 * @returns {string|null} The rule type or null if not found.
 */
function determineRuleType(url) {
    const ruleTypeParam = getUrlParameter(url, 'rule_type');
    if (ruleTypeParam) {
        const ruleType = URL_MATCHERS.config.ruleTypes[ruleTypeParam] || `other_rule_type_${ruleTypeParam}`;
        logDebug(`Detected configuration rule type: ${ruleType}`);
        return ruleType;
    }
    return null;
}

/**
 * Determines the site type and rule type based on the URL.
 * @param {string} url - The URL to analyze.
 */
function analyzeUrl(url) {
    if (url.includes(URL_MATCHERS.config.generic)) {
        bmSiteType = 'config';
        bmRuleType = determineRuleType(url);
    } else if (url.includes(URL_MATCHERS.commerce.generic)) {
        bmSiteType = 'commerce';
        if (url.includes(URL_MATCHERS.commerce.action)) {
            bmRuleType = 'action';
        } else if (url.includes(URL_MATCHERS.commerce.rule)) {
            bmRuleType = 'rule';
        } else if (url.includes(URL_MATCHERS.commerce.ruleInputs)) {
            bmRuleType = 'rule_inputs';
        }
    } else if (url.includes(URL_MATCHERS.utils)) {
        bmSiteType = 'utils';
        bmRuleType = null;
    } else if (url.includes(URL_MATCHERS.interfaces.rest)) {
        bmSiteType = 'interfaces';
        bmRuleType = 'rest';
    } else if (url.includes(URL_MATCHERS.interfaces.soap)) {
        bmSiteType = 'interfaces';
        bmRuleType = 'soap';
    } else if (url.includes(URL_MATCHERS.stylesheets.stylesheetManager)) {
        bmSiteType = 'stylesheets';
        bmRuleType = 'stylesheet';
    } else if (url.includes(URL_MATCHERS.stylesheets.headerFooter)) {
        bmSiteType = 'stylesheets';
        bmRuleType = 'headerFooter';
    } else if (url.includes(URL_MATCHERS.documents)) {
        bmSiteType = 'documents';
        bmRuleType = null;
        bmFileType = 'xsl';
    } else {
        logDebug("Unrecognized URL pattern:", url);
    }

    logDebug("Site type set to:", bmSiteType);
    logDebug("Rule type set to:", bmRuleType);
}

/**
 * Sanitizes a filename by replacing invalid characters with underscores.
 * @param {string} filename - The filename to sanitize.
 * @returns {string} The sanitized filename.
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Saves text content to a file.
 * @param {string} filename - The name of the file.
 * @param {string} text - The content to save.
 * @param {string} filetype - The file type (default: 'bml').
 */
function saveText(filename, text, filetype = 'bml') {
    logDebug("Saving file:", filename);
    const mimeType = filetype === 'xsl' ? 'application/xml' : 'text/plain';
    const tempElem = document.createElement('a');
    tempElem.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(text)}`);
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

// Event Listeners for Buttons
document.getElementById('unload').addEventListener('click', () => {
    logDebug("Unload button clicked.");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unload' }, function (response) {
            if (chrome.runtime.lastError) {
                logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
            } else if (response.code && response.filename) {
                if (response.foldername !== undefined) {
                    bmSiteType = response.foldername;
                }
                logDebug("Received unload response, bmsiteType", bmSiteType);
                logDebug("Received unload response, saving folder", response.foldername);
                logDebug("Received unload response, saving file:", response.filename);
                saveText(response.filename + '.' + bmFileType, response.code, bmFileType);
            }
        });
    });
});

document.getElementById('load').addEventListener('click', async () => {
    logDebug("Load button clicked.");
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    logDebug("File loaded:", file.name);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { greeting: 'load', code: contents },
            function (response) {
                if (chrome.runtime.lastError) {
                    logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                } else {
                    logDebug("Load response received:", response);
                }
            }
        );
    });
});

// UNLOAD TEST ONCLICK
document.getElementById('unloadTest').addEventListener('click', () => {
    logDebug("Unload Test button clicked.");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: 'unloadTest' }, function (response) {
            if (chrome.runtime.lastError) {
                logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
            } else if (response.testCode && response.filename) {
                logDebug("Received unloadTest response, saving file:", response.filename);
                saveText(response.filename + '.test.' + bmFileType, response.testCode, bmFileType);
            }
        });
    });
});

// LOAD TEST ONCLICK
document.getElementById('loadTest').addEventListener('click', async () => {
    logDebug("Load Test button clicked.");
    const [fileHandle2] = await window.showOpenFilePicker();
    const file = await fileHandle2.getFile();
    const contents = await file.text();
    logDebug("Test file loaded:", file.name);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { greeting: 'loadTest', code: contents },
            function (response) {
                if (chrome.runtime.lastError) {
                    logDebug("Error sending message to content script:", chrome.runtime.lastError.message);
                } else {
                    logDebug("Load Test response received:", response);
                }
            }
        );
    });
});

// Initialize Extension
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    if (url) {
        logDebug("Active tab URL:", url);
        analyzeUrl(url);
    }
});

logDebug("Extension initialized.");

// FOOTER INFORMATION
const manifest = chrome.runtime.getManifest();

document.addEventListener('DOMContentLoaded', () => {
    logDebug("DOM fully loaded, setting footer information.");
    document.getElementById('footer').innerHTML = getFooter();
});

function getFooter() {
    return '<p>' + manifest.name + ' v' + manifest.version + '</p>';
}
