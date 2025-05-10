const fs = require('fs').promises;
const path = require('path');
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const DIFF_DIR = path.join(__dirname, 'screenshots', 'diff');

async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function compareScreenshots(actualImage, expectedPath, diffPath) {
    const actual = PNG.sync.read(actualImage);
    let expected;

    try {
        const expectedBuffer = await fs.readFile(expectedPath);
        expected = PNG.sync.read(expectedBuffer);
    } catch (error) {
        // Save actual as new reference if no existing reference
        await fs.writeFile(expectedPath, actualImage);
        return { 
            diffPixels: 0, 
            newReference: true 
        };
    }

    const { width, height } = actual;
    const diff = new PNG({ width, height });
    
    const diffPixels = pixelmatch(
        actual.data,
        expected.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
    );

    if (diffPixels > 0) {
        await fs.writeFile(diffPath, PNG.sync.write(diff));
    }

    return { 
        diffPixels,
        newReference: false 
    };
}

async function takeScreenshot(page, name) {
    await ensureDirectoryExists(SCREENSHOT_DIR);
    await ensureDirectoryExists(DIFF_DIR);

    const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
    const diffPath = path.join(DIFF_DIR, `${name}-diff.png`);

    // Take screenshot with consistent viewport size
    await page.setViewport({ width: 1920, height: 1080 });
    const image = await page.screenshot({ 
        fullPage: true,
        omitBackground: true
    });

    const { diffPixels, newReference } = await compareScreenshots(
        image,
        screenshotPath,
        diffPath
    );

    return {
        diffPixels,
        newReference,
        screenshotPath,
        diffPath
    };
}

// Jest matcher for visual regression
expect.extend({
    async toMatchScreenshot(page, name) {
        const { diffPixels, newReference, screenshotPath, diffPath } = 
            await takeScreenshot(page, name);

        const pass = diffPixels === 0;
        const message = () => {
            if (newReference) {
                return `New screenshot reference created at: ${screenshotPath}`;
            }
            return pass
                ? `Screenshot matches reference: ${screenshotPath}`
                : `Screenshot differs from reference by ${diffPixels} pixels.\n` +
                  `Reference: ${screenshotPath}\n` +
                  `Diff: ${diffPath}`;
        };

        return { pass, message };
    }
});

module.exports = {
    takeScreenshot,
    compareScreenshots
};