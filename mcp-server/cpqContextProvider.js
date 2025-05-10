const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * CPQContextProvider
 * Specialized context provider for Streamline Tools for Oracle CPQ Cloud
 * This module focuses on understanding the relationships between rules, selectors, and application areas
 */
class CPQContextProvider {
  constructor() {
    this.rulesCache = null;
    this.rulesPath = path.join(process.cwd(), 'src', 'rulesList.json');
  }

  /**
   * Load the rulesList.json configuration file
   * This file defines how Streamline Tools interacts with different CPQ application areas
   */
  async loadRules() {
    if (this.rulesCache) {
      return this.rulesCache;
    }

    try {
      const rulesContent = await fs.promises.readFile(this.rulesPath, 'utf8');
      this.rulesCache = JSON.parse(rulesContent);
      return this.rulesCache;
    } catch (error) {
      console.error('Error loading rules list:', error);
      return [];
    }
  }

  /**
   * Get context related to Oracle CPQ specific queries
   * @param {string} query - User's query
   * @returns {Array} Relevant context items
   */
  async getCPQContext(query) {
    const rules = await this.loadRules();
    const context = [];
    
    // If the query is about rule types, URL patterns, or application areas
    if (query.toLowerCase().includes('rule') || 
        query.toLowerCase().includes('pattern') ||
        query.toLowerCase().includes('url') || 
        query.toLowerCase().includes('application area') ||
        query.toLowerCase().includes('cpq')) {
          
      // Add rules list context
      context.push({
        title: 'CPQ Rules Configuration',
        content: JSON.stringify(rules, null, 2),
        filepath: this.rulesPath,
        language: 'json'
      });
    }
    
    // Search for implementation files related to rules
    const ruleImplementationFiles = await this.findRuleImplementationFiles(query);
    context.push(...ruleImplementationFiles);
    
    return context;
  }
  
  /**
   * Find implementation files related to rules based on the query
   * @param {string} query - User's query
   * @returns {Array} File contents with metadata
   */
  async findRuleImplementationFiles(query) {
    const results = [];
    const rules = await this.loadRules();
    
    // Extract keywords from query
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    // Match rule types from keywords
    const matchedRuleTypes = rules
      .filter(rule => {
        // Check if any keywords match this rule's properties
        return keywords.some(keyword => 
          rule.ruleType?.toLowerCase().includes(keyword) ||
          rule.urlPattern?.toLowerCase().includes(keyword) ||
          rule.fileType?.toLowerCase().includes(keyword)
        );
      })
      .map(rule => rule.ruleType);
    
    if (matchedRuleTypes.length === 0) {
      return results;
    }
    
    // Look for implementation files that handle these rule types
    const implementationPatterns = [
      './src/background/**/*.js',
      './src/content/**/*.js',
      './src/popup/**/*.js'
    ];
    
    for (const pattern of implementationPatterns) {
      const files = await glob(pattern);
      
      for (const filepath of files) {
        try {
          const content = await fs.promises.readFile(filepath, 'utf8');
          
          // Check if file contains references to the matched rule types
          if (matchedRuleTypes.some(ruleType => 
              content.includes(ruleType) || 
              content.includes(`"${ruleType}"`) || 
              content.includes(`'${ruleType}'`))) {
            
            results.push({
              title: `Implementation: ${path.basename(filepath)}`,
              content: content,
              filepath: filepath,
              language: 'javascript'
            });
          }
        } catch (error) {
          console.error(`Error reading file ${filepath}:`, error);
        }
        
        // Limit number of results
        if (results.length >= 3) break;
      }
      
      if (results.length >= 3) break;
    }
    
    return results;
  }
  
  /**
   * Get context for CPQ Cloud interface related queries
   * @param {string} query - User's query
   * @returns {Array} Relevant context items
   */
  async getInterfaceContext(query) {
    const results = [];
    
    // Look for content scripts that interact with DOM
    const contentScriptPatterns = [
      './src/content/**/*.js',
      './src/content-scripts/**/*.js'
    ];
    
    // Check if query is related to UI/interface
    if (query.toLowerCase().includes('interface') || 
        query.toLowerCase().includes('ui') ||
        query.toLowerCase().includes('dom') ||
        query.toLowerCase().includes('selector') ||
        query.toLowerCase().includes('button')) {
          
      for (const pattern of contentScriptPatterns) {
        const files = await glob(pattern);
        
        for (const filepath of files) {
          try {
            const content = await fs.promises.readFile(filepath, 'utf8');
            
            // Check if file contains DOM manipulation code
            if (content.includes('document.querySelector') || 
                content.includes('getElementById') || 
                content.includes('.addEventListener')) {
                  
              results.push({
                title: `Interface: ${path.basename(filepath)}`,
                content: content,
                filepath: filepath,
                language: 'javascript'
              });
            }
          } catch (error) {
            console.error(`Error reading file ${filepath}:`, error);
          }
          
          // Limit number of results
          if (results.length >= 3) break;
        }
        
        if (results.length >= 3) break;
      }
    }
    
    return results;
  }
  
  /**
   * Get tests related to the query
   * @param {string} query - User's query
   * @returns {Array} Relevant test files
   */
  async getTestContext(query) {
    const results = [];
    
    // Only include test context if specifically asked about tests
    if (!query.toLowerCase().includes('test')) {
      return results;
    }
    
    // Look for test files
    const testPatterns = [
      './tests/**/*.js',
      './tests/puppeteer/**/*.js'
    ];
    
    // Extract keywords from query
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    for (const pattern of testPatterns) {
      const files = await glob(pattern);
      
      for (const filepath of files) {
        try {
          const content = await fs.promises.readFile(filepath, 'utf8');
          
          // Check if any keywords are in the file content
          if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
            results.push({
              title: `Test: ${path.basename(filepath)}`,
              content: content,
              filepath: filepath,
              language: 'javascript'
            });
          }
        } catch (error) {
          console.error(`Error reading file ${filepath}:`, error);
        }
        
        // Limit number of results
        if (results.length >= 2) break;
      }
      
      if (results.length >= 2) break;
    }
    
    return results;
  }
  
  /**
   * Main method to get context based on query
   * @param {string} query - User's query
   * @returns {Array} All relevant context items
   */
  async getContext(query) {
    const results = [];
    
    // Get context from each specialized provider
    const cpqContext = await this.getCPQContext(query);
    const interfaceContext = await this.getInterfaceContext(query);
    const testContext = await this.getTestContext(query);
    
    // Combine all results
    results.push(...cpqContext, ...interfaceContext, ...testContext);
    
    return results.slice(0, 10); // Limit to 10 results total
  }
}

module.exports = CPQContextProvider;