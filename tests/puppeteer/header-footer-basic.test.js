const { TestHelper } = require('./helpers');
const path = require('path');
const fs = require('fs').promises;

describe('Header & Footer Basic Tests', () => {
    let helper;
    let currentTestName = '';
    const TEST_TIMEOUT = 45000; // 45 seconds test timeout

    beforeAll(async () => {
        console.log("Setting up Header & Footer Basic Tests...");
        helper = new TestHelper();
        
        // Override the login method to do nothing for this test
        helper.login = async () => {
            console.log("Login skipped for header/footer basic test");
            return true;
        };
        
        // Initialize without login
        await helper.init();
    }, TEST_TIMEOUT);

    afterAll(async () => {
        await helper.cleanup();
    });

    beforeEach(async () => {
        // Get current test name for video file naming - improve regex to better handle special characters
        currentTestName = expect.getState().currentTestName
            .replace(/[^a-zA-Z0-9]/g, '_')  // Replace any non-alphanumeric chars with underscore
            .replace(/_+/g, '_')            // Replace multiple underscores with a single one
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
        
        // Start recording this test with improved file name safety
        const videoFile = path.join(videoDir, `${currentTestName}.mp4`);
        console.log(`Starting recording for test: ${currentTestName}`);
        await helper.startRecording(videoFile);
        
        // Set test timeout
        jest.setTimeout(TEST_TIMEOUT);
    });

    afterEach(async () => {
        // Stop recording and always save the video
        console.log(`Test "${currentTestName}" finished`);
        await helper.stopRecording(true); // Always save the video
        currentTestName = '';
    });

    test('should simulate header/footer HTML editor without CPQ', async () => {
        console.log("Testing simplified header/footer HTML editor");
        const page = helper.page;
        
        // Create a simple HTML page that mimics the structure of the header/footer editor
        await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Header & Footer Editor Simulation</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                #streamline-tools-root { border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
                textarea { width: 100%; height: 200px; font-family: monospace; }
                button { padding: 8px 16px; margin-right: 10px; cursor: pointer; }
                .header-section, .footer-section { margin-bottom: 20px; }
                h2 { color: #333; }
                .success-message { color: green; display: none; }
            </style>
        </head>
        <body>
            <div id="streamline-tools-root">
                <h1>Streamline Tools</h1>
                <div class="header-section">
                    <h2>Header HTML</h2>
                    <button id="loadHeaderHTML">Load</button>
                    <button id="unloadHeaderHTML">Unload</button>
                    <div class="success-message" id="headerSuccess">Header operation successful!</div>
                </div>
                <div class="footer-section">
                    <h2>Footer HTML</h2>
                    <button id="loadFooterHTML">Load</button>
                    <button id="unloadFooterHTML">Unload</button>
                    <div class="success-message" id="footerSuccess">Footer operation successful!</div>
                </div>
            </div>
            
            <div class="editor-area">
                <h2>Content Editor</h2>
                <textarea id="contentEditor"><!-- Example header/footer content --></textarea>
                <button id="validateHTML">Validate</button>
                <button id="save">Save</button>
            </div>
            
            <iframe id="previewFrame" style="width:100%; height:150px; border:1px solid #ddd;" srcdoc="<html><body><div>Preview Area</div></body></html>"></iframe>
            
            <script>
                // Add some interactivity for the video
                document.getElementById('loadHeaderHTML').addEventListener('click', function() {
                    document.getElementById('contentEditor').value = '<!-- Header Content -->\n<div class="header">\n  <h1>Site Header</h1>\n  <p>Welcome to our site</p>\n</div>';
                    document.getElementById('headerSuccess').style.display = 'block';
                    setTimeout(() => document.getElementById('headerSuccess').style.display = 'none', 3000);
                    updatePreview();
                });
                
                document.getElementById('unloadHeaderHTML').addEventListener('click', function() {
                    document.getElementById('contentEditor').value = '';
                    document.getElementById('headerSuccess').style.display = 'block';
                    setTimeout(() => document.getElementById('headerSuccess').style.display = 'none', 3000);
                    updatePreview();
                });
                
                document.getElementById('loadFooterHTML').addEventListener('click', function() {
                    document.getElementById('contentEditor').value = '<!-- Footer Content -->\n<div class="footer">\n  <p>&copy; 2025 My Company</p>\n</div>';
                    document.getElementById('footerSuccess').style.display = 'block';
                    setTimeout(() => document.getElementById('footerSuccess').style.display = 'none', 3000);
                    updatePreview();
                });
                
                document.getElementById('unloadFooterHTML').addEventListener('click', function() {
                    document.getElementById('contentEditor').value = '';
                    document.getElementById('footerSuccess').style.display = 'block';
                    setTimeout(() => document.getElementById('footerSuccess').style.display = 'none', 3000);
                    updatePreview();
                });
                
                document.getElementById('validateHTML').addEventListener('click', function() {
                    alert('HTML validation successful!');
                });
                
                document.getElementById('save').addEventListener('click', function() {
                    alert('Content saved successfully!');
                });
                
                function updatePreview() {
                    const content = document.getElementById('contentEditor').value;
                    const frame = document.getElementById('previewFrame');
                    frame.srcdoc = '<html><body>' + content + '</body></html>';
                }
                
                document.getElementById('contentEditor').addEventListener('input', updatePreview);
            </script>
        </body>
        </html>
        `);
        
        // Wait for page to fully render
        await helper.safeWait(2000);
        
        // Verify the key elements exist
        const streamlineRoot = await page.$('#streamline-tools-root');
        expect(streamlineRoot).toBeTruthy();
        
        const loadHeaderButton = await page.$('#loadHeaderHTML');
        expect(loadHeaderButton).toBeTruthy();
        
        const editorArea = await page.$('#contentEditor');
        expect(editorArea).toBeTruthy();
        
        // Perform interactions to record in the video
        console.log("Clicking load header button");
        await loadHeaderButton.click();
        await helper.safeWait(1000);
        
        // Check that content was loaded
        const editorContent = await page.evaluate(() => {
            return document.getElementById('contentEditor').value;
        });
        expect(editorContent).toContain('Header Content');
        
        // Click validate button
        console.log("Clicking validate button");
        const validateButton = await page.$('#validateHTML');
        page.on('dialog', async dialog => {
            console.log("Dialog message:", dialog.message());
            await dialog.accept();
        });
        await validateButton.click();
        await helper.safeWait(1000);
        
        // Modify the content directly
        await page.evaluate(() => {
            document.getElementById('contentEditor').value += '\n<!-- Modified content -->';
            // Trigger input event to update preview
            const event = new Event('input', { bubbles: true });
            document.getElementById('contentEditor').dispatchEvent(event);
        });
        await helper.safeWait(1000);
        
        // Save the content
        console.log("Clicking save button");
        const saveButton = await page.$('#save');
        await saveButton.click();
        await helper.safeWait(1000);
        
        // Click footer buttons
        console.log("Testing footer functionality");
        const loadFooterButton = await page.$('#loadFooterHTML');
        await loadFooterButton.click();
        await helper.safeWait(1000);
        
        // Verify footer content was loaded
        const footerContent = await page.evaluate(() => {
            return document.getElementById('contentEditor').value;
        });
        expect(footerContent).toContain('Footer Content');
        
        // Finally unload the footer
        const unloadFooterButton = await page.$('#unloadFooterHTML');
        await unloadFooterButton.click();
        await helper.safeWait(1000);
        
        console.log("Header & footer simulation test completed");
    }, TEST_TIMEOUT);
});