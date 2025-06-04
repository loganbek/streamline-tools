const fs = require('fs').promises;
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '.env') });

class TestReporter {
    constructor(options = {}) {
        this.options = {
            reportDir: process.env.REPORT_DIR || 'test-reports',
            htmlReport: process.env.HTML_REPORT === 'true',
            jsonReport: process.env.JSON_REPORT === 'true',
            screenshotDir: process.env.SCREENSHOT_DIR || 'test-screenshots',
            ...options
        };
        
        this.results = {
            startTime: Date.now(),
            endTime: null,
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0
            },
            tests: [],
            system: {
                platform: os.platform(),
                release: os.release(),
                arch: os.arch(),
                cpus: os.cpus().length,
                memory: os.totalmem(),
                node: process.version
            }
        };
    }

    async init() {
        await this.ensureDirectoryExists(this.options.reportDir);
        await this.ensureDirectoryExists(this.options.screenshotDir);
    }

    async ensureDirectoryExists(dir) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    addTestResult(result) {
        const {
            testFile,
            passed,
            numPassedTests,
            numFailedTests,
            duration,
            failureMessages,
            screenshots = []
        } = result;

        this.results.tests.push({
            file: testFile,
            passed,
            numPassedTests: numPassedTests || 0,
            numFailedTests: numFailedTests || 0,
            duration,
            failureMessages: failureMessages || [],
            screenshots,
            timestamp: new Date().toISOString()
        });

        // Update summary
        this.results.summary.total++;
        if (passed) {
            this.results.summary.passed++;
        } else {
            this.results.summary.failed++;
        }
    }

    generateHTML() {
        const tests = this.results.tests
            .map(test => {
                const status = test.passed ? '✅' : '❌';
                const screenshots = test.screenshots
                    .map(s => `<img src="${s}" alt="Test screenshot" style="max-width: 300px; margin: 10px;">`)
                    .join('');
                
                const failures = test.failureMessages
                    .map(msg => `<pre class="error">${msg}</pre>`)
                    .join('');

                return `
                    <div class="test-case ${test.passed ? 'passed' : 'failed'}">
                        <h3>${status} ${test.file}</h3>
                        <p>Duration: ${test.duration}ms</p>
                        <p>Passed: ${test.numPassedTests}, Failed: ${test.numFailedTests}</p>
                        ${failures}
                        <div class="screenshots">${screenshots}</div>
                    </div>
                `;
            })
            .join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.options.reportTitle || 'Test Report'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .test-case { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
                    .passed { background-color: #e6ffe6; }
                    .failed { background-color: #ffe6e6; }
                    .error { background-color: #f8f8f8; padding: 10px; }
                    .summary { font-size: 1.2em; margin: 20px 0; }
                    .screenshots { display: flex; flex-wrap: wrap; gap: 10px; }
                </style>
            </head>
            <body>
                <h1>${this.options.reportTitle || 'Test Report'}</h1>
                <div class="summary">
                    <p>Total: ${this.results.summary.total}</p>
                    <p>Passed: ${this.results.summary.passed}</p>
                    <p>Failed: ${this.results.summary.failed}</p>
                    <p>Duration: ${this.results.summary.duration}ms</p>
                </div>
                <div class="system-info">
                    <h2>System Information</h2>
                    <pre>${JSON.stringify(this.results.system, null, 2)}</pre>
                </div>
                <div class="test-results">
                    ${tests}
                </div>
            </body>
            </html>
        `;
    }

    async saveReports() {
        this.results.endTime = Date.now();
        this.results.summary.duration = this.results.endTime - this.results.startTime;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (this.options.htmlReport) {
            const htmlPath = path.join(this.options.reportDir, `report-${timestamp}.html`);
            await fs.writeFile(htmlPath, this.generateHTML());
        }

        if (this.options.jsonReport) {
            const jsonPath = path.join(this.options.reportDir, `report-${timestamp}.json`);
            await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));
        }
    }

    printSummary() {
        console.log('\n=== Test Report Summary ===\n');
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed}`);
        console.log(`Failed: ${this.results.summary.failed}`);
        console.log(`Duration: ${this.results.summary.duration}ms`);
        
        if (this.results.summary.failed > 0) {
            console.log('\nFailed Tests:');
            this.results.tests
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`\n❌ ${test.file}`);
                    test.failureMessages.forEach(msg => console.log(`  ${msg}`));
                });
        }
    }
}

module.exports = TestReporter;