const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs').promises;
const fs_sync = require('fs');
const path = require('path');
const os = require('os');

// Set up logging to file
const logFile = path.join(os.tmpdir(), `video-test-log-${Date.now()}.txt`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs_sync.appendFileSync(logFile, logMessage + '\n');
}

(async () => {
  log('Starting video test with enhanced diagnostics...');
  log(`Log file: ${logFile}`);
  
  // First check if puppeteer-screen-recorder is properly installed
  try {
    log('Checking puppeteer-screen-recorder version...');
    const pkg = require('puppeteer-screen-recorder/package.json');
    log(`Using puppeteer-screen-recorder version: ${pkg.version}`);
  } catch (error) {
    log(`Error loading puppeteer-screen-recorder package: ${error.message}`);
    log('Please ensure the package is installed with: npm install puppeteer-screen-recorder');
    process.exit(1);
  }
  
  // Use a directory that's guaranteed to be writable
  const videoDir = path.join(os.tmpdir(), 'streamline-test-videos');
  log(`Using video directory: ${videoDir}`);
  
  let browser;
  try {
    // Create directory first
    await fs.mkdir(videoDir, { recursive: true });
    log(`Created/verified video directory: ${videoDir}`);
    
    log('Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Add these args for compatibility
    });
    log('Browser launched successfully');
    
    const page = await browser.newPage();
    log('Browser page created');
    
    // Use timestamp for unique filename
    const fileName = `video-test-${Date.now()}.mp4`;
    const videoPath = path.join(videoDir, fileName);
    log(`Video will be saved to: ${videoPath}`);
    
    // Configure the recorder with explicit settings
    const config = {
      followNewTab: true,
      fps: 25,
      quality: 100,
      format: 'mp4',
      videoFrame: {
        width: 1280,
        height: 720
      }
    };
    
    log(`Creating recorder with config: ${JSON.stringify(config)}`);
    const recorder = new PuppeteerScreenRecorder(page, config);
    
    log('Starting recording...');
    await recorder.start(videoPath);
    log('Recording started successfully');
    
    log('Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    log('Loaded example.com');
    
    // Add some visible interaction to the page
    await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.style.color = 'red';
        h1.textContent = 'Recording Test ' + new Date().toISOString();
      }
      
      // Add a counter element to show time passing
      const div = document.createElement('div');
      div.id = 'counter';
      div.style.fontSize = '32px';
      div.style.margin = '20px';
      div.textContent = 'Recording: 0 seconds';
      document.body.appendChild(div);
      
      // Update the counter every second
      window.counterInterval = setInterval(() => {
        const counter = document.getElementById('counter');
        if (counter) {
          const seconds = parseInt(counter.textContent.split(':')[1]) + 1;
          counter.textContent = `Recording: ${seconds} seconds`;
        }
      }, 1000);
    });
    
    // Record for 10 seconds
    log('Recording for 10 seconds...');
    await page.waitForTimeout(10000);
    
    // Clean up the interval
    await page.evaluate(() => {
      if (window.counterInterval) clearInterval(window.counterInterval);
    });
    
    log('Stopping recording...');
    await recorder.stop();
    log('Recording stopped');
    
    // Verify the recording was created
    try {
      const stats = await fs.stat(videoPath);
      log(`Video created successfully: ${videoPath}`);
      log(`Video file size: ${stats.size} bytes`);
      
      if (stats.size === 0) {
        log('WARNING: Video file has zero size!');
      } else {
        log('Video recording test SUCCESSFUL!');
      }
    } catch (fileError) {
      log(`ERROR: Video file not found: ${fileError.message}`);
    }
    
    // List files in video directory to confirm
    try {
      const files = await fs.readdir(videoDir);
      log(`Files in ${videoDir}: ${files.join(', ')}`);
    } catch (readError) {
      log(`Error listing directory: ${readError.message}`);
    }
    
  } catch (error) {
    log(`ERROR during test execution: ${error.stack || error.message}`);
  } finally {
    if (browser) {
      log('Closing browser...');
      await browser.close();
      log('Browser closed');
    }
    log('Test script completed');
    log(`Log file written to: ${logFile}`);
  }
})();
