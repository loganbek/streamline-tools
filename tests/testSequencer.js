const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  // Time to wait between test suites
  TEST_SUITE_DELAY = 3000; // 3 seconds between test files
  lastTestTime = 0;

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sort(tests) {
    // First sort tests using the parent class's sorting
    const sortedTests = await super.sort(tests);

    // Wait if needed before returning tests
    const now = Date.now();
    const timeSinceLastTest = now - this.lastTestTime;
    if (this.lastTestTime > 0 && timeSinceLastTest < this.TEST_SUITE_DELAY) {
      await this.sleep(this.TEST_SUITE_DELAY - timeSinceLastTest);
    }
    this.lastTestTime = Date.now();

    // Sort puppeteer tests to run after unit tests
    return sortedTests.sort((testA, testB) => {
      const isPuppeteerA = testA.path.includes('puppeteer');
      const isPuppeteerB = testB.path.includes('puppeteer');

      if (isPuppeteerA === isPuppeteerB) {
        return 0; // Maintain existing order within each group
      }
      return isPuppeteerA ? 1 : -1; // Run puppeteer tests last
    });
  }

  getOrderForTest(testPath) {
    // Define test execution order based on categories
    if (testPath.includes('extension.test.js')) return 1;
    if (testPath.includes('login.test.js')) return 2;
    if (testPath.includes('config')) return 3;
    if (testPath.includes('commerce')) return 4;
    if (testPath.includes('interfaces')) return 5;
    if (testPath.includes('stylesheets')) return 6;
    if (testPath.includes('documents')) return 7;
    if (testPath.includes('utils')) return 8;
    return 100; // Other tests run last
  }

  // Add method to track test completion
  async shard(tests, { shardIndex, shardCount }) {
    const sortedTests = this.sort(tests);
    const shardSize = Math.ceil(sortedTests.length / shardCount);
    const shardStart = shardSize * shardIndex;
    const shardEnd = shardStart + shardSize;

    return sortedTests.slice(shardStart, shardEnd);
  }
}

module.exports = CustomSequencer;