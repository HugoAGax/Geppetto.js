const puppeteer = require('puppeteer-core');
// const resemble = require('resemblejs');
const fs = require('mz/fs');

var processArgs = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(processArgs[0]));
const testsToRun = config.tests;
const puppeteerConfig = config.puppeteerConfig;


// const runTest = (test) => {
//     console.log('Test Data :::', test.name);
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve();
//         }, 10000)
//     });
// };


const pipePromises = (ms) => (ms.reduceRight((f, g) => x => g(x).then(f)));
let urlNoParams;
let resultsArr = [];
let resultsMatrix = [];

let compareNum = 0;
let currentUrl;

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchDataPageBuilder = (dataUrl) => {
    console.log('DATA URLL ===>', dataUrl);
    return new Promise((resolve, reject) => {
        createBrowserInstance(dataUrl).then(resolve);
    });
};


const createBrowserInstance = async (dataUrl) => {
    const browser = await puppeteer.launch(puppeteerConfig.browser);
    const page = await browser.newPage();

    await page.setViewport(puppeteerConfig.viewport);
    // await page.authenticate({ 'username': 'admin', 'password': 'sugaristhenewfat' });
    await page.setDefaultNavigationTimeout(0);
    await page.goto(dataUrl.url);
    currentUrl = dataUrl.url;

    await page.evaluate(() => {
        window.scrollTo(0, 0);
        return null;
    });

    await timeout(10000)

    await page.screenshot({ path: 'stage-' + dataUrl.type + '.png' });
    await browser.close();
    console.log('TESTING END');
    return Promise.resolve();
};

const fetchPages = (pageUrls) => {
    return pipePromises(pageUrls.map((url) => {
        return async (previous) => {
            return Promise.resolve([].concat(previous)
                .concat([await fetchDataPageBuilder(url)]));
        };
    }));
};

const runTests = async (testsConfig) => {
    const dataPage = await fetchPages(testsConfig)([]);
    return Promise.resolve();
};
runTests(testsToRun);