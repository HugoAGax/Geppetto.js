// External Dependencies
import puppeteer from 'puppeteer';
import fs from 'fs';
import lighthouse from 'lighthouse';
import chalk from 'chalk';
import ora from 'ora';

// Internal Modules
import Test from './classes/test.js';
import ResultImages from './classes/result_images.js';
import LighthouseTest from './classes/lighthouse_test.js';
import Summary from './classes/summary.js';

const config = JSON.parse(fs.readFileSync(process.argv.slice(2)[0]));
const testsToRun = config.tests;

async function createBrowserInstance(config) {
    const testSpinner = ora({
        text: `Creating ${chalk.cyan('puppeteer.js browser instance')}...`,
        color: 'cyan',
        spinner: 'dots',
    }).start();

    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions']
    });
        
    const page = await browser.newPage();
    await page.setViewport(config.viewport);
    await page.goto(config.url);

    testSpinner.stopAndPersist({
        symbol: `${chalk.hex('#33C7FF')('✓')}`,
        text: `Created ${chalk.hex('#33C7FF')('puppeteer.js browser instance')}...`,
    }).start();

    if (config.screenshots !== null) {
        testSpinner.text = `Creating ${chalk.cyan('result images')}...`;

        var resultImagesInstance = new ResultImages({
            page: page, 
            name: config.name,
            screenshots: config.screenshots
        });
        await resultImagesInstance.createTestImages();
        
        testSpinner.stopAndPersist({
            symbol: `${chalk.hex('#33C7FF')('✓')}`,
            text: `Created ${chalk.hex('#33C7FF')('result images')}...`,
            color: 'yellow',
            spinner: 'dots',
        });
    }

    const lighthouseFlags = {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'silent',
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

    testSpinner.text =`Running ${chalk.cyan('lighthouse report')}...`;
    testSpinner.start();
    
    await lighthouseInstance.runInstance();
    
    testSpinner.stopAndPersist({
        symbol: `${chalk.hex('#33C7FF')('✓')}`,
        text: `Completed ${chalk.hex('#33C7FF')('lighthouse report')}...`,
        color: 'yellow',
        spinner: 'dots',
    });
    // .then((data) => console.log(data));
    await browser.close();

    testSpinner.clear().stop();
}

async function createTestRun(test) {
    var currentTest = new Test(test);
    console.log(chalk.hex('#FFC300')(`Starting Test ===> ${currentTest.name}`));

    createResultDirectory(currentTest.name);
    await createBrowserInstance(currentTest);
    
    console.log(chalk.hex('#FFC300')(`Ended Test ===> ${currentTest.name}\n`));
}

function createResultDirectory(name) {
    var dir = `./results/${name}`;
    console.log(chalk.hex('#00FEC4').italic('results will be output to... ./results/' + name + '\n'));

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function runTests(testsToRun) {
    console.log(chalk.hex('#FF00AE')('\nGeppetto.js v1.0') + ' - Initialized\n');
    
    for (const run of testsToRun) {
        await createTestRun(run);
    }

    console.log(chalk.hex('#FF00AE')('Geppetto.js v1.0') + ' - Ended\n');
}
runTests(testsToRun);
