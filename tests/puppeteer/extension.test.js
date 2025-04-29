const { TestHelper } = require('./helpers');

describe('Chrome Extension Tests', () => {
    let helper;
    let extensionId;

    beforeAll(async () => {
        helper = new TestHelper();
        await helper.init();
        // Get extension ID from the first extension target
        const targets = await helper.browser.targets();
        const extensionTarget = targets.find(target => target.type() === 'background_page');
        extensionId = extensionTarget.url().split('/')[2];
    });

    afterAll(async () => {
        await helper.cleanup();
    });

    test('should load extension options page', async () => {
        await helper.page.goto(`chrome-extension://${extensionId}/options/options.html`);
        
        const title = await helper.page.title();
        expect(title).toBe('Streamline CPQ Tools Options');

        // Verify essential options UI elements
        const saveButton = await helper.page.$('#save');
        const optionsForm = await helper.page.$('form');
        
        expect(saveButton).toBeTruthy();
        expect(optionsForm).toBeTruthy();
    });

    test('should load main popup interface', async () => {
        await helper.page.goto(`chrome-extension://${extensionId}/popup/popup.html`);

        // Verify essential popup UI elements
        const unloadButton = await helper.page.$('#unloadBML');
        const loadButton = await helper.page.$('#loadBML');
        const optionsButton = await helper.page.$('#options');

        expect(unloadButton).toBeTruthy();
        expect(loadButton).toBeTruthy();
        expect(optionsButton).toBeTruthy();

        // Verify button states
        const isUnloadDisabled = await helper.page.evaluate(button => button.disabled, unloadButton);
        const isLoadDisabled = await helper.page.evaluate(button => button.disabled, loadButton);
        
        expect(isUnloadDisabled).toBe(true);
        expect(isLoadDisabled).toBe(true);
    });

    test('should validate options page interface', async () => {
        await helper.page.goto(`chrome-extension://${extensionId}/options/options.html`);

        // Verify options page elements
        const debugToggle = await helper.page.$('#debugMode');
        const autoSaveToggle = await helper.page.$('#autoSave');
        const saveButton = await helper.page.$('#save');

        expect(debugToggle).toBeTruthy();
        expect(autoSaveToggle).toBeTruthy();
        expect(saveButton).toBeTruthy();
    });
});