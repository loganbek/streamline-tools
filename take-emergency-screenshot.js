#!/usr/bin/env node

/**
 * Emergency screenshot utility
 * Takes screenshots of all open Chrome processes when tests are force killed
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots folder if it doesn't exist
const screenshotsDir = path.join(__dirname, 'emergency-screenshots');
try {
  fs.mkdirSync(screenshotsDir, { recursive: true });
} catch (err) {
  if (err.code !== 'EEXIST') {
    console.error('Failed to create screenshots directory:', err);
  }
}

// Generate timestamp for filenames
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

async function takeEmergencyScreenshots() {
  console.log('⚠️ Taking emergency screenshots of browser state...');
  
  try {
    // Connect to any running Chrome instances
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null
    }).catch(() => null);
    
    if (!browser) {
      console.log('No running browser found to screenshot');
      return;
    }
    
    // Get all open pages
    const pages = await browser.pages();
    console.log(`Found ${pages.length} open pages, taking screenshots...`);
    
    // Take screenshots of each page
    const screenshotPromises = pages.map(async (page, index) => {
      try {
        const url = await page.url();
        const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
        const filename = path.join(
          screenshotsDir, 
          `emergency-${timestamp}-page${index}-${sanitizedUrl}.png`
        );
        
        await page.screenshot({ 
          path: filename,
          fullPage: true
        });
        
        console.log(`Screenshot saved: ${filename}`);
      } catch (err) {
        console.error(`Failed to screenshot page ${index}:`, err);
      }
    });
    
    await Promise.all(screenshotPromises);
    
    // Don't disconnect from the browser - let it be handled by the main process
  } catch (err) {
    console.error('Error taking emergency screenshots:', err);
  }
}

// Execute immediately
takeEmergencyScreenshots()
  .catch(err => {
    console.error('Fatal error taking emergency screenshots:', err);
    process.exit(1);
  });