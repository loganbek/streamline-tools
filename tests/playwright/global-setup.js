const path = require('path');
const fs = require('fs');

async function globalSetup(config) {
  console.log('Starting Playwright global setup...');
  
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  
  // Check for required environment variables for CPQ testing
  const requiredVars = ['CPQ_USERNAME', 'CPQ_PASSWORD', 'BASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0 && process.env.BYPASS_LOGIN !== 'true') {
    console.warn(`Missing environment variables for CPQ testing: ${missing.join(', ')}`);
    console.warn('Some tests may be skipped. Set BYPASS_LOGIN=true to skip login tests.');
  }
  
  // Ensure test results directory exists
  const testResultsDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Create test videos directory
  const testVideosDir = path.join(__dirname, 'test-videos');
  if (!fs.existsSync(testVideosDir)) {
    fs.mkdirSync(testVideosDir, { recursive: true });
  }
  
  console.log('Playwright global setup completed');
}

module.exports = globalSetup;