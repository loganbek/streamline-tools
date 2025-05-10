/**
 * Login diagnostics script - Run this directly with Node.js
 * Purpose: Test authentication to Oracle CPQ Cloud while gathering detailed diagnostics
 */
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'login-logs');

async function ensureLogDir() {
  try {
    await fs.mkdir(logsDir, { recursive: true });
    console.log(`Created logs directory: ${logsDir}`);
  } catch (err) {
    // Ignore if directory already exists
    if (err.code !== 'EEXIST') {
      console.error(`Error creating logs directory: ${err.message}`);
    }
  }
}

async function saveScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filePath = path.join(logsDir, filename);
  
  try {
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Screenshot saved: ${filename}`);
    return filePath;
  } catch (err) {
    console.error(`Error saving screenshot: ${err.message}`);
    return null;
  }
}

async function gatherDiagnostics(page, title) {
  console.log(`\n--- ${title} ---`);
  
  try {
    // Current URL and page title
    const url = await page.url();
    const pageTitle = await page.title();
    console.log(`URL: ${url}`);
    console.log(`Page Title: ${pageTitle}`);
    
    // Page content
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 300) + "..."; // First 300 chars
    }).catch(e => "Error getting body text: " + e.message);
    console.log(`Page Content (excerpt): ${bodyText}`);
    
    // Check for login form elements
    const loginElements = await page.evaluate(() => {
      const elements = {
        usernameField: !!document.querySelector('#username, input[name="username"], input[type="email"]'),
        passwordField: !!document.querySelector('#password, input[name="password"], input[type="password"]'),
        loginButton: !!document.querySelector('input[type="submit"], button[type="submit"], .login-button'),
        errorMessage: document.querySelector('.error, .error-message, .alert-danger')?.innerText || null
      };
      return elements;
    }).catch(e => "Error evaluating login elements: " + e.message);
    
    console.log("Login Elements:", JSON.stringify(loginElements, null, 2));
    
    // Check for common login success indicators
    const successElements = await page.evaluate(() => {
      const elements = {
        logoutButton: !!document.querySelector('.logout, .logout-button, a[href*="logout"]'),
        userMenu: !!document.querySelector('.user-menu, .user-profile, #navUserMenu'),
        welcomeMessage: !!document.querySelector('.welcome-message, .user-welcome'),
        dashboardElements: !!document.querySelector('.dashboard, .home-dashboard, .crm-ribbon')
      };
      return elements;
    }).catch(e => "Error evaluating success elements: " + e.message);
    
    console.log("Success Indicators:", JSON.stringify(successElements, null, 2));
    
    // Check document cookies (may provide auth info)
    const cookies = await page.cookies();
    console.log(`Cookies: ${cookies.length} found`);
    
    // Check console logs for errors
    const consoleMessages = [];
    await page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push(`[${type}] ${msg.text()}`);
      }
    });
    
    // Network request logging
    await page.on('request', request => {
      if (request.url().includes('login') || request.url().includes('auth')) {
        console.log(`Network Request: ${request.method()} ${request.url()}`);
      }
    });
    
    await page.on('response', response => {
      if (response.url().includes('login') || response.url().includes('auth')) {
        console.log(`Network Response: ${response.status()} ${response.url()}`);
      }
    });
    
    // Save screenshot
    await saveScreenshot(page, title.replace(/\s+/g, '-').toLowerCase());
    
    console.log(`--- End ${title} ---\n`);
  } catch (error) {
    console.error(`Error gathering diagnostics for ${title}:`, error);
  }
}

async function runLoginDiagnostics() {
  console.log("Starting Oracle CPQ Cloud login diagnostics...");
  const timestamp = new Date().toISOString();
  console.log(`Time: ${timestamp}`);
  
  // Validate environment variables
  if (!process.env.BASE_URL) {
    console.error("Error: BASE_URL environment variable is not set");
    return;
  }
  
  if (!process.env.CPQ_USERNAME || !process.env.CPQ_PASSWORD) {
    console.error("Error: CPQ_USERNAME or CPQ_PASSWORD environment variables are not set");
    return;
  }
  
  console.log(`BASE_URL: ${process.env.BASE_URL}`);
  console.log(`Username: ${process.env.CPQ_USERNAME}`);
  console.log(`Password: ${process.env.CPQ_PASSWORD ? "*".repeat(8) : "NOT SET"}`);
  
  await ensureLogDir();
  
  // Launch browser
  console.log("\nLaunching browser...");
  const browser = await puppeteer.launch({
    headless: false,  // Set to false to see the browser UI
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set default timeout
    page.setDefaultTimeout(30000);
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable request and response interception
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      request.continue();
    });
    
    // Navigate to login page
    console.log(`\nNavigating to: ${process.env.BASE_URL}`);
    try {
      await page.goto(process.env.BASE_URL, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 30000
      });
      console.log("Navigation complete");
    } catch (navError) {
      console.error("Navigation error:", navError.message);
    }
    
    await gatherDiagnostics(page, "Initial Page Load");
    
    // Try to detect and handle different login scenarios
    const loginFormExists = await page.evaluate(() => {
      return !!(document.querySelector('#username') || 
                document.querySelector('input[name="username"]') ||
                document.querySelector('input[type="email"]'));
    });
    
    if (!loginFormExists) {
      console.log("Login form not detected on initial load. Checking if already logged in...");
      
      const isLoggedIn = await page.evaluate(() => {
        return !!(document.querySelector('.logout-button') || 
                  document.querySelector('.user-profile') ||
                  document.querySelector('#navUserMenu'));
      });
      
      if (isLoggedIn) {
        console.log("Already logged in!");
        await gatherDiagnostics(page, "Already Logged In");
        return;
      } else {
        console.log("Not logged in and no login form found. Looking for alternative login links...");
        
        // Try to find and click login links
        const foundLoginLink = await page.evaluate(() => {
          const loginLinks = Array.from(document.querySelectorAll('a')).filter(a => 
            a.innerText.toLowerCase().includes('login') || 
            a.innerText.toLowerCase().includes('sign in') ||
            (a.href && (a.href.includes('login') || a.href.includes('signin')))
          );
          
          if (loginLinks.length > 0) {
            loginLinks[0].click();
            return true;
          }
          return false;
        });
        
        if (foundLoginLink) {
          console.log("Clicked a login link. Waiting for form to appear...");
          await page.waitForTimeout(3000);
          await gatherDiagnostics(page, "After Clicking Login Link");
        } else {
          console.log("No login links found. Trying to access known login URL...");
          // Try appending /login to the base URL
          try {
            const baseUrl = process.env.BASE_URL.replace(/\/$/, '');
            await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
            console.log("Navigated to explicit login URL");
            await gatherDiagnostics(page, "Explicit Login URL");
          } catch (error) {
            console.error("Error navigating to explicit login URL:", error.message);
          }
        }
      }
    }
    
    // Attempt login
    console.log("\nAttempting login...");
    
    const loginResult = await page.evaluate((username, password) => {
      // Try multiple selector patterns for login form fields
      const usernameSelectors = [
        '#username', 
        'input[name="username"]', 
        'input[type="text"][id*="user"]',
        'input[type="email"]'
      ];
      
      const passwordSelectors = [
        '#password', 
        '#psword', 
        'input[name="password"]', 
        'input[type="password"]'
      ];
      
      const submitSelectors = [
        '#log_in', 
        'input[type="submit"]', 
        'button[type="submit"]',
        'button.login-button'
      ];
      
      // Find form elements
      let usernameField = null;
      for (const selector of usernameSelectors) {
        usernameField = document.querySelector(selector);
        if (usernameField) break;
      }
      
      let passwordField = null;
      for (const selector of passwordSelectors) {
        passwordField = document.querySelector(selector);
        if (passwordField) break;
      }
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = document.querySelector(selector);
        if (submitButton) break;
      }
      
      // Return diagnostics if any form elements aren't found
      if (!usernameField) {
        return { success: false, issue: "Username field not found", foundFields: { username: false, password: !!passwordField, submit: !!submitButton } };
      }
      
      if (!passwordField) {
        return { success: false, issue: "Password field not found", foundFields: { username: true, password: false, submit: !!submitButton } };
      }
      
      if (!submitButton) {
        return { success: false, issue: "Submit button not found", foundFields: { username: true, password: true, submit: false } };
      }
      
      // Fill login form
      usernameField.value = '';
      passwordField.value = '';
      
      usernameField.value = username;
      passwordField.value = password;
      
      // Trigger input events
      const event = new Event('input', { bubbles: true });
      usernameField.dispatchEvent(event);
      passwordField.dispatchEvent(event);
      
      // Submit form
      submitButton.click();
      
      return { 
        success: true, 
        message: "Login form submitted",
        foundFields: { 
          username: true, 
          password: true, 
          submit: true 
        },
        selectors: {
          usernameSelector: usernameField.id || usernameField.name || 'unknown',
          passwordSelector: passwordField.id || passwordField.name || 'unknown',
          submitSelector: submitButton.id || submitButton.tagName || 'unknown'
        }
      };
    }, process.env.CPQ_USERNAME, process.env.CPQ_PASSWORD);
    
    console.log("Login attempt result:", JSON.stringify(loginResult, null, 2));
    
    if (!loginResult.success) {
      console.error(`Login form issue: ${loginResult.issue}`);
      await gatherDiagnostics(page, "Login Form Issue");
      
      if (loginResult.foundFields.username && loginResult.foundFields.password && !loginResult.foundFields.submit) {
        console.log("Trying to submit form by pressing Enter instead...");
        
        // Try pressing Enter on the password field
        await page.evaluate(() => {
          const passwordField = document.querySelector('input[type="password"]');
          if (passwordField) {
            const event = new KeyboardEvent('keydown', {
              key: 'Enter',
              code: 'Enter',
              keyCode: 13,
              bubbles: true
            });
            passwordField.dispatchEvent(event);
            return true;
          }
          return false;
        });
        
        console.log("Form submitted via Enter key");
      }
    }
    
    // Wait for navigation after login
    console.log("\nWaiting for navigation after login submission...");
    try {
      await page.waitForNavigation({ timeout: 25000, waitUntil: 'networkidle2' });
      console.log("Navigation after login completed");
    } catch (navError) {
      console.log("No navigation occurred or navigation timed out");
    }
    
    // Wait for potential redirects or page processing
    await page.waitForTimeout(5000);
    
    await gatherDiagnostics(page, "After Login Attempt");
    
    // Final check if login was successful
    const loginStatus = await page.evaluate(() => {
      // Elements that indicate we're still on the login page
      const loginPageSelectors = [
        '#username', 
        '#password', 
        'input[type="password"]',
        '.login-form',
        'form[action*="login"]'
      ];
      
      // Elements that indicate we're logged in
      const loggedInSelectors = [
        '.user-profile', 
        '.logged-in-user',
        '.logout-button',
        '#logout',
        'a[href*="logout"]',
        '.user-account',
        '.header-user-info',
        '#navUserMenu',
        '.crm-ribbon'
      ];
      
      // Error message indicators
      const errorSelectors = [
        '.error', 
        '.error-message', 
        '.alert-danger', 
        '[role="alert"]', 
        '#errorMessage',
        '.login-error'
      ];
      
      const stillOnLoginPage = loginPageSelectors.some(selector => 
        document.querySelector(selector) !== null
      );
      
      const hasLoggedInIndicators = loggedInSelectors.some(selector => 
        document.querySelector(selector) !== null
      );
      
      const errorMessages = [];
      errorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = el.innerText.trim();
          if (text) errorMessages.push(text);
        });
      });
      
      return {
        success: !stillOnLoginPage && hasLoggedInIndicators,
        stillOnLoginPage,
        hasLoggedInIndicators,
        errorMessages,
        url: window.location.href,
        title: document.title
      };
    });
    
    console.log("\nLogin Status:", JSON.stringify(loginStatus, null, 2));
    
    if (loginStatus.success) {
      console.log("✅ LOGIN SUCCESSFUL!");
    } else {
      console.log("❌ LOGIN FAILED!");
      
      if (loginStatus.errorMessages.length > 0) {
        console.log("Error messages found:", loginStatus.errorMessages);
      }
      
      // Try to detect specific Oracle CPQ issues
      if (loginStatus.url.includes('error')) {
        console.log("Detected error page in URL");
      }
      
      if (loginStatus.stillOnLoginPage) {
        console.log("Still on login page after submission - credentials may be invalid or form submission failed");
      }
    }
    
    // Check if we can access a specific page after login
    if (loginStatus.success) {
      console.log("\nChecking access to specific application page...");
      try {
        // Try to access admin page which usually requires authentication
        await page.goto(`${process.env.BASE_URL}/admin/header_footer/edit.jsp`, {
          waitUntil: 'networkidle2',
          timeout: 20000
        });
        
        await gatherDiagnostics(page, "Admin Page Access");
        
        // Check if we have edit access to confirm login was successful
        const hasEditAccess = await page.evaluate(() => {
          return {
            hasEditElements: !!(
              document.querySelector('textarea') || 
              document.querySelector('input[type="text"]') || 
              document.querySelector('.adminContent')
            ),
            stillOnLoginPage: !!(
              document.querySelector('#username') || 
              document.querySelector('input[type="password"]')
            )
          };
        });
        
        if (hasEditAccess.hasEditElements && !hasEditAccess.stillOnLoginPage) {
          console.log("✅ Successfully accessed admin page - login confirmed working");
        } else if (hasEditAccess.stillOnLoginPage) {
          console.log("❌ Redirected back to login page - login session didn't persist");
        } else {
          console.log("⚠️ Accessed page but admin elements not found - may have insufficient permissions");
        }
      } catch (error) {
        console.error("Error accessing admin page:", error.message);
      }
    }
    
  } catch (error) {
    console.error("Error during login diagnostics:", error);
  } finally {
    console.log("\nLogin diagnostics complete. Screenshots saved to:", logsDir);
    
    // Close browser
    try {
      await browser.close();
      console.log("Browser closed");
    } catch (err) {
      console.error("Error closing browser:", err.message);
    }
  }
}

// Run the diagnostics
runLoginDiagnostics()
  .then(() => {
    console.log("Login diagnostics script completed");
    process.exit(0);
  })
  .catch(err => {
    console.error("Unhandled error in login diagnostics script:", err);
    process.exit(1);
  });