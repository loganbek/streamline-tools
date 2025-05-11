#!/usr/bin/env node

/**
 * Streamline Tools Test Runner
 * 
 * Runs the test suite with proper configuration and logging.
 * 
 * Usage:
 *   node run-tests.js [options]
 * 
 * Options:
 *   --bypass-login     Skip login tests for faster development
 *   --rule=<ruleName>  Test a specific rule by name
 *   --app=<appArea>    Test rules for a specific application area
 *   --video            Force video recording for all tests
 *   --headless         Run tests in headless mode
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    bypassLogin: args.includes('--bypass-login'),
    headless: args.includes('--headless'),
    forceVideo: args.includes('--video'),
    rule: args.find(arg => arg.startsWith('--rule='))?.split('=')[1],
    appArea: args.find(arg => arg.startsWith('--app='))?.split('=')[1]
};

// Load rulesList to filter tests if needed
let rulesList = [];
try {
    rulesList = require('./src/rulesList.json');
} catch (err) {
    console.error('Failed to load rulesList.json:', err.message);
}

// Setup log directory
const logDir = path.join(__dirname, 'test-logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFile = path.join(logDir, `test-run-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Filter tests based on options
let testPattern = '';
if (options.rule) {
    // Find rules that match the name (case insensitive)
    const matchingRules = rulesList.filter(
        rule => rule.RuleName && rule.RuleName.toLowerCase().includes(options.rule.toLowerCase())
    );
    
    if (matchingRules.length > 0) {
        console.log(`Running tests for rule: ${options.rule}`);
        console.log(`Found ${matchingRules.length} matching rules`);
        matchingRules.forEach(rule => console.log(`- ${rule.AppArea}: ${rule.RuleName}`));
        
        // Use the recordingName as pattern if available, otherwise RuleName
        const patterns = matchingRules
            .map(rule => rule.recordingName || rule.RuleName.toLowerCase().replace(/\s+/g, ''))
            .filter(Boolean);
            
        if (patterns.length > 0) {
            testPattern = patterns.join('|');
        } else {
            testPattern = options.rule;
        }
    } else {
        console.log(`No rules found matching "${options.rule}"`);
    }
} else if (options.appArea) {
    // Filter by app area
    const matchingRules = rulesList.filter(
        rule => rule.AppArea && rule.AppArea.toLowerCase() === options.appArea.toLowerCase()
    );
    
    if (matchingRules.length > 0) {
        console.log(`Running tests for app area: ${options.appArea}`);
        console.log(`Found ${matchingRules.length} matching rules`);
        matchingRules.forEach(rule => console.log(`- ${rule.RuleName}`));
        testPattern = options.appArea;
    } else {
        console.log(`No rules found for app area "${options.appArea}"`);
    }
}

// Prepare environment variables
const env = {
    ...process.env,
    BYPASS_LOGIN: options.bypassLogin ? 'true' : 'false',
    HEADLESS: options.headless ? 'true' : 'false',
    FORCE_VIDEO: options.forceVideo ? 'true' : 'false',
    TEST_PATTERN: testPattern
};

console.log('\nStarting test run with the following configuration:');
console.log(`- Bypass Login: ${options.bypassLogin ? 'Yes' : 'No'}`);
console.log(`- Headless Mode: ${options.headless ? 'Yes' : 'No'}`);
console.log(`- Force Video: ${options.forceVideo ? 'Yes' : 'No'}`);
if (testPattern) {
    console.log(`- Test Pattern: ${testPattern}`);
}
console.log(`- Log File: ${logFile}`);
console.log('\n');

// Log start time
const startTime = new Date();
logStream.write(`Test run started at ${startTime.toISOString()}\n`);
logStream.write(`Configuration: ${JSON.stringify(options, null, 2)}\n\n`);

// Build the test command
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args2 = ['test'];

// Add test pattern if specified
if (testPattern) {
    args2.push('--', `--testPathPattern=${testPattern}`);
} else if (options.rule === 'navigation') {
    // Special case for navigation tests
    args2.push('--', '--testPathPattern=rule-navigation');
} else {
    args2.push('--', '--testPathPattern=.*\\.test\\.js$');
}

// Add verbose flag for detailed output
args2.push('--verbose');

console.log(`Running command: ${npmCommand} ${args2.join(' ')}`);
logStream.write(`Running command: ${npmCommand} ${args2.join(' ')}\n`);

// Spawn the test process
const testProcess = spawn(npmCommand, args2, { 
    env,
    stdio: ['pipe', 'pipe', 'pipe']
});

// Pipe output to console and log file
testProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
    logStream.write(data);
});

testProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
    logStream.write(`[ERROR] ${data}`);
});

// Handle process completion
testProcess.on('close', (code) => {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000; // in seconds
    
    const summary = `\nTest run completed with exit code ${code} in ${duration.toFixed(2)} seconds\n`;
    console.log(summary);
    logStream.write(summary);
    
    // Check for video files
    const videoDir = path.join(__dirname, 'tests', 'puppeteer', 'test-videos');
    if (fs.existsSync(videoDir)) {
        const videoFiles = fs.readdirSync(videoDir).filter(file => file.endsWith('.mp4') || file.endsWith('.webm'));
        if (videoFiles.length > 0) {
            const videoSummary = `Generated ${videoFiles.length} video recordings in ${videoDir}\n`;
            console.log(videoSummary);
            logStream.write(videoSummary);
            
            // List the first 5 videos
            const samplesToShow = Math.min(5, videoFiles.length);
            console.log(`Sample videos (${samplesToShow} of ${videoFiles.length}):`);
            logStream.write(`Sample videos (${samplesToShow} of ${videoFiles.length}):\n`);
            
            for (let i = 0; i < samplesToShow; i++) {
                console.log(`- ${videoFiles[i]}`);
                logStream.write(`- ${videoFiles[i]}\n`);
            }
        } else {
            console.log('No video recordings were generated.');
            logStream.write('No video recordings were generated.\n');
        }
    }
    
    logStream.end();
    process.exit(code);
});