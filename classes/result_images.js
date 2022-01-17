export default class ResultImages {
    constructor(params) {
        // console.log(('new Result Images FOR ' + params.name + '\n'));
        Object.assign(this, params);
    }

    createTestImages(page = this.page, screenshots = this.screenshots, name = this.name) {
        const resultImages = this;

        return Promise.all(screenshots.map(ss => {
            console.log(`\tElement Screenshot :: ${ss.element}`, ss.event);

            if (ss.event === undefined) {
                return resultImages.screenshotDOMElement(page, {
                    path: `./results/${name}/element(${ss.element}).png`,
                    selector: ss.element
                });
            } else {
                return resultImages.waitForEvent(ss.event, 25, page, ss.element);
                // return resultImages._handleScreenshot({
                //     page: page,
                //     name: name,
                //     path: `./results/${name}/element(${ss.element}).png`,
                //     event: ss.event,
                //     element: ss.element
                // });
            }
        }));
    }

    async _handleScreenshot(opts) {
        console.log('OPTS', opts);
        var element = opts.element;
        elementInPage = await opts.page.evaluate((element) => {
            const item = document.querySelector(element);
            console.log('ELM', item);

            if (!item) return null;

            item.on(opts.event, () => {
                return resultImages.screenshotDOMElement(page, {
                    path: opts.path,
                    selector: opts.element
                });
            });

            return item;
        });

        if (!elementInPage) {
            throw Error(`Could not find element that matches selector: ${opts.element}.`);
        }


        return;
        // console.log('ELM', elm);

        // if (elm === null) return;

        // elm.on(opts.event, () => {
        //     return resultImages.screenshotDOMElement(page, {
        //         path: opts.path,
        //         selector: opts.element
        //     });
        // });
    }

    async screenshotDOMElement(page, opts = {}) {
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
    
        if (!rect) {
            throw Error(`Could not find element that matches selector: ${selector}.`);
        }

        if (rect.width < 1 || rect.height < 1) {
            console.log('\n\t\tSize is not valid');
            return;
        }
    
        return await page.screenshot({
            path,
            clip: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            }
        });
    
    }

    async waitForEvent(eventName, seconds, page, selector) {
        seconds = seconds || 30;
    
        return Promise.race([
            page.evaluate((eventName, selector) => {
                return new Promise((resolve, reject) => {
                    const element = document.querySelector(selector);
                    if (!element) return null;
                    element.addEventListener(eventName, e => {
                        resolve(e);
                    });
                });
            }, (eventName, selector)),
            page.waitForTimeout(seconds * 1000)
        ]).then(e => console.log('COMPLETED', e))
            .catch(e => console.log('ERRRO FIRED', e));;
    }
}
