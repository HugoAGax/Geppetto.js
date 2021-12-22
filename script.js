const puppeteer = require('puppeteer');
const fs = require('mz/fs');
const colors = require('colors');
const lighthouse = require('lighthouse');

const Test = require('./classes/test.js');
// const ResultImages = require('./classes/result_images.js');
// const LighthouseTest = require('./classes/lighthouse_test.js');

var processArgs = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(processArgs[0]));
const testsToRun = config.tests;
const puppeteerConfig = config.puppeteerConfig;


async function createBrowserInstance(config) {
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions']
    });

    // try {
        const page = await browser.newPage();
        await page.setViewport(config.viewport);
        console.log(`---> Go To :: ${config.url}`.white);
        await page.goto(config.url);
        console.log(`---> Fullpage Screenshot`.magenta);
        await page.screenshot({
            path: `./results/${config.name}/example.png`
        });

        const lighthouseFlags = {
            port: (new URL(browser.wsEndpoint())).port,
            output: 'json',
            logLevel: 'info',
            maxWaitForLoad: 60 * 1000
        }

        if (config.screenshots !== null) {
            console.log(`---> Element Screenshot :: ${config.screenshots[0].element}`.cyan);
            await createTestImage(page, config.screenshots, config.name);
        }

        await lighthouse(config.url, lighthouseFlags, getLighthouseConfig());

    // } catch {
    //     console.error(err);
    // } finally {
        await browser.close();
    // }
}

function createTestImage(page, screenshots, name) {
    return Promise.all(screenshots.map(ss => {
        return screenshotDOMElement(page, {
            path: `./results/${name}/element(${ss.element}).png`,
            selector: ss.element,
            padding: 0
        });
    }));
}

function getLighthouseConfig(options) {
    let lighthouseConfig = {
        extends: 'lighthouse:default',
        settings: {
            onlyCategories: ['performance'],
            //maxWaitForLoad: 10000
        }
    }

    // if (options.desktop) {
        // Settings taken from https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/constants.js
        Object.assign(lighthouseConfig.settings, {
            formFactor: 'desktop',
            throttling: {
                rttMs: 40,
                throughputKbps: 10 * 1024,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0, // 0 means unset
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              },
            screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false,
              },
            emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4420.0 Safari/537.36 Chrome-Lighthouse'
        })
    // }

    return lighthouseConfig
}

function getPuppeteerConfig (options) {
    let puppeteerConfig = {
        headless: false,
        devtools: true
    }
    if (options.userDataDir) {
        puppeteerConfig.userDataDir = options.userDataDir;
        //'~/Library/Application\ Support/Google/Chrome\ Canary/'
    }
    if (options.executablePath) {
        puppeteerConfig.executablePath = options.executablePath;
        //'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    }
    if (options.desktop) {
        puppeteerConfig.defaultViewport = {
            width: 1920,
            height: 1080
        }
    }
    return puppeteerConfig;
}



function createResultDirectory(name) {
    console.log('name', name);
    var dir = `./results/${name}`;

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

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