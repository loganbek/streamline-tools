async function getExtensionId(browser) {
  // Wait for the extension background page to load
  const targets = await browser.targets();
  const backgroundPageTarget = targets.find(
    target => target.type() === 'background_page' && 
    target.url().includes('chrome-extension://')
  );
  
  if (!backgroundPageTarget) {
    throw new Error('Extension background page not found');
  }
  
  const extensionUrl = backgroundPageTarget.url();
  const extensionId = extensionUrl.split('/')[2];
  return extensionId;
}

module.exports = { getExtensionId };