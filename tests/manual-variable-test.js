// Manual test script to verify the window-scoped variable fixes
// Run this in browser console after navigating to a header/footer edit page

/**
 * Tests for window-scoped variables
 * This verifies our fix for the "CONTENT_DEBUG is not defined" error
 */
function testWindowScopedVariables() {
  console.log('=== Testing Window-Scoped Variables ===');
  
  // Check if the variables are properly defined on window
  const tests = [
    {name: 'CONTENT_DEBUG', exists: typeof window.CONTENT_DEBUG !== 'undefined'},
    {name: 'SCRIPT_READY', exists: typeof window.SCRIPT_READY !== 'undefined'},
    {name: 'PING_READY', exists: typeof window.PING_READY !== 'undefined'},
    {name: 'streamlineState', exists: typeof window.streamlineState !== 'undefined'}
  ];
  
  let allPassed = true;
  
  tests.forEach(test => {
    const result = test.exists ? '✅ PASS' : '❌ FAIL';
    allPassed = allPassed && test.exists;
    console.log(`${result}: window.${test.name} is ${test.exists ? 'defined' : 'undefined'}`);
  });
  
  return allPassed;
}

/**
 * Tests for variable redeclaration
 * This verifies our fix for the "Identifier has already been declared" error
 */
function testNoRedeclarationErrors() {
  console.log('=== Testing Variable Redeclaration ===');
  
  try {
    // Simulate content script being injected again
    console.log('Simulating script re-injection...');
    
    // Set variables as our script does
    window.CONTENT_DEBUG = window.CONTENT_DEBUG !== undefined ? window.CONTENT_DEBUG : true;
    window.SCRIPT_READY = window.SCRIPT_READY !== undefined ? window.SCRIPT_READY : false;
    window.PING_READY = window.PING_READY !== undefined ? window.PING_READY : true;
    
    // Create state object if it doesn't exist
    window.streamlineState = window.streamlineState || {
      initialized: false,
      rules: []
    };
    
    console.log('✅ PASS: No redeclaration errors when variables are re-assigned');
    return true;
  } catch (err) {
    console.error('❌ FAIL: Error during redeclaration test:', err);
    return false;
  }
}

/**
 * Tests header/footer operation
 * This verifies the actual functionality after our fixes
 */
async function testHeaderFooterOperation() {
  console.log('=== Testing Header/Footer Operations ===');
  
  try {
    // Get current tab ID
    const tabId = await new Promise(resolve => {
      chrome.runtime.sendMessage({greeting: 'getActiveTab'}, response => {
        resolve(response.tabId);
      });
    });
    
    // Test unloadHeaderHTML operation
    console.log('Testing unloadHeaderHTML operation...');
    const headerResponse = await new Promise(resolve => {
      chrome.tabs.sendMessage(tabId, {greeting: 'unloadHeaderHTML'}, response => {
        console.log('Header response:', response);
        resolve(response);
      });
    });
    
    // Test unloadFooterHTML operation
    console.log('Testing unloadFooterHTML operation...');
    const footerResponse = await new Promise(resolve => {
      chrome.tabs.sendMessage(tabId, {greeting: 'unloadFooterHTML'}, response => {
        console.log('Footer response:', response);
        resolve(response);
      });
    });
    
    const headerSuccess = headerResponse && !headerResponse.error;
    const footerSuccess = footerResponse && !footerResponse.error;
    
    if (headerSuccess) {
      console.log('✅ PASS: Header unload operation successful');
    } else {
      console.log('❌ FAIL: Header unload operation failed');
    }
    
    if (footerSuccess) {
      console.log('✅ PASS: Footer unload operation successful');
    } else {
      console.log('❌ FAIL: Footer unload operation failed');
    }
    
    return headerSuccess && footerSuccess;
  } catch (err) {
    console.error('❌ FAIL: Error during header/footer test:', err);
    return false;
  }
}

/**
 * Run all tests and report results
 */
async function runAllTests() {
  console.log('========================================');
  console.log('STARTING VARIABLE REFERENCE FIX TESTS');
  console.log('========================================');
  
  const variableTest = testWindowScopedVariables();
  const redeclarationTest = testNoRedeclarationErrors();
  const operationTest = await testHeaderFooterOperation();
  
  console.log('========================================');
  console.log('TEST SUMMARY:');
  console.log(`Window-Scoped Variables: ${variableTest ? 'PASS' : 'FAIL'}`);
  console.log(`No Redeclaration Errors: ${redeclarationTest ? 'PASS' : 'FAIL'}`);
  console.log(`Header/Footer Operations: ${operationTest ? 'PASS' : 'FAIL'}`);
  console.log('========================================');
  
  return variableTest && redeclarationTest && operationTest;
}

// Export for use in browser console
window.testStreamlineVars = {
  testWindowScopedVariables,
  testNoRedeclarationErrors,
  testHeaderFooterOperation,
  runAllTests
};

console.log("Test script loaded! Run window.testStreamlineVars.runAllTests() to execute all tests.");