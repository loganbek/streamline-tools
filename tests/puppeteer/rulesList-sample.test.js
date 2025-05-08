const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;
const rulesList = require('../../src/rulesList.json');

/**
 * Sample test file that runs one test from each AppArea in rulesList.json
 * Use this for quick sanity testing before running the full test suite
 */
describe('StreamLine Tools - Sample Tests (One per AppArea)', () => {
    let helper;
    let currentTestName = '';
    
    // Group rules by AppArea and take one rule from each area
    const appAreas = {};
    const sampleRules = [];
    
    // Group and select one rule from each AppArea
    rulesList.forEach(rule => {
        if (!appAreas[rule.AppArea]) {
            appAreas[rule.AppArea] = [];
            sampleRules.push(rule); // Take the first rule from each AppArea
        }
        appAreas[rule.AppArea].push(rule);
    });

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        
        // Log test configuration
        console.log(`Testing against BigMachines instance: ${process.env.BASE_URL}`);
        console.log(`Testing ${sampleRules.length} sample rules (one from each AppArea)`);
    }, 120000); // 2 minute timeout for setup

    afterAll(async () => {
        await helper.cleanup();
    }, 30000); // 30 seconds for cleanup

    beforeEach(async () => {
        // Get current test name for video recording
        currentTestName = expect.getState().currentTestName.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        await fs.mkdir(videoDir, { recursive: true }).catch(err => {
            if (err.code !== 'EEXIST') console.error("Error creating video directory:", err);
        });
        
        // Start recording this test
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(currentTestName);
        
        // Set a long timeout for test execution
        jest.setTimeout(120000); // 2 minutes per test
    });

    afterEach(async () => {
        // Stop recording and save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    // Test one rule from each app area
    sampleRules.forEach(rule => {
        test(`SAMPLE - ${rule.AppArea} - ${rule.RuleName}`, async () => {
            const page = helper.page;
            
            // Normalize the URL to include the BASE_URL
            const testUrl = rule.URL.replace('*.bigmachines.com', process.env.BASE_URL.replace('https://', ''));
            
            console.log(`Testing ${rule.AppArea} - ${rule.RuleName} at URL: ${testUrl}`);
            
            try {
                // Navigate to the rule URL
                await page.goto(testUrl, { 
                    timeout: 30000,
                    waitUntil: 'networkidle2'
                });
                
                // Wait for the page to stabilize
                await helper.waitForStableState();
                
                // Take screenshot for debugging
                await page.screenshot({ 
                    path: `SAMPLE-${rule.AppArea}-${rule.RuleName}-initial-${Date.now()}.png`,
                    fullPage: true
                });
                
                // For rules that open in a new window, handle that case
                if (rule.opensNewWindow === "TRUE") {
                    // Wait for the new window to open
                    console.log(`Waiting for new window to open: ${rule.newWindowURL}`);
                    
                    // Click the element that opens the new window
                    await page.click('a[id="define_function"]');
                    
                    // Get all pages/tabs
                    const pages = await helper.browser.pages();
                    const newPage = pages[pages.length - 1]; // Get the newest page
                    
                    // Switch focus to the new page
                    await newPage.bringToFront();
                    
                    // Wait for the new page to load
                    await newPage.waitForNavigation({ timeout: 30000, waitUntil: 'networkidle2' })
                        .catch(() => console.log('Navigation timeout, continuing anyway...'));
                    
                    // Take screenshot of the new window
                    await newPage.screenshot({ 
                        path: `SAMPLE-${rule.AppArea}-${rule.RuleName}-newWindow-${Date.now()}.png`,
                        fullPage: true
                    });
                    
                    // Test operations in the new window
                    let editorExists = false;
                    
                    // Check if there's an editor element based on the codeSelector from rulesList.json
                    if (rule.codeSelector) {
                        editorExists = await newPage.evaluate((selector) => {
                            return !!document.querySelector(selector);
                        }, rule.codeSelector);
                    }
                    
                    console.log(`Editor element exists in new window: ${editorExists}`);
                    expect(editorExists).toBe(true);
                    
                    // Close the new window/tab when done
                    await newPage.close();
                } else {
                    // Test operations in the current window
                    
                    // Check for redirects if applicable
                    if (rule.redirect === "TRUE") {
                        // Wait for the redirect to complete
                        await page.waitForNavigation({ timeout: 30000 })
                            .catch(() => console.log('Redirect timeout, continuing anyway...'));
                            
                        // Take screenshot after redirect
                        await page.screenshot({ 
                            path: `SAMPLE-${rule.AppArea}-${rule.RuleName}-afterRedirect-${Date.now()}.png`,
                            fullPage: true
                        });
                    }
                    
                    // Verify editor elements exist based on codeSelector
                    let editorExists = false;
                    
                    if (rule.codeSelector) {
                        editorExists = await page.evaluate((selector) => {
                            return !!document.querySelector(selector);
                        }, rule.codeSelector);
                    }
                    
                    console.log(`Editor element exists: ${editorExists}`);
                    
                    // Sometimes editors are in iframes, so handle that case
                    if (!editorExists && rule.AppArea === "Documents") {
                        // Check for frames
                        const frames = page.frames();
                        for (const frame of frames) {
                            const frameUrl = frame.url();
                            if (frameUrl.includes('document-designer') || frameUrl.includes('editor')) {
                                editorExists = await frame.evaluate((selector) => {
                                    return !!document.querySelector(selector);
                                }, rule.codeSelector).catch(() => false);
                                
                                if (editorExists) {
                                    console.log(`Found editor in iframe: ${frameUrl}`);
                                    break;
                                }
                            }
                        }
                    }
                    
                    expect(editorExists).toBe(true);
                }
                
                console.log(`Successfully tested sample rule for ${rule.AppArea}`);
            } catch (error) {
                console.error(`Error testing ${rule.AppArea} - ${rule.RuleName}:`, error);
                
                // Take a failure screenshot
                await page.screenshot({ 
                    path: `SAMPLE-${rule.AppArea}-${rule.RuleName}-FAILURE-${Date.now()}.png`,
                    fullPage: true
                });
                
                throw error;
            }
        }, 120000); // 2 minute timeout per test
    });
});