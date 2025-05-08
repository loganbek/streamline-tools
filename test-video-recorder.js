const puppeteer = require('puppeteer');
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
  log('Starting video test with native Puppeteer recording...');
  log(`Log file: ${logFile}`);
  
  // Use a directory that's guaranteed to be writable
  const videoDir = path.join(os.tmpdir(), 'streamline-test-videos');
  log(`Using video directory: ${videoDir}`);
  
  let browser;
  let cdpSession;
  let frameBuffer = [];
  let recordingStartTime;
  
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
    const fileName = `video-test-${Date.now()}.webm`;
    const videoPath = path.join(videoDir, fileName);
    log(`Video will be saved to: ${videoPath}`);
    
    // Start recording using CDP
    log('Setting up CDP session for recording...');
    cdpSession = await page.target().createCDPSession();
    
    // Initialize frame buffer and recording state
    log('Starting screencast...');
    await cdpSession.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 90,
      everyNthFrame: 1
    });
    
    recordingStartTime = Date.now();
    
    // Set up event listener for screencast frames
    cdpSession.on('Page.screencastFrame', async (frameObject) => {
      // Acknowledge the frame to receive more frames
      await cdpSession.send('Page.screencastFrameAck', {
        sessionId: frameObject.sessionId
      }).catch(e => log(`Error acknowledging frame: ${e.message}`));
      
      // Store the frame data and metadata
      frameBuffer.push({
        data: frameObject.data,
        timestamp: Date.now() - recordingStartTime,
        metadata: {
          width: frameObject.metadata.width,
          height: frameObject.metadata.height
        }
      });
    });
    
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
    await cdpSession.send('Page.stopScreencast');
    log(`Recording stopped with ${frameBuffer.length} frames captured`);
    
    // Save the recording using ffmpeg
    log('Converting frames to video...');
    try {
      // Save frames to temporary directory
      const tempDir = path.join(os.tmpdir(), `video-frames-${Date.now()}`);
      fs_sync.mkdirSync(tempDir, { recursive: true });
      log(`Created temporary directory for frames: ${tempDir}`);
      
      // Write frames to disk
      for (let i = 0; i < frameBuffer.length; i++) {
        const frame = frameBuffer[i];
        const frameData = Buffer.from(frame.data, 'base64');
        const framePath = path.join(tempDir, `frame-${i.toString().padStart(6, '0')}.jpg`);
        fs_sync.writeFileSync(framePath, frameData);
      }
      log(`Wrote ${frameBuffer.length} frames to disk`);
      
      // Build ffmpeg command to convert frames to video
      const { exec } = require('child_process');
      const ffmpegCmd = `ffmpeg -framerate 15 -i "${path.join(tempDir, 'frame-%06d.jpg')}" -c:v libvpx-vp9 -pix_fmt yuv420p "${videoPath}"`;
      
      log(`Running ffmpeg command: ${ffmpegCmd}`);
      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (error, stdout, stderr) => {
          if (error) {
            log(`ffmpeg error: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) log(`ffmpeg stderr: ${stderr}`);
          if (stdout) log(`ffmpeg stdout: ${stdout}`);
          resolve();
        });
      });
      
      // Clean up temp files
      for (let i = 0; i < frameBuffer.length; i++) {
        const framePath = path.join(tempDir, `frame-${i.toString().padStart(6, '0')}.jpg`);
        fs_sync.unlinkSync(framePath);
      }
      fs_sync.rmdirSync(tempDir);
      
      // Verify the video file exists and has content
      const stats = await fs.stat(videoPath);
      log(`Video created successfully: ${videoPath}`);
      log(`Video file size: ${stats.size} bytes`);
      
      if (stats.size === 0) {
        log('WARNING: Video file has zero size!');
      } else {
        log('Video recording test SUCCESSFUL!');
      }
    } catch (ffmpegError) {
      log(`Error creating video with ffmpeg: ${ffmpegError.message}`);
      log('Falling back to saving frames as individual images...');
      
      // Fallback: Save frames as individual images
      const framesDir = `${videoPath.replace(/\.\w+$/, '')}-frames`;
      await fs.mkdir(framesDir, { recursive: true });
      
      // Save frames as individual images
      for (let i = 0; i < frameBuffer.length; i++) {
        const frame = frameBuffer[i];
        const frameData = Buffer.from(frame.data, 'base64');
        await fs.writeFile(path.join(framesDir, `frame-${i.toString().padStart(6, '0')}.jpg`), frameData);
      }
      
      log(`Saved ${frameBuffer.length} frames to ${framesDir}`);
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
    frameBuffer = [];
    if (browser) {
      log('Closing browser...');
      await browser.close();
      log('Browser closed');
    }
    log('Test script completed');
    log(`Log file written to: ${logFile}`);
  }
})();
