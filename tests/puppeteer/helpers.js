async function getExtensionId(browser) {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const targets = await browser.targets();
    const extensionTarget = targets.find(
      target => (target.type() === 'background_page' || target.type() === 'service_worker') && 
      target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      const extensionUrl = extensionTarget.url();
      const extensionId = extensionUrl.split('/')[2];
      return extensionId;
    }
    
    // Wait a bit before retrying with exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    attempts++;
  }
  
  throw new Error('Extension background page or service worker not found after ' + maxAttempts + ' attempts');
}

module.exports = { getExtensionId };