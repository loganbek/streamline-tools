async function globalTeardown(config) {
  console.log('Starting Playwright global teardown...');
  
  // Any cleanup operations can go here
  // For now, just log completion
  
  console.log('Playwright global teardown completed');
}

module.exports = globalTeardown;