# Playwright Migration Guide

This document outlines the migration from Puppeteer to Playwright for Streamline Tools testing.

## Overview

We have migrated from Puppeteer to Playwright to take advantage of:

1. **Better GitHub Copilot Integration** - Playwright has enhanced support for GitHub Copilot's coding agent
2. **Improved Reliability** - More stable browser automation and better waiting strategies
3. **Enhanced Debugging** - Better debugging tools and error reporting
4. **Modern API** - More intuitive and powerful testing API
5. **Future-Proofing** - Playwright is actively developed with regular updates

## Migration Status

### Completed ✅
- **Core Infrastructure**: Playwright configuration, test helpers, and setup files
- **Extension Tests**: Chrome extension loading, options page, popup functionality
- **Login Tests**: Authentication, form validation, error handling
- **Interface Tests**: REST/SOAP interface navigation and operations
- **Stylesheet Tests**: CSS editor functionality, validation, and workflows

### Test Files Converted (4/22)
- `extension.test.js` - Extension functionality tests
- `login.test.js` - Authentication and login tests
- `interfaces.test.js` - Interface catalog tests
- `stylesheet.test.js` - CSS editor tests

### Remaining Files (18/22)
- `commerceActions.test.js`
- `commerceRules.test.js`
- `configurationRules.test.js`
- `documentDesigner.test.js`
- `header-footer-basic.test.js`
- `headerFooter.test.js`
- `iteration.test.js`
- `loginToHeaderAndFooter.test.js`
- `rule-navigation.test.js`
- `ruleMatching.test.js`
- `rules-validation.test.js`
- `rulesList-master.test.js`
- `rulesList-sample.test.js`
- `streamline-unload-load.test.js`
- `stylesheets.test.js`
- `unload-load-workflow.test.js`
- `utilityLibrary.test.js`
- `variable-reference-fix.test.js`

## Running Tests

### Playwright Tests
```bash
# Run all Playwright tests
npm run test:playwright

# Run in headed mode (with browser UI)
npm run test:playwright:headed

# Run with debugging
npm run test:playwright:debug

# Run specific test files
npm run test:quick:playwright

# Run interface tests
npm run test:interfaces:playwright

# Run stylesheet tests
npm run test:stylesheets:playwright
```

### Legacy Puppeteer Tests (Still Available)
```bash
# Run all Puppeteer tests
npm run test:puppeteer

# Run specific test categories
npm run test:commerce
npm run test:interfaces
npm run test:stylesheets
```

## Key Differences

### Test Structure
**Puppeteer:**
```javascript
describe('Test Suite', () => {
    test('test case', async () => {
        // test code
    });
});
```

**Playwright:**
```javascript
const { test, expect } = require('@playwright/test');

test.describe('Test Suite', () => {
    test('test case', async ({ page, context }) => {
        // test code
    });
});
```

### Helper Initialization
**Puppeteer:**
```javascript
helper = new TestHelper();
await helper.init();
```

**Playwright:**
```javascript
helper = new TestHelper();
await helper.init(page, context);
```

### Page Navigation
**Puppeteer:**
```javascript
await helper.page.goto(url);
```

**Playwright:**
```javascript
await helper.navigateToUrl(url);
```

### Element Interaction
**Puppeteer:**
```javascript
await helper.page.waitForSelector('#element');
await helper.page.click('#element');
```

**Playwright:**
```javascript
const element = helper.page.locator('#element');
await element.click();
```

## Configuration Files

### Playwright Configuration
- `playwright.config.js` - Main Playwright configuration
- `tests/playwright/global-setup.js` - Global test setup
- `tests/playwright/global-teardown.js` - Global test cleanup
- `tests/playwright/helpers.js` - Playwright test helper class

### Jest Configuration
Updated `jest.config.js` includes both Puppeteer and Playwright projects for backward compatibility.

## Test Conversion

### Automatic Conversion
```bash
# See conversion status
npm run test:convert

# Auto-convert remaining files (requires manual review)
npm run test:convert:all
```

### Manual Conversion Guidelines

1. **Update imports**: Add Playwright test imports
2. **Update test structure**: Use `test.describe` and `test()`
3. **Update helper initialization**: Pass page and context to helper
4. **Update page actions**: Use Playwright locator API
5. **Add environment checks**: Skip tests when variables missing
6. **Update assertions**: Use Playwright expect API

## Environment Variables

Tests require these environment variables:
- `CPQ_USERNAME` - CPQ login username
- `CPQ_PASSWORD` - CPQ login password  
- `BASE_URL` - CPQ instance URL
- `BYPASS_LOGIN=true` - Skip login tests (optional)
- `HEADLESS=false` - Run in headed mode (optional)
- `DEBUG_TESTS=true` - Enable debug logging (optional)

## Chrome Extension Testing

Both Puppeteer and Playwright tests support Chrome extension testing with:
- Extension loading from `src/` directory
- Extension ID detection
- Popup page navigation
- Options page testing
- File system API mocking

## Debugging

### Playwright Debug Features
- Visual debugging with `--debug` flag
- Automatic screenshots on failure
- Video recording on failure
- HTML reports with timeline
- Browser devtools integration

### Common Issues

1. **Extension ID not found**: Ensure extension loads properly in browser
2. **Login failures**: Check environment variables and network connectivity
3. **Element not found**: Update selectors for Playwright locator API
4. **Timeout errors**: Adjust timeouts in playwright.config.js

## Next Steps

1. **Complete remaining conversions**: Convert all 18 remaining test files
2. **Validate test coverage**: Ensure all functionality is tested
3. **Update CI/CD**: Configure GitHub Actions for Playwright
4. **Remove Puppeteer dependencies**: Clean up after full migration
5. **Documentation updates**: Update README and testing docs

## Benefits Realized

- ✅ **GitHub Copilot Integration**: Better coding assistance
- ✅ **Improved Test Reliability**: More stable browser automation
- ✅ **Better Debugging**: Enhanced error reporting and debugging tools
- ✅ **Modern API**: More intuitive testing patterns
- ✅ **Future-Proof**: Active development and community support