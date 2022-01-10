export default class ResultImages {
    constructor(params) {
        // console.log(('new Result Images FOR ' + params.name + '\n'));
        Object.assign(this, params);
    }

    createTestImages(page = this.page, screenshots = this.screenshots, name = this.name) {
        const resultImages = this;

        return Promise.all(screenshots.map(ss => {
            // console.log(`\tElement Screenshot :: ${ss.element}`);
            return resultImages.screenshotDOMElement(page, {
                path: `./results/${name}/element(${ss.element}).png`,
                selector: ss.element,
                padding: 0
            });
        }));
    }

    async screenshotDOMElement(page, opts = {}) {
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
}
