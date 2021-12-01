const puppeteer = require('puppeteer');
const fs = require('mz/fs');
const colors = require('colors');
const Test = require('./classes/test.js');

var processArgs = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(processArgs[0]));
const testsToRun = config.tests;
const puppeteerConfig = config.puppeteerConfig;


async function createBrowserInstance(config) {
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport(config.viewport);
        console.log(`---> Go To :: ${config.url}`.white);
        await page.goto(config.url);
        console.log(`---> Fullpage Screenshot`.magenta);
        // await page.screenshot({
        //     path: `./results/${config.name}/example.png`
        // });


        if (config.screenshots !== null) {
            console.log(`---> Element Screenshot :: ${config.screenshots[0].element}`.cyan);
            await createTestImage(page, config.screenshots, config.name);
        }

    } catch {
        console.error(err.message);
    } finally {
        await browser.close();
    }
};

function createTestImage(page, screenshots, name) {
    return Promise.all(screenshots.map(ss => {
        return screenshotDOMElement(page, {
            path: `./results/${name}/element(${ss.element}).png`,
            selector: ss.element,
            padding: 0
        });
    }));
}

function createResultDirectory(name) {
    console.log('name', name);
    var dir = `./results/${name}`;

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

async function createTestRun(test) {
    var currentTest = new Test(test);
    console.log(`Current Test :: ${currentTest.name}`.black.bgGreen);
    createResultDirectory(currentTest.name);
    await createBrowserInstance(currentTest);
    console.log(`Ended Test :: ${currentTest.name}`.black.bgRed);
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

async function runTests(testsToRun) {
    for (const run of testsToRun) {
        await createTestRun(run);
    }
}
runTests(testsToRun);

async function pHandler() {
    try {
        const data = await promise;
        return [data, null];
    } catch (err) {
        console.error(err);
        return [null, err]
    }
}