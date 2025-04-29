const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const TestReporter = require('./testReporter');

// Maximum number of parallel workers
const MAX_WORKERS = Math.max(1, os.cpus().length - 1);

// Test dependencies graph
const TEST_DEPENDENCIES = {
    'login.test.js': [],
    'ruleMatching.test.js': ['login.test.js'],
    'headerFooter.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'commerceRules.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'configurationRules.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'documentDesigner.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'stylesheets.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'interfaces.test.js': ['login.test.js', 'ruleMatching.test.js'],
    'commerceActions.test.js': ['login.test.js', 'ruleMatching.test.js']
};

class TestOrchestrator {
    constructor() {
        this.completedTests = new Set();
        this.runningTests = new Set();
        this.results = new Map();
        this.workers = new Map();
        this.reporter = new TestReporter();
    }

    canRunTest(testFile) {
        const dependencies = TEST_DEPENDENCIES[testFile] || [];
        return dependencies.every(dep => this.completedTests.has(dep));
    }

    getAvailableTests(pendingTests) {
        return pendingTests.filter(test => 
            !this.runningTests.has(test) && 
            this.canRunTest(test)
        );
    }

    async runTest(testFile) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(path.join(__dirname, 'testWorker.js'), {
                workerData: { testFile }
            });

            this.workers.set(testFile, worker);
            this.runningTests.add(testFile);

            worker.on('message', (result) => {
                this.results.set(testFile, result);
                this.completedTests.add(testFile);
                this.runningTests.delete(testFile);
                this.workers.delete(testFile);
                resolve(result);
            });

            worker.on('error', (error) => {
                console.error(`Error in ${testFile}:`, error);
                this.runningTests.delete(testFile);
                this.workers.delete(testFile);
                reject(error);
            });
        });
    }

    async runTestsInParallel(testFiles) {
        await this.reporter.init();
        const pendingTests = [...testFiles];
        const results = [];

        while (pendingTests.length > 0 || this.runningTests.size > 0) {
            while (this.workers.size < MAX_WORKERS && pendingTests.length > 0) {
                const availableTests = this.getAvailableTests(pendingTests);
                if (availableTests.length === 0) break;

                const testFile = availableTests[0];
                const index = pendingTests.indexOf(testFile);
                pendingTests.splice(index, 1);

                try {
                    const result = await this.runTest(testFile);
                    this.reporter.addTestResult({ testFile, ...result });
                    results.push({ testFile, ...result });
                } catch (error) {
                    const errorResult = { 
                        testFile, 
                        passed: false, 
                        failureMessages: [error.message] 
                    };
                    this.reporter.addTestResult(errorResult);
                    results.push(errorResult);
                }
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await this.reporter.saveReports();
        this.reporter.printSummary();
        return results;
    }

    async cleanup() {
        // Terminate any running workers
        for (const [testFile, worker] of this.workers.entries()) {
            console.log(`Terminating worker for ${testFile}`);
            worker.terminate();
        }
    }

    generateReport(results) {
        // This method is now handled by TestReporter
        return this.reporter.printSummary();
    }
}

module.exports = TestOrchestrator;