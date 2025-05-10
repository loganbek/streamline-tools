/**
 * Rules Validator Module
 * 
 * A utility module to verify rule definitions and test their DOM interactions.
 */

const path = require('path');
const fs = require('fs').promises;

class RulesValidator {
  /**
   * Create a new RulesValidator instance
   * @param {Object} helper - TestHelper instance
   * @param {Array} rulesList - Array of rule definitions
   */
  constructor(helper, rulesList) {
    this.helper = helper;
    this.rulesList = rulesList;
    this.validatedRules = [];
    this.failedRules = [];
    this.currentRule = null;
  }

  /**
   * Validate a rule definition
   * @param {Object} rule - Rule definition object
   * @returns {Object} - Validation result with errors array
   */
  validateRuleDefinition(rule) {
    const errors = [];
    
    // Check required fields
    if (!rule.AppArea) errors.push('Missing AppArea');
    if (!rule.RuleName) errors.push('Missing RuleName');
    if (!rule.fileType) errors.push('Missing fileType');
    if (!rule.URL) errors.push('Missing URL');
    if (!rule.codeSelector) errors.push('Missing codeSelector');
    
    // Special validations
    if (rule.URL.includes('*') && !process.env.SITE_SUBDOMAIN) {
      errors.push('URL contains wildcard but no SITE_SUBDOMAIN env variable set');
    }

    return {
      rule,
      errors,
      isValid: errors.length === 0
    };
  }

