/**
 * Test file organizer script for StreamLine Tools
 * This script moves unnecessary test files to an archive folder
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the test directories
const puppeteerTestDir = path.join(__dirname, 'tests', 'puppeteer');
const archiveDir = path.join(puppeteerTestDir, 'archive');

// Create the archive directory if it doesn't exist
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
    console.log(`Created archive directory: ${archiveDir}`);
}

// List of test files to keep (essential for BigMachines testing)
const filesToKeep = [
    'login.test.js',
    'rulesList-master.test.js',
    'rulesList-sample.test.js',
    'commerceActions.test.js',
    'commerceRules.test.js',
    'configurationRules.test.js',
    'documentDesigner.test.js',
    'headerFooter.test.js',
    'interfaces.test.js',
    'stylesheets.test.js',
    'stylesheet.test.js',
    'utilityLibrary.test.js',
    'extension.test.js',
    'helpers.js'  // Not a test file but essential
];

// Process command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const restore = args.includes('--restore') || args.includes('-r');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
StreamLine Tools Test Organizer
==============================

Usage:
  node organize-tests.js [options]

Options:
  -d, --dry-run   Show what would be moved without actually moving files
  -r, --restore   Restore all archived test files
  -h, --help      Show this help message

Examples:
  node organize-tests.js            Move unnecessary test files to archive
  node organize-tests.js --dry-run  Show what would be moved without moving
  node organize-tests.js --restore  Restore all archived test files
`);
    process.exit(0);
}

// Main execution
if (restore) {
    // Restore all files from archive
    const archivedFiles = fs.readdirSync(archiveDir);
    
    console.log('Restoring archived test files:');
    archivedFiles.forEach(file => {
        const sourceFile = path.join(archiveDir, file);
        const targetFile = path.join(puppeteerTestDir, file);
        
        console.log(`  ${file} -> ${targetFile}`);
        
        if (!dryRun) {
            fs.copyFileSync(sourceFile, targetFile);
            fs.unlinkSync(sourceFile);
        }
    });
    
    console.log(dryRun ? 'Dry run complete. No files were actually restored.' : 'Restored all archived test files.');
} else {
    // Move unnecessary files to archive
    const testFiles = fs.readdirSync(puppeteerTestDir)
        .filter(file => file.endsWith('.test.js') || file === 'helpers.js');
    
    const filesToArchive = testFiles.filter(file => !filesToKeep.includes(file));
    
    console.log('Moving unnecessary test files to archive:');
    filesToArchive.forEach(file => {
        const sourceFile = path.join(puppeteerTestDir, file);
        const targetFile = path.join(archiveDir, file);
        
        console.log(`  ${file} -> ${targetFile}`);
        
        if (!dryRun) {
            fs.copyFileSync(sourceFile, targetFile);
            fs.unlinkSync(sourceFile);
        }
    });
    
    console.log(dryRun 
        ? 'Dry run complete. No files were actually moved.' 
        : `Moved ${filesToArchive.length} unnecessary test files to archive.`);
}

console.log('\nYou can now run the appropriate test scripts:');
console.log('  npm run test:cpq-sample   # Run one test from each AppArea (faster)');
console.log('  npm run test:cpq-all      # Run all tests from rulesList.json (comprehensive)');
console.log('\nThese tests interact directly with your BigMachines instance at:', process.env.BASE_URL || 'https://devmcnichols.bigmachines.com');