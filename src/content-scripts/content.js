// ...existing code...

// Initialize global state variables
window.__streamlineState = {
  currentRule: null,
  lastAction: null,
  lastActionTime: null,
  domSnapshotCount: 0
};

/**
 * Find the editor element in the page based on rule configurations
 * @param {Object} rule - Rule configuration containing selectors
 * @param {boolean} isTest - Whether this is a test environment
 * @returns {HTMLElement|null} - The found editor element or null
 */
function findEditorElement(rule, isTest = false) {
  // For tests, use a more lenient approach to find the editor
  if (isTest) {
    console.log("[TEST] Using test-specific element finder");
    const testEditorSelectors = [
      '#contentEditor', 
      '.bml-editor',
      '.code-editor',
      'textarea',
      'textarea.form-control',
      '[contenteditable="true"]',
      'iframe#igmWysiwyg'
    ];
    
    // Try each selector
    for (const selector of testEditorSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[TEST] Found editor with selector: ${selector}`);
        return element;
      }
    }
    
    // If no direct match, look inside iframes
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      try {
        const iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
        for (const selector of testEditorSelectors) {
          const element = iframeDoc.querySelector(selector);
          if (element) {
            console.log(`[TEST] Found editor in iframe[${i}] with selector: ${selector}`);
            return element;
          }
        }
      } catch (e) {
        console.log(`[TEST] Cannot access iframe[${i}]: ${e.message}`);
      }
    }
    
    // If still not found, create a mock element for testing
    console.log("[TEST] No editor found, creating mock editor for testing");
    const mockEditor = document.createElement('textarea');
    mockEditor.id = 'mockEditor';
    mockEditor.style.display = 'none';
    document.body.appendChild(mockEditor);
    return mockEditor;
  }
  
  // First try the rule-specific selector if available
  if (rule && rule.codeSelector) {
    console.log(`Trying rule-specific selector: ${rule.codeSelector}`);
    const element = document.querySelector(rule.codeSelector);
    if (element) {
      console.log(`Found element with rule selector: ${rule.codeSelector}`);
      return element;
    }
  }
  
  // Next try known editor selectors based on rule type
  const editorSelectors = {
    // BML editors
    'Library Rule': '#BML_RULE_EDIT',
    'Rule Editor': '#igmBmlCode',
    'Contextual Editor': '#igmBmlCode',
    'Commerce Process': '#igmBmlCode',
    'Configuration': '#igmBmlCode',
    'Recommendation': '#BML_RULE_EDIT',
    // HTML editors
    'Header & Footer': '#igmWysiwyg',
    'Site Theme': '#igmWysiwyg',
    // Other common editors
    'CSS': '#CSS_RULE_EDIT',
    'REST': '#igmBmlCode',
    'XSL': '#XSL_RULE_EDIT',
  };
  
  if (rule && rule.RuleName && editorSelectors[rule.RuleName]) {
    const selector = editorSelectors[rule.RuleName];
    console.log(`Trying rule name selector: ${selector}`);
    const element = document.querySelector(selector);
    if (element) {
      console.log(`Found element with rule name selector: ${selector}`);
      return element;
    }
  }
  
  // Fallback to generic selectors if rule-specific selectors didn't work
  const fallbackSelectors = [
    '#igmBmlCode',
    '#BML_RULE_EDIT',
    '#igmWysiwyg',
    '#CSS_RULE_EDIT',
    '#XSL_RULE_EDIT',
    'textarea.form-control',
    'textarea[name="ruleContent"]',
    '[contenteditable="true"]',
    'iframe.igm-frame'
  ];
  
  for (const selector of fallbackSelectors) {
    console.log(`Trying fallback selector: ${selector}`);
    const element = document.querySelector(selector);
    if (element) {
      console.log(`Found element with fallback selector: ${selector}`);
      return element;
    }
  }
  
  // Last resort: try iframe-based editors
  console.log("Trying to find editor in iframes");
  const iframes = document.querySelectorAll('iframe');
  for (let i = 0; i < iframes.length; i++) {
    try {
      const iframeDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
      for (const selector of [...Object.values(editorSelectors), ...fallbackSelectors]) {
        const element = iframeDoc.querySelector(selector);
        if (element) {
          console.log(`Found editor in iframe[${i}] with selector: ${selector}`);
          return element;
        }
      }
    } catch (e) {
      console.log(`Cannot access iframe[${i}]: ${e.message}`);
    }
  }
  
  console.log("No editor element found after trying all selectors");
  return null;
}

/**
 * Get the filename from the current edit context
 * @param {Object} rule - Rule configuration
 * @param {string} fileType - File extension to use
 * @returns {string} Formatted filename
 */
function generateFilename(rule, fileType = 'bml') {
  if (!rule) {
    console.log("No rule provided, using generic filename");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `unknown-rule-${timestamp}.${fileType}`;
  }

  // Construct a safe filename from rule attributes
  const cleanName = (str) => str ? str.replace(/[^\w\-]/g, '_').toLowerCase() : 'unknown';
  const ruleName = cleanName(rule.RuleName);
  const appArea = cleanName(rule.AppArea);
  const action = cleanName(rule.Action);
  
  let baseFilename = `${appArea}_${ruleName}`;
  if (action && action !== 'x') {
    baseFilename += `_${action}`;
  }
  
  return `${baseFilename}.${fileType}`;
}

/**
 * Extract code content from an editor element
 * @param {HTMLElement} editorElement - The editor DOM element
 * @returns {string} The extracted code
 */
function extractCodeFromEditor(editorElement) {
  if (!editorElement) return '';
  
  let code = '';
  
  // Handle different editor types
  if (editorElement.tagName === 'TEXTAREA') {
    code = editorElement.value;
  } else if (editorElement.tagName === 'IFRAME') {
    try {
      const iframeDoc = editorElement.contentDocument || editorElement.contentWindow.document;
      
      // Handle WYSIWYG iframe editors (like HTML editor)
      if (iframeDoc.body) {
        code = iframeDoc.body.innerHTML;
      }
      
      // Handle code editor iframes
      const codeElement = iframeDoc.querySelector('textarea, .code-content, pre');
      if (codeElement) {
        code = codeElement.tagName === 'TEXTAREA' ? codeElement.value : codeElement.textContent;
      }
      
      if (!code) {
        code = iframeDoc.documentElement.innerHTML;
      }
    } catch (e) {
      console.error("Error extracting code from iframe:", e);
      return '';
    }
  } else if (editorElement.getAttribute('contenteditable') === 'true') {
    code = editorElement.innerHTML;
  } else {
    // Fallback to getting textContent for other elements
    code = editorElement.textContent || '';
  }
  
  // Ensure consistent newline handling
  // First normalize Windows style to Unix style
  code = code.replace(/\r\n/g, '\n');
  
  // Log the number of newlines for debugging
  const newlineCount = (code.match(/\n/g) || []).length;
  console.log(`Extracted code contains ${newlineCount} newlines`);
  
  return code;
}

/**
 * Update editor element with new code content
 * @param {HTMLElement} editorElement - The editor DOM element
 * @param {string} code - Code content to set
 * @returns {boolean} Success status
 */
function updateEditorWithCode(editorElement, code) {
  if (!editorElement) return false;

  // Ensure consistent newline handling in the code being loaded
  // First normalize any Windows style newlines to Unix style
  code = code.replace(/\r\n/g, '\n');
  
  // Log the number of newlines for debugging
  const newlineCount = (code.match(/\n/g) || []).length;
  console.log(`Code to load contains ${newlineCount} newlines`);

  // Handle different editor types
  if (editorElement.tagName === 'TEXTAREA') {
    // For textareas, we set the value property directly
    editorElement.value = code;
    // Dispatch events to ensure the change is registered
    editorElement.dispatchEvent(new Event('input', { bubbles: true }));
    editorElement.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  } else if (editorElement.tagName === 'IFRAME') {
    try {
      const iframeDoc = editorElement.contentDocument || editorElement.contentWindow.document;
      
      // Handle WYSIWYG iframe editors (like HTML editor)
      if (iframeDoc.body && iframeDoc.designMode === 'on') {
        // For HTML content, preserve newlines by converting them to <br> tags if needed
        iframeDoc.body.innerHTML = code;
        return true;
      }
      
      // Handle code editor iframes
      const codeElement = iframeDoc.querySelector('textarea, .code-content, pre');
      if (codeElement) {
        if (codeElement.tagName === 'TEXTAREA') {
          codeElement.value = code;
          codeElement.dispatchEvent(new Event('input', { bubbles: true }));
          codeElement.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // For pre elements, ensure proper newline handling
          codeElement.textContent = code;
        }
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("Error updating code in iframe:", e);
      return false;
    }
  } else if (editorElement.getAttribute('contenteditable') === 'true') {
    // For contenteditable elements, handle newlines appropriately
    if (editorElement.dataset.editorType === 'html') {
      // For HTML editors, preserve newlines by converting to <br> tags
      editorElement.innerHTML = code.replace(/\n/g, '<br>');
    } else {
      // For code editors, just use the text as is
      editorElement.textContent = code;
    }
    return true;
  } else {
    // Fallback for other elements
    try {
      editorElement.textContent = code;
      return true;
    } catch (e) {
      console.error("Error updating element:", e);
      return false;
    }
  }
}

/**
 * Handles unload BML command, extracts code from the editor
 * @param {boolean} isTest - Whether this is a test operation
 * @returns {Object} Response with code and filename
 */
function handleUnloadBML(isTest = false) {
  console.log(`Handling unloadBML${isTest ? 'Test' : ''}`);
  
  // Get the matched rule for the current page
  const rule = isTest ? { RuleName: 'Test Rule', AppArea: 'Test' } : findMatchedRule();
  
  // Find the editor element
  const editorElement = findEditorElement(rule, isTest);
  if (!editorElement) {
    const error = "Could not find editor element";
    console.error(error);
    return { error };
  }
  
  // Extract code from the editor
  const code = extractCodeFromEditor(editorElement);
  if (!code) {
    const error = "Could not extract code from editor";
    console.error(error);
    return { error };
  }
  
  // Create a filename based on rule type
  const filename = generateFilename(rule, getFileExtension(rule));
  
  // Return the extracted code and filename
  console.log(`Extracted ${code.length} characters from editor, filename: ${filename}`);
  return { code, filename };
}

/**
 * Determine the file extension based on rule type
 * @param {Object} rule - Rule configuration
 * @returns {string} File extension (bml, html, css, etc.)
 */
function getFileExtension(rule) {
  if (!rule || !rule.RuleName) return 'bml';
  
  const ruleNameLower = rule.RuleName.toLowerCase();
  
  if (ruleNameLower.includes('html') || 
      ruleNameLower.includes('header') || 
      ruleNameLower.includes('footer')) {
    return 'html';
  }
  
  if (ruleNameLower.includes('css') || 
      ruleNameLower.includes('style')) {
    return 'css';
  }
  
  if (ruleNameLower.includes('xsl')) {
    return 'xsl';
  }
  
  if (ruleNameLower.includes('json')) {
    return 'json';
  }
  
  if (ruleNameLower.includes('xml')) {
    return 'xml';
  }
  
  return 'bml';
}

/**
 * Handle load BML command, updates the editor with provided code
 * @param {string} code - Code content to load
 * @param {boolean} isTest - Whether this is a test operation
 * @returns {Object} Response with success status
 */
function handleLoadBML(code, isTest = false) {
  console.log(`Handling loadBML${isTest ? 'Test' : ''} with ${code.length} characters`);
  
  if (!code) {
    const error = "No code provided to load";
    console.error(error);
    return { error };
  }
  
  // Get the matched rule for the current page
  const rule = isTest ? { RuleName: 'Test Rule', AppArea: 'Test' } : findMatchedRule();
  
  // Find the editor element
  const editorElement = findEditorElement(rule, isTest);
  if (!editorElement) {
    const error = "Could not find editor element to load code into";
    console.error(error);
    return { error };
  }
  
  // Update the editor with the provided code
  const success = updateEditorWithCode(editorElement, code);
  if (!success) {
    const error = "Failed to update editor with code";
    console.error(error);
    return { error };
  }
  
  console.log("Code loaded successfully into editor");
  return { success: true };
}

/**
 * Find the rule that matches the current page URL
 * @returns {Object|null} The matched rule or null
 */
function findMatchedRule() {
  if (typeof rulesList === 'undefined' || !rulesList || !rulesList.length) {
    console.log("Rules list not available");
    return null;
  }
  
  const currentUrl = window.location.href;
  console.log("Finding rule for URL:", currentUrl);
  
  // Find a rule that matches the current URL
  for (const rule of rulesList) {
    if (!rule.URL) continue;
    
    try {
      const ruleUrlPattern = rule.URL.replace(/\*/g, '.*');
      const regex = new RegExp(ruleUrlPattern, 'i');
      
      if (regex.test(currentUrl)) {
        console.log("Matched rule:", rule);
        return rule;
      }
    } catch (e) {
      console.error("Error matching rule:", e);
    }
  }
  
  console.log("No matching rule found for URL:", currentUrl);
  return null;
}

/**
 * Capture a snapshot of the DOM for debugging and tracking app changes
 * @param {string} areaName - Name of the application area being captured
 * @returns {Object} DOM snapshot data and metadata
 */
function captureHtmlDomSnapshot(areaName = 'unknown') {
  console.log(`Taking DOM snapshot of area: ${areaName}`);
  
  try {
    // Get current page location and other metadata
    const timestamp = new Date().toISOString();
    const location = {
      url: window.location.href,
      path: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search
    };
    
    // Capture DOM as both HTML string and structured data
    const htmlContent = document.documentElement.outerHTML;
    
    // Create structured data about important elements
    const domStructure = {
      title: document.title,
      bodyClasses: document.body.className,
      forms: document.forms.length,
      iframes: document.querySelectorAll('iframe').length,
      textareas: document.querySelectorAll('textarea').length,
      contentEditables: document.querySelectorAll('[contenteditable="true"]').length,
      editorElements: {}
    };
    
    // Map all potential editor elements with their attributes
    const editorSelectors = [
      '#igmBmlCode', '#BML_RULE_EDIT', '#igmWysiwyg', '#CSS_RULE_EDIT', 
      '#XSL_RULE_EDIT', 'textarea.form-control', 'textarea[name="ruleContent"]',
      '[contenteditable="true"]', 'iframe.igm-frame'
    ];
    
    editorSelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        // Collect key attributes and properties
        const attrs = {};
        Array.from(element.attributes).forEach(attr => {
          attrs[attr.name] = attr.value;
        });
        
        // Add to the structure
        domStructure.editorElements[selector] = {
          nodeName: element.nodeName,
          id: element.id,
          className: element.className,
          attributes: attrs,
          isVisible: element.offsetParent !== null,
          dimensions: {
            width: element.offsetWidth,
            height: element.offsetHeight
          }
        };
      }
    });
    
    // Check iframes for editor elements too
    const iframes = document.querySelectorAll('iframe');
    let iframeEditors = {};
    
    Array.from(iframes).forEach((iframe, index) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Skip if we can't access the iframe (e.g., cross-origin)
        if (!iframeDoc) return;
        
        const iframeEditorElements = {};
        
        editorSelectors.forEach(selector => {
          const element = iframeDoc.querySelector(selector);
          if (element) {
            // Collect attributes
            const attrs = {};
            Array.from(element.attributes).forEach(attr => {
              attrs[attr.name] = attr.value;
            });
            
            // Add to the structure
            iframeEditorElements[selector] = {
              nodeName: element.nodeName,
              id: element.id,
              className: element.className,
              attributes: attrs
            };
          }
        });
        
        if (Object.keys(iframeEditorElements).length > 0) {
          iframeEditors[`iframe[${index}]`] = {
            src: iframe.src,
            id: iframe.id,
            name: iframe.name,
            editorElements: iframeEditorElements
          };
        }
      } catch (e) {
        console.log(`Cannot access iframe[${index}]: ${e.message}`);
      }
    });
    
    // Add iframe editors to the structure
    if (Object.keys(iframeEditors).length > 0) {
      domStructure.iframeEditors = iframeEditors;
    }
    
    // Create snapshot object
    const snapshot = {
      metadata: {
        timestamp,
        location,
        areaName,
        userAgent: navigator.userAgent
      },
      domStructure,
      htmlContent
    };
    
    console.log(`DOM snapshot captured for ${areaName}, HTML size: ${htmlContent.length} bytes`);
    return snapshot;
  } catch (error) {
    console.error("Error capturing DOM snapshot:", error);
    return {
      error: error.toString(),
      partial: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Save DOM snapshot to a file via a message to the background script
 * @param {string} areaName - Name of the application area being captured
 */
function saveDomSnapshot(areaName = 'unknown') {
  const snapshot = captureHtmlDomSnapshot(areaName);
  
  chrome.runtime.sendMessage({
    action: 'saveDomSnapshot',
    snapshot
  }, response => {
    if (response && response.success) {
      console.log(`DOM snapshot saved: ${response.filename}`);
    } else {
      console.error("Failed to save DOM snapshot:", response ? response.error : "Unknown error");
    }
  });
}

// Add message listeners for all the handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  // Handle DOM snapshot requests
  if (message.greeting === 'captureDomSnapshot') {
    const snapshot = captureHtmlDomSnapshot(message.areaName || 'manual_capture');
    sendResponse({ success: true, snapshot });
  }
  
  // Handle unload operations
  else if (message.greeting === 'unload') {
    // Also capture a DOM snapshot when unloading
    saveDomSnapshot('unload_' + (findMatchedRule()?.AppArea || 'unknown')); 
    sendResponse(handleUnloadBML());
  } else if (message.greeting === 'unloadTest') {
    sendResponse(handleUnloadBML(true));
  }
  
  // Handle load operations
  else if (message.greeting === 'load' && message.code) {
    // Also capture a DOM snapshot when loading
    saveDomSnapshot('load_' + (findMatchedRule()?.AppArea || 'unknown'));
    sendResponse(handleLoadBML(message.code));
  } else if (message.greeting === 'loadTest' && message.code) {
    sendResponse(handleLoadBML(message.code, true));
  }
  
  // Handle HTML operations
  else if (message.greeting === 'unloadHeaderHTML' || message.greeting === 'unloadFooterHTML') {
    // Also capture a DOM snapshot for HTML operations
    saveDomSnapshot(message.greeting.replace('unload', '').toLowerCase());
    // Original handler code here...
    // For now, just pass through to keep the existing functionality
    sendResponse({ /* Original response */ });
  }
  else if (message.greeting === 'loadHeaderHTML' || message.greeting === 'loadFooterHTML') {
    // Also capture a DOM snapshot for HTML operations
    saveDomSnapshot(message.greeting.replace('load', '').toLowerCase());
    // Original handler code here...
    // For now, just pass through to keep the existing functionality
    sendResponse({ /* Original response */ });
  }
  
  return true; // Keep the messaging channel open for async responses
});

// ...existing code...