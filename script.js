const puppeteer = require('puppeteer');
// const resemble = require('resemblejs');
const fs = require('mz/fs');
const colors = require('colors');

var processArgs = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(processArgs[0]));
const testsToRun = config.tests;
const puppeteerConfig = config.puppeteerConfig;


async function createBrowserInstance(config) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport(config.viewport);
    await page.goto(config.url);
    await page.waitForTimeout(5000);
    await page.screenshot({
        path: `./results/${config.name}/example.png`
    });
    console.log('---Screenshot SAVED!')

    await browser.close();
};

function createResultDirectory(name) {
    var dir = `./results/${name}`;

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

async function createTestRun(test) {
    var currentTest = new Test(test);
    // console.log('\x1b[36m%s\x1b[0m', 'Current Test :: ' + currentTest.testName);
    console.log(`Current Test :: ${currentTest.testName}`.black.bgGreen);
    createResultDirectory(currentTest.name);
    await createBrowserInstance(currentTest);
}

class Test {
    constructor(params) {
        this.name = params.name;
        this.url = params.url;
        this.auth = params.autenticate;
        this.viewport = params.viewport;
    }
    // Getter
    get testName() {
        const date = this.getCurrentDate();
        return `${this.name}_${date}`;
    }
    // Method
    getCurrentDate() {
        const d = new Date();
        return `${d.getMonth()}-${d.getDate()}-${d.getFullYear()}`;
    }
}
async function runTests(testsToRun) {
    for (const run of testsToRun) {
        await createTestRun(run);
    }
}
runTests(testsToRun);