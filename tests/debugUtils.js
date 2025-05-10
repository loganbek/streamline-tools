const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const debug = require('debug')('test:debug');

class DebugUtils {
    constructor(options = {}) {
        this.options = {
            logDir: 'test-logs',
            captureScreenshots: true,
            logLevel: process.env.DEBUG_LEVEL || 'info',
            ...options
        };
        
        this.logs = [];
    }

    async init() {
        await this.ensureLogDirectory();
    }

    async ensureLogDirectory() {
        try {
            await fs.access(this.options.logDir);
        } catch {
            await fs.mkdir(this.options.logDir, { recursive: true });
        }
    }

    async captureState(page, testInfo) {
        const state = {
            url: page.url(),
            timestamp: new Date().toISOString(),
            testInfo,
            console: this.logs,
            dom: await this.captureDOMState(page)
        };

        if (this.options.captureScreenshots) {
            const screenshotPath = path.join(
                this.options.logDir, 
                `debug-${Date.now()}.png`
            );
            await page.screenshot({ path: screenshotPath, fullPage: true });
            state.screenshot = screenshotPath;
        }

        return state;
    }

    async captureDOMState(page) {
        return await page.evaluate(() => ({
            documentTitle: document.title,
            url: window.location.href,
            elementCounts: {
                total: document.getElementsByTagName('*').length,
                forms: document.forms.length,
                inputs: document.getElementsByTagName('input').length,
                textareas: document.getElementsByTagName('textarea').length,
                iframes: document.getElementsByTagName('iframe').length
            },
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            selectedElements: {
                activeElement: document.activeElement.tagName,
                focusedInput: document.activeElement.id || document.activeElement.name
            }
        }));
    }

    async logTestFailure(testName, error, page) {
        const failureLog = {
            testName,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack
            },
            browserLogs: this.logs,
            state: await this.captureState(page, { testName })
        };

        const logPath = path.join(
            this.options.logDir,
            `failure-${testName}-${Date.now()}.json`
        );

        await fs.writeFile(
            logPath, 
            JSON.stringify(failureLog, null, 2)
        );

        debug('Test failure logged:', logPath);
        return logPath;
    }

    async monitorNetworkActivity(page) {
        const requests = new Map();
        
        page.on('request', request => {
            requests.set(request.url(), {
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: Date.now(),
                resourceType: request.resourceType()
            });
        });

        page.on('requestfailed', request => {
            const req = requests.get(request.url());
            if (req) {
                req.failed = true;
                req.failureText = request.failure().errorText;
            }
        });

        page.on('response', response => {
            const req = requests.get(response.url());
            if (req) {
                req.status = response.status();
                req.responseHeaders = response.headers();
            }
        });

        return requests;
    }

    logConsole(msg) {
        this.logs.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: Date.now()
        });
    }

    async setupPageDebug(page) {
        // Monitor console output
        page.on('console', msg => this.logConsole(msg));
        
        // Monitor network activity
        const networkActivity = await this.monitorNetworkActivity(page);

        // Monitor JavaScript errors
        page.on('pageerror', error => {
            this.logs.push({
                type: 'error',
                text: error.message,
                stack: error.stack,
                timestamp: Date.now()
            });
        });

        return {
            getNetworkActivity: () => Array.from(networkActivity.values()),
            getConsoleLogs: () => [...this.logs]
        };
    }

    async analyzeTestFailure(error, page, testContext) {
        const analysis = {
            error: {
                message: error.message,
                stack: error.stack
            },
            context: testContext,
            dom: await this.captureDOMState(page),
            networkActivity: await page.evaluate(() => {
                const performance = window.performance;
                return {
                    timing: performance.timing.toJSON(),
                    navigation: performance.navigation.toJSON(),
                    entries: performance.getEntriesByType('resource').map(entry => entry.toJSON())
                };
            }),
            console: this.logs
        };

        // Save analysis
        const analysisPath = path.join(
            this.options.logDir,
            `analysis-${Date.now()}.json`
        );
        
        await fs.writeFile(
            analysisPath,
            JSON.stringify(analysis, null, 2)
        );

        return {
            analysisPath,
            summary: this.generateFailureSummary(analysis)
        };
    }

    generateFailureSummary(analysis) {
        const summary = [];

        // Error information
        summary.push(`Error: ${analysis.error.message}`);

        // DOM state issues
        const { dom } = analysis;
        if (dom.elementCounts.total === 0) {
            summary.push('Warning: No DOM elements found');
        }
        if (dom.elementCounts.iframes > 0) {
            summary.push(`Note: ${dom.elementCounts.iframes} iframes present`);
        }

        // Network issues
        const failedRequests = analysis.networkActivity.entries
            .filter(entry => entry.duration > 5000 || entry.transferSize === 0);
        if (failedRequests.length > 0) {
            summary.push(`Warning: ${failedRequests.length} potentially failed requests`);
        }

        // Console errors
        const errors = analysis.console
            .filter(log => log.type === 'error')
            .map(log => log.text);
        if (errors.length > 0) {
            summary.push('Console Errors:');
            errors.forEach(error => summary.push(`  - ${error}`));
        }

        return summary.join('\n');
    }
}

module.exports = DebugUtils;