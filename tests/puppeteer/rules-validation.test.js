const { TestHelper } = require('./helpers');
const RulesValidator = require('./rulesValidator');
const { bypassLogin, setupVideoRecording } = require('./videoHelper');
const rulesList = require('../../src/rulesList.json');
const path = require('path');

describe('Rules List DOM Validation', () => {
  let helper;
  let validator;

  beforeAll(async () => {
    console.log("Setting up Rules Validation Tests...");
    helper = new TestHelper();
    
    // Always bypass login for rule validation tests
    bypassLogin(helper);
    await helper.init();
    
    // Create validator with rules list
    validator = new RulesValidator(helper, rulesList);
    
    console.log("Test setup complete");
  }, 60000);

  afterAll(async () => {
    await helper.cleanup();
  });

  beforeEach(async () => {
    // Set test timeout
    jest.setTimeout(30000);
  });

  test('should verify all rule definitions are valid', async () => {
    // Just validate rule definitions without DOM testing
    const results = await validator.validateAllRules(false);
    
    // Log validation summary
    console.log('\nRule Definition Validation Summary:');
    console.log(`Total rules: ${results.totalRules}`);
    console.log(`Valid rules: ${results.validRules}`);
    console.log(`Invalid rules: ${results.invalidRules}`);
    
    // If any invalid rules, log them
    if (results.invalidRules > 0) {
      console.log('\nInvalid rules:');
      results.details
        .filter(detail => !detail.definitionValid)
        .forEach(detail => {
          console.log(`- ${detail.rule}: ${detail.errors.join(', ')}`);
        });
    }
    
    // Generate report file
    const reportPath = await validator.generateReport(results);
    console.log(`\nDetailed validation report written to: ${reportPath}`);
    
    // Check that all rules are valid
    expect(results.invalidRules).toBe(0);
    expect(results.validRules).toBe(results.totalRules);
  });

  // Only run this test if specifically enabled by env var
  (process.env.TEST_RULE_DOM_INTERACTION === 'true' ? test : test.skip)(
    'should verify DOM interaction for all rules', 
    async () => {
      // Run DOM testing for all rules
      const results = await validator.validateAllRules(true);
      
      // Log validation summary
      console.log('\nDOM Interaction Testing Summary:');
      console.log(`Total rules tested: ${results.domTestedRules}`);
      console.log(`Passed DOM tests: ${results.domPassedRules}`);
      console.log(`Failed DOM tests: ${results.domFailedRules}`);
      
      // If any failed tests, log them
      if (results.domFailedRules > 0) {
        console.log('\nFailed DOM interaction tests:');
        results.details
          .filter(detail => detail.domTested && !detail.domPassed)
          .forEach(detail => {
            console.log(`- ${detail.rule}`);
            if (detail.domResults) {
              const { buttons, selectors } = detail.domResults;
              console.log(`  Unload button: ${buttons.unloadButton ? '✓' : '✗'}`);
              console.log(`  Load button: ${buttons.loadButton ? '✓' : '✗'}`);
              console.log(`  Code selector: ${selectors.codeSelector ? '✓' : '✗'}`);
              console.log(`  File name selector: ${selectors.fileNameSelector ? '✓' : '✗'}`);
            }
          });
      }
      
      // Generate report file
      const reportPath = await validator.generateReport(results);
      console.log(`\nDetailed DOM interaction report written to: ${reportPath}`);
      
      // Check that at least 80% of rules pass DOM tests
      const passRatio = results.domPassedRules / results.domTestedRules;
      expect(passRatio).toBeGreaterThanOrEqual(0.8);
    },
    120000 // 2 minute timeout
  );
  
  // Test individual rule types grouped by AppArea
  const appAreas = [...new Set(rulesList.map(rule => rule.AppArea))];
  
  appAreas.forEach(area => {
    const areaRules = rulesList.filter(rule => rule.AppArea === area);
    
    describe(`${area} Rules`, () => {
      areaRules.forEach(rule => {
        test(`should validate ${area} - ${rule.RuleName} rule DOM structure`, async () => {
          // Set up video recording for this specific test
          await setupVideoRecording(helper, `${area}_${rule.RuleName}`);
          
          // Test DOM interaction for just this rule
          const domResults = await validator.verifyRuleDOMInteraction(rule);
          
          // Take screenshot
          const screenshotPath = path.join(__dirname, `rule-${area}-${rule.RuleName}-result.png`);
          await helper.page.screenshot({ path: screenshotPath, fullPage: true });
          
          // Verify buttons exist
          expect(domResults.buttons.unloadButton).toBe(true);
          expect(domResults.buttons.loadButton).toBe(true);
          
          // Verify code selector works
          expect(domResults.selectors.codeSelector).toBe(true);
          
          // If rule has a filename selector, verify it
          if (rule.fileNameSelector) {
            expect(domResults.selectors.fileNameSelector).toBe(true);
          }
          
          // Log success
          console.log(`✓ ${area} - ${rule.RuleName} DOM structure validated successfully`);
        }, 30000);
      });
    });
  });
});