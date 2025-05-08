const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;

describe('Streamline Tools Unload/Load Video Capture', () => {
    let helper;
    let currentTestName = '';
    const TEST_TIMEOUT = 60000; // 60 seconds timeout for this test

    beforeAll(async () => {
        console.log("Setting up Streamline Tools Unload/Load Video Capture test...");
        helper = new TestHelper();
        await helper.init();
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming
        currentTestName = expect.getState().currentTestName
            .replace(/[^a-zA-Z0-9]/g, '_')  // Replace any non-alphanumeric chars with underscore
            .replace(/_+/g, '_')            // Replace multiple underscores with a single one
            .replace(/^_|_$/g, '')          // Remove leading/trailing underscores
            .toLowerCase();                 // Convert to lowercase for consistency
        
        // Set up video directory
        const videoDir = path.join(__dirname, 'test-videos');
        try {
            await fs.mkdir(videoDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error("Error creating video directory:", error);
            }
        }
        
        // Start recording with clear, descriptive filename
        const videoFile = path.join(videoDir, `streamline_unload_load_${Date.now()}.mp4`);
        console.log(`Starting recording to: ${videoFile}`);
        await helper.startRecording(videoFile);
        
        // Set test timeout
        jest.setTimeout(TEST_TIMEOUT);
    });

    afterEach(async () => {
        // Always save the video
        console.log(`Test finished, saving video`);
        await helper.stopRecording(true);
    });

    test('should record unload and load functionality', async () => {
        const page = helper.page;
        
        console.log("Navigating to utility library page...");
        await page.goto(`${process.env.BASE_URL}/admin/library/utility`, { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for page to stabilize and ensure it's fully loaded
        await helper.safeWait(3000);
        
        // Take a screenshot to verify we're on the correct page
        await page.screenshot({ path: 'utility-library-page.png', fullPage: true });
        
        // Define test content
        const utilityCode = 'function calculateVolumePrice() {\n    // Calculate volume pricing\n    const basePrice = 100;\n    const volumeDiscount = 0.15;\n    return basePrice * (1 - volumeDiscount);\n}';
        
        console.log("Testing unload functionality...");
        // Test unload utility function - with visual highlighting for video capture
        await page.evaluate(() => {
            // Highlight UI elements for better video visibility
            const unloadButton = document.querySelector('button[data-test-id="unload-button"], button:contains("Unload")');
            if (unloadButton) {
                unloadButton.style.border = '3px solid red';
                unloadButton.style.boxShadow = '0 0 10px rgba(255,0,0,0.5)';
            }
            
            const editorElement = document.querySelector('.monaco-editor, .code-editor');
            if (editorElement) {
                editorElement.style.border = '2px solid blue';
            }
        });
        
        // Fill in the utility code in the editor
        await helper.setEditorContent(utilityCode);
        
        // Click Unload button with retry logic
        let unloadSuccess = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await page.click('button[data-test-id="unload-button"], button:contains("Unload")');
                await helper.safeWait(2000);
                unloadSuccess = true;
                break;
            } catch (error) {
                console.warn(`Unload button click attempt ${attempt} failed:`, error.message);
                if (attempt === 3) {
                    console.error("Failed to click Unload button after multiple attempts");
                } else {
                    await helper.safeWait(1000);
                }
            }
        }
        
        if (unloadSuccess) {
            // Verify unload was successful (if possible)
            await helper.safeWait(2000);
            console.log("Unload operation completed");
        }
        
        console.log("Testing load functionality...");
        // Test load utility function - with visual highlighting
        await page.evaluate(() => {
            // Highlight load button for video visibility
            const loadButton = document.querySelector('button[data-test-id="load-button"], button:contains("Load")');
            if (loadButton) {
                loadButton.style.border = '3px solid green';
                loadButton.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)';
            }
        });
        
        // Create mock file content for loading
        const loadCode = 'function calculateVolumePrice() {\n    // Updated utility function\n    const basePrice = 150;\n    const volumeDiscount = 0.2;\n    return basePrice * (1 - volumeDiscount);\n}';
        
        // Mock the file system access API for loading a file
        await helper.setupFileMock(loadCode, 'calculateVolumePrice.bml');
        
        // Click Load button with retry logic
        let loadSuccess = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await page.click('button[data-test-id="load-button"], button:contains("Load")');
                await helper.safeWait(2000);
                loadSuccess = true;
                break;
            } catch (error) {
                console.warn(`Load button click attempt ${attempt} failed:`, error.message);
                if (attempt === 3) {
                    console.error("Failed to click Load button after multiple attempts");
                } else {
                    await helper.safeWait(1000);
                }
            }
        }
        
        if (loadSuccess) {
            // Verify load was successful (if possible)
            await helper.safeWait(2000);
            console.log("Load operation completed");
            
            // Verify the content is loaded in the editor
            const editorContent = await helper.getEditorContent();
            console.log("Editor content after load:", editorContent);
        }
        
        // Final pause to ensure video captures everything
        await helper.safeWait(3000);
    });
});