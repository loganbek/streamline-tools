#!/usr/bin/env node

/**
 * Test Migration Script - Puppeteer to Playwright
 * This script helps automate the conversion of test files from Puppeteer to Playwright
 */

const fs = require('fs').promises;
const path = require('path');

const PUPPETEER_DIR = path.join(__dirname, 'tests/puppeteer');
const PLAYWRIGHT_DIR = path.join(__dirname, 'tests/playwright');

// Test files that have been manually converted
const CONVERTED_FILES = [
    'extension.test.js',
    'login.test.js', 
    'interfaces.test.js',
    'stylesheet.test.js'
];

// Mapping of common Puppeteer patterns to Playwright equivalents
const CONVERSION_PATTERNS = [
    // Basic imports and requires
    {
        puppeteer: /const { TestHelper } = require\('\.\/helpers'\);/g,
        playwright: "const { test, expect } = require('@playwright/test');\nconst { TestHelper } = require('./helpers');"
    },
    {
        puppeteer: /const .*? = require\('\.\/videoHelper'\);/g,
        playwright: "// Video recording functionality handled by Playwright"
    },
    {
        puppeteer: /describe\('([^']+)',\s*\(\)\s*=>\s*{/g,
        playwright: "test.describe('$1', () => {"
    },
    {
        puppeteer: /test\('([^']+)',\s*async\s*\(\)\s*=>\s*{/g,
        playwright: "test('$1', async () => {"
    },
    {
        puppeteer: /beforeAll\(async\s*\(\)\s*=>\s*{/g,
        playwright: "test.beforeAll(async ({ browser }) => {"
    },
    {
        puppeteer: /beforeEach\(async\s*\(\)\s*=>\s*{/g,
        playwright: "test.beforeEach(async ({ page, context }) => {"
    },
    {
        puppeteer: /afterAll\(async\s*\(\)\s*=>\s*{/g,
        playwright: "test.afterAll(async () => {"
    },
    {
        puppeteer: /afterEach\(async\s*\(\)\s*=>\s*{/g,
        playwright: "test.afterEach(async () => {"
    },
    // Helper initialization
    {
        puppeteer: /helper = new TestHelper\(\);\s*await helper\.init\(\);/g,
        playwright: "helper = new TestHelper();\n        await helper.init(page, context);"
    },
    // Page actions
    {
        puppeteer: /helper\.page\.goto\(/g,
        playwright: "helper.navigateToUrl("
    },
    {
        puppeteer: /helper\.page\.waitForSelector\(/g,
        playwright: "helper.page.waitForSelector("
    },
    {
        puppeteer: /helper\.page\.screenshot\(/g,
        playwright: "helper.takeScreenshot("
    },
    // Jest timeout
    {
        puppeteer: /jest\.setTimeout\(\d+\);/g,
        playwright: "// Timeout handled by Playwright config"
    },
    // Video recording (remove for now)
    {
        puppeteer: /await setupVideoRecording\(.*?\);/g,
        playwright: "// Video recording handled by Playwright"
    },
    {
        puppeteer: /await helper\.startRecording\(.*?\);/g,
        playwright: "// Video recording handled by Playwright"
    },
    {
        puppeteer: /await helper\.stopRecording\(.*?\);/g,
        playwright: "// Video recording handled by Playwright"
    }
];

async function convertTestFile(filename) {
    console.log(`Converting ${filename}...`);
    
    const puppeteerPath = path.join(PUPPETEER_DIR, filename);
    const playwrightPath = path.join(PLAYWRIGHT_DIR, filename);
    
    try {
        // Read the original file
        let content = await fs.readFile(puppeteerPath, 'utf8');
        
        // Apply conversion patterns
        for (const pattern of CONVERSION_PATTERNS) {
            content = content.replace(pattern.puppeteer, pattern.playwright);
        }
        
        // Add test skip logic for environment variables
        if (content.includes('process.env.BASE_URL')) {
            content = content.replace(
                /test\('([^']+)',\s*async\s*\(\)\s*=>\s*{/g,
                `test('$1', async () => {
        // Skip test if environment variables are not set
        if (!process.env.BASE_URL || process.env.BYPASS_LOGIN === 'true') {
            test.skip('Test skipped due to missing environment variables or bypass login');
            return;
        }
        
        try {`
            );
            
            // Add catch block for tests
            content = content.replace(
                /\}\);$/gm,
                `        } catch (error) {
            console.error("Test error:", error.message);
            await helper.takeScreenshot(\`test-failure-\${Date.now()}\`);
            throw error;
        }
    });`
            );
        }
        
        // Write the converted file
        await fs.writeFile(playwrightPath, content);
        console.log(`✓ Converted ${filename}`);
        
    } catch (error) {
        console.error(`✗ Failed to convert ${filename}:`, error.message);
    }
}

async function createTestConversionSummary() {
    const allTestFiles = await fs.readdir(PUPPETEER_DIR);
    const testFiles = allTestFiles.filter(file => file.endsWith('.test.js'));
    
    console.log('\n=== Test Conversion Summary ===');
    console.log(`Total test files: ${testFiles.length}`);
    console.log(`Manually converted: ${CONVERTED_FILES.length}`);
    console.log(`Remaining: ${testFiles.length - CONVERTED_FILES.length}`);
    
    console.log('\nManually converted files:');
    CONVERTED_FILES.forEach(file => console.log(`  ✓ ${file}`));
    
    console.log('\nRemaining files to convert:');
    const remaining = testFiles.filter(file => !CONVERTED_FILES.includes(file));
    remaining.forEach(file => console.log(`  - ${file}`));
    
    return { total: testFiles.length, converted: CONVERTED_FILES.length, remaining };
}

async function main() {
    console.log('Starting test migration from Puppeteer to Playwright...\n');
    
    // Ensure playwright directory exists
    try {
        await fs.mkdir(PLAYWRIGHT_DIR, { recursive: true });
    } catch (error) {
        // Directory already exists
    }
    
    // Show current status
    const summary = await createTestConversionSummary();
    
    if (process.argv.includes('--convert-all')) {
        console.log('\nConverting remaining test files...');
        const allTestFiles = await fs.readdir(PUPPETEER_DIR);
        const testFiles = allTestFiles.filter(file => 
            file.endsWith('.test.js') && !CONVERTED_FILES.includes(file)
        );
        
        for (const file of testFiles) {
            await convertTestFile(file);
        }
        
        console.log('\nAll files converted! Manual review and testing recommended.');
    } else {
        console.log('\nUse --convert-all flag to automatically convert remaining files.');
        console.log('Note: Automatic conversion may require manual review and adjustments.');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    convertTestFile,
    createTestConversionSummary,
    CONVERSION_PATTERNS
};