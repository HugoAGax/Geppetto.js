module.exports = class ResultImages {
    constructor(params) {
        Object.assign(this, params);
        this.name = this.testName();
    }

    createTestImage(page, screenshots, name) {
        return Promise.all(screenshots.map(ss => {
            return screenshotDOMElement(page, {
                path: `./results/${name}/element(${ss.element}).png`,
                selector: ss.element,
                padding: 0
            });
        }));
    }
}

async function screenshotDOMElement(page, opts = {}) {
    const padding = 'padding' in opts ? opts.padding : 0;
    const path = 'path' in opts ? opts.path : null;
    const selector = opts.selector;

    if (!selector)
        throw Error('Please provide a selector.');

    const rect = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element)
            return null;
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
    }, selector);

    if (!rect)
        throw Error(`Could not find element that matches selector: ${selector}.`);

    return await page.screenshot({
        path,
        clip: {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
        }
    });

}