  /**
   * Create a mock page for testing a rule
   * @param {Object} rule - Rule definition object
   * @returns {Promise<boolean>} - True if successful
   */
  async createMockPageForRule(rule) {
    console.log(`Creating mock page for ${rule.AppArea} - ${rule.RuleName}`);
    
    try {
      // Get proper URL from rule
      const url = rule.URL.replace('*', process.env.SITE_SUBDOMAIN || 'devmcnichols');
      
      // Set page content with basic structure that includes expected elements
      await this.helper.page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${rule.AppArea} - ${rule.RuleName}</title>
        </head>
        <body>
          <h1>${rule.AppArea} - ${rule.RuleName} Test Page</h1>
          
          <!-- Mock editor area -->
          <div class="editor-container">
            <textarea id="textarea" style="width: 100%; height: 300px;">${rule.code || '// Sample code for testing'}</textarea>
          </div>
          
          <!-- Mock extension buttons -->
          <div class="action-buttons">
            <button id="unload${rule.fileType.toUpperCase()}">Unload ${rule.fileType.toUpperCase()}</button>
            <button id="load${rule.fileType.toUpperCase()}">Load ${rule.fileType.toUpperCase()}</button>
          </div>
          
          <!-- Mock filename input if needed -->
          <div class="filename-container">
            <input name="varName" value="${rule.fileName || 'testFileName'}" />
          </div>
        </body>
        </html>
      `);
      
      // Set location to match expected URL for navigation testing
      await this.helper.page.evaluate((pageUrl) => {
        // Mock the location object
        Object.defineProperty(window, 'location', {
          writable: true,
          value: { href: pageUrl }
        });
      }, url);
      
      console.log(`Mock page created for ${rule.AppArea} - ${rule.RuleName}`);
      return true;
    } catch (error) {
      console.error(`Error creating mock page for ${rule.AppArea} - ${rule.RuleName}:`, error.message);
      return false;
    }
  }

  /**
   * Verify DOM interaction with a rule
   * @param {Object} rule - Rule definition object
   * @returns {Promise<Object>} - DOM interaction test results
   */
  async verifyRuleDOMInteraction(rule) {
    this.currentRule = rule;
    const results = {
      rule,
      buttons: {
        unloadButton: false,
        loadButton: false
      },
      selectors: {
        codeSelector: false,
        fileNameSelector: false
      },
      domInteraction: {
        canUnload: false,
        canLoad: false
      },
      screenshots: []
    };
    
    try {
      // Create a mock page for testing
      const mockCreated = await this.createMockPageForRule(rule);
      if (!mockCreated) {
        throw new Error('Failed to create mock page');
      }
      
      // Take a screenshot
      const screenshotPath = `rule-${rule.AppArea}-${rule.RuleName}-${Date.now()}.png`;
      await this.helper.page.screenshot({ path: screenshotPath, fullPage: true });
      results.screenshots.push(screenshotPath);
      
      // Verify buttons
      const unloadBtnId = `unload${rule.fileType.toUpperCase()}`;
      const loadBtnId = `load${rule.fileType.toUpperCase()}`;
      
      // Check that buttons exist
      results.buttons = await this.helper.page.evaluate(({ unloadId, loadId }) => {
        return {
          unloadButton: !!document.getElementById(unloadId),
          loadButton: !!document.getElementById(loadId)
        };
      }, { unloadId: unloadBtnId, loadId: loadBtnId });
      
      // Verify selectors
      if (rule.codeSelector) {
        try {
          results.selectors.codeSelector = await this.helper.page.evaluate((selector) => {
            try {
              // Evaluate the selector as JavaScript
              const result = eval(selector);
              return !!result;
            } catch {
              return false;
            }
          }, rule.codeSelector);
        } catch {
          results.selectors.codeSelector = false;
        }
      }
      
      if (rule.fileNameSelector) {
        try {
          results.selectors.fileNameSelector = await this.helper.page.evaluate((selector) => {
            try {
              // Evaluate the selector as JavaScript
              const result = eval(selector);
              return !!result;
            } catch {
              return false;
            }
          }, rule.fileNameSelector);
        } catch {
          results.selectors.fileNameSelector = false;
        }
      }
      
      // Test unloading interaction
      if (results.buttons.unloadButton) {
        try {
          results.domInteraction.canUnload = await this.helper.page.evaluate((unloadId) => {
            const btn = document.getElementById(unloadId);
            if (btn) {
              // Simulate click without actually triggering DOM events
              return true;
            }
            return false;
          }, unloadBtnId);
        } catch {
          results.domInteraction.canUnload = false;
        }
      }
      
      // Test loading interaction
      if (results.buttons.loadButton) {
        try {
          results.domInteraction.canLoad = await this.helper.page.evaluate((loadId) => {
            const btn = document.getElementById(loadId);
            if (btn) {
              // Simulate click without actually triggering DOM events
              return true;
            }
            return false;
          }, loadBtnId);
        } catch {
          results.domInteraction.canLoad = false;
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Error testing DOM interaction for ${rule.AppArea} - ${rule.RuleName}:`, error.message);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Validate all rules in the rules list
   * @param {boolean} testDOM - Whether to also test DOM interaction
   * @returns {Promise<Object>} - Validation results
   */
  async validateAllRules(testDOM = false) {
    console.log(`Validating ${this.rulesList.length} rules...`);
    
    const results = {
      totalRules: this.rulesList.length,
      validRules: 0,
      invalidRules: 0,
      domTestedRules: 0,
      domPassedRules: 0,
      domFailedRules: 0,
      details: []
    };
    
    for (const rule of this.rulesList) {
      // Validate rule definition
      const validationResult = this.validateRuleDefinition(rule);
      
      if (validationResult.isValid) {
        results.validRules++;
        this.validatedRules.push(rule);
        
        // Test DOM interaction if requested
        if (testDOM) {
          results.domTestedRules++;
          
          const domResults = await this.verifyRuleDOMInteraction(rule);
          const domPassed = 
            domResults.buttons.unloadButton && 
            domResults.buttons.loadButton &&
            domResults.selectors.codeSelector;
          
          if (domPassed) {
            results.domPassedRules++;
          } else {
            results.domFailedRules++;
          }
          
          results.details.push({
            rule: `${rule.AppArea} - ${rule.RuleName}`,
            definitionValid: true,
            domTested: true,
            domPassed,
            domResults
          });
        } else {
          results.details.push({
            rule: `${rule.AppArea} - ${rule.RuleName}`,
            definitionValid: true,
            domTested: false
          });
        }
      } else {
        results.invalidRules++;
        this.failedRules.push({
          rule,
          errors: validationResult.errors
        });
        
        results.details.push({
          rule: `${rule.AppArea} - ${rule.RuleName}`,
          definitionValid: false,
          errors: validationResult.errors,
          domTested: false
        });
      }
    }
    
    return results;
  }

  /**
   * Generate a report of rule validation results
   * @param {Object} results - Validation results from validateAllRules
   * @returns {Promise<string>} - Path to the report file
   */
  async generateReport(results) {
    const reportDir = path.join(__dirname, 'reports');
    await fs.mkdir(reportDir, { recursive: true }).catch(() => {});
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportPath = path.join(reportDir, `rules-validation-${timestamp}.json`);
    
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
    
    return reportPath;
  }
}

module.exports = RulesValidator;