// External Dependencies
const puppeteer = require('puppeteer');
const fs = require('mz/fs');
const colors = require('colors');
const lighthouse = require('lighthouse');

// Internal Modules
const Test = require('./classes/test.js');
const ResultImages = require('./classes/result_images.js');
const LighthouseTest = require('./classes/lighthouse_test.js');


const processArgs = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(processArgs[0]));
const testsToRun = config.tests;


async function createBrowserInstance(config) {
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions']
    });
        
    const page = await browser.newPage();
    await page.setViewport(config.viewport);
    await page.goto(config.url);

    console.log(('new Puppeteer Instance created \n' + config.url + '\n').underline.brightGreen);

    if (config.screenshots !== null) {
        var resultImagesInstance = new ResultImages({
            page: page, 
            name: config.name,
            screenshots: config.screenshots
        });
        await resultImagesInstance.createTestImages();
    }

    const lighthouseFlags = {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'info',
        maxWaitForLoad: 60 * 1000
    }

    var lighthouseInstance = new LighthouseTest({
        name: config.name,
        url: config.url,
        lighthouse: lighthouse,
        browser: browser,
        config: config.lighthouseConfig,
        flags: lighthouseFlags
    });

    await lighthouseInstance.runInstance();
    // .then((data) => console.log(data));
    await browser.close();
}

async function createTestRun(test) {
    var currentTest = new Test(test);
    console.log(colors.green('hello'));
    console.log(`\nTEST STARTED >>> ${currentTest.name}`.black.bgGreen);

    createResultDirectory(currentTest.name);
    await createBrowserInstance(currentTest);
    
    console.log(`\nTEST ENDED >>> ${currentTest.name}`.black.bgRed);
    console.log('\n');
}

function createResultDirectory(name) {
    var dir = `./results/${name}`;
    console.log('results will be output to... ./results/' + name + '\n');

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function runTests(testsToRun) {
    for (const run of testsToRun) {
        await createTestRun(run);
    }
}
runTests(testsToRun);
