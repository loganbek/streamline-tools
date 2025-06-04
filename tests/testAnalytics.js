const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

class TestAnalytics {
    constructor(options = {}) {
        this.options = {
            historyDir: 'test-history',
            performanceThreshold: 5000, // 5 seconds
            flakynessThreshold: 0.2, // 20% failure rate
            ...options
        };
        
        this.currentRun = {
            startTime: Date.now(),
            tests: new Map(),
            performance: new Map(),
            patterns: new Map()
        };
    }

    async init() {
        await this.ensureHistoryDirectory();
        await this.loadTestHistory();
    }

    async ensureHistoryDirectory() {
        try {
            await fs.access(this.options.historyDir);
        } catch {
            await fs.mkdir(this.options.historyDir, { recursive: true });
        }
    }

    async loadTestHistory() {
        const files = await fs.readdir(this.options.historyDir);
        this.history = [];
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(
                    path.join(this.options.historyDir, file),
                    'utf-8'
                );
                this.history.push(JSON.parse(content));
            }
        }

        // Sort by date
        this.history.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    recordTestExecution(testFile, result) {
        const testData = this.currentRun.tests.get(testFile) || {
            executions: [],
            patterns: new Set()
        };

        testData.executions.push({
            timestamp: Date.now(),
            duration: result.duration,
            passed: result.passed,
            error: result.error,
            attempt: result.attempt || 1
        });

        // Record any identified patterns
        if (!result.passed) {
            const pattern = this.identifyFailurePattern(result.error);
            testData.patterns.add(pattern);
            
            // Update global patterns
            const patternData = this.currentRun.patterns.get(pattern) || {
                count: 0,
                tests: new Set()
            };
            patternData.count++;
            patternData.tests.add(testFile);
            this.currentRun.patterns.set(pattern, patternData);
        }

        this.currentRun.tests.set(testFile, testData);
    }

    recordPerformanceData(testFile, metrics) {
        this.currentRun.performance.set(testFile, {
            timestamp: Date.now(),
            ...metrics
        });
    }

    identifyFailurePattern(error) {
        if (!error) return 'unknown';

        // Common patterns to identify
        const patterns = [
            {
                pattern: /timeout/i,
                name: 'timeout'
            },
            {
                pattern: /element not found/i,
                name: 'element-not-found'
            },
            {
                pattern: /network error/i,
                name: 'network'
            },
            {
                pattern: /assertion failed/i,
                name: 'assertion'
            },
            {
                pattern: /undefined is not a function/i,
                name: 'type-error'
            }
        ];

        for (const { pattern, name } of patterns) {
            if (pattern.test(error.message)) {
                return name;
            }
        }

        return 'other';
    }

    async analyzeTestRun() {
        const analysis = {
            date: new Date().toISOString(),
            duration: Date.now() - this.currentRun.startTime,
            summary: this.generateSummary(),
            performance: this.analyzePerformance(),
            patterns: this.analyzePatterns(),
            recommendations: await this.generateRecommendations()
        };

        // Save analysis
        const fileName = `analysis-${Date.now()}.json`;
        await fs.writeFile(
            path.join(this.options.historyDir, fileName),
            JSON.stringify(analysis, null, 2)
        );

        return analysis;
    }

    generateSummary() {
        const summary = {
            total: 0,
            passed: 0,
            failed: 0,
            flaky: 0,
            avgDuration: 0,
            totalDuration: 0
        };

        for (const [testFile, data] of this.currentRun.tests) {
            const executions = data.executions;
            const lastExecution = executions[executions.length - 1];
            
            summary.total++;
            if (lastExecution.passed) summary.passed++;
            else summary.failed++;
            
            if (executions.length > 1) {
                const failureRate = executions.filter(e => !e.passed).length / executions.length;
                if (failureRate >= this.options.flakynessThreshold) {
                    summary.flaky++;
                }
            }

            summary.totalDuration += lastExecution.duration;
        }

        summary.avgDuration = summary.totalDuration / summary.total;
        return summary;
    }

    analyzePerformance() {
        const slowTests = [];
        const trends = new Map();

        for (const [testFile, data] of this.currentRun.performance) {
            if (data.duration > this.options.performanceThreshold) {
                slowTests.push({
                    file: testFile,
                    duration: data.duration,
                    metrics: data
                });
            }

            // Analyze trends over time
            const historicalData = this.history
                .map(h => h.performance[testFile])
                .filter(Boolean);

            if (historicalData.length > 0) {
                const trend = {
                    mean: this.calculateMean(historicalData.map(d => d.duration)),
                    stdDev: this.calculateStdDev(historicalData.map(d => d.duration)),
                    trend: this.calculateTrend(historicalData.map(d => d.duration))
                };
                trends.set(testFile, trend);
            }
        }

        return { slowTests, trends };
    }

    analyzePatterns() {
        const patterns = {};
        
        for (const [pattern, data] of this.currentRun.patterns) {
            patterns[pattern] = {
                count: data.count,
                tests: Array.from(data.tests),
                frequency: data.count / this.currentRun.tests.size
            };
        }

        return patterns;
    }

    async generateRecommendations() {
        const recommendations = [];
        const { summary } = this.generateSummary();
        const { slowTests, trends } = this.analyzePerformance();
        const patterns = this.analyzePatterns();

        // Performance recommendations
        if (slowTests.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: `${slowTests.length} tests exceed the performance threshold`,
                details: slowTests.map(test => `${test.file}: ${test.duration}ms`)
            });
        }

        // Flakiness recommendations
        if (summary.flaky > 0) {
            recommendations.push({
                type: 'reliability',
                priority: 'high',
                message: `${summary.flaky} tests show signs of flakiness`,
                details: Array.from(this.currentRun.tests.entries())
                    .filter(([_, data]) => {
                        const executions = data.executions;
                        const failureRate = executions.filter(e => !e.passed).length / executions.length;
                        return failureRate >= this.options.flakynessThreshold;
                    })
                    .map(([file]) => file)
            });
        }

        // Pattern-based recommendations
        for (const [pattern, data] of Object.entries(patterns)) {
            if (data.frequency > 0.1) { // More than 10% of tests
                recommendations.push({
                    type: 'pattern',
                    priority: data.frequency > 0.3 ? 'high' : 'medium',
                    message: `Common failure pattern: ${pattern}`,
                    details: data.tests
                });
            }
        }

        return recommendations;
    }

    // Utility methods
    calculateMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateStdDev(values) {
        const mean = this.calculateMean(values);
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        return Math.sqrt(this.calculateMean(squareDiffs));
    }

    calculateTrend(values) {
        if (values.length < 2) return 'insufficient-data';
        
        const first = values[0];
        const last = values[values.length - 1];
        const change = ((last - first) / first) * 100;
        
        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }

    async generateReport() {
        const analysis = await this.analyzeTestRun();
        
        return `
Test Run Analysis Report
=======================

Summary
-------
Total Tests: ${analysis.summary.total}
Passed: ${analysis.summary.passed}
Failed: ${analysis.summary.failed}
Flaky Tests: ${analysis.summary.flaky}
Average Duration: ${analysis.summary.avgDuration.toFixed(2)}ms

Performance
-----------
Slow Tests: ${analysis.performance.slowTests.length}
${analysis.performance.slowTests.map(test => 
    `- ${test.file}: ${test.duration}ms`
).join('\n')}

Failure Patterns
---------------
${Object.entries(analysis.patterns).map(([pattern, data]) =>
    `${pattern}: ${data.count} occurrences (${(data.frequency * 100).toFixed(1)}%)`
).join('\n')}

Recommendations
--------------
${analysis.recommendations.map(rec =>
    `[${rec.priority.toUpperCase()}] ${rec.message}\n${rec.details.map(d => `  - ${d}`).join('\n')}`
).join('\n\n')}
`;
    }
}

module.exports = TestAnalytics;