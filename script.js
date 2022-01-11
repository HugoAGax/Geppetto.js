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

async function createBrowserInstance(config, curr, total) {
    let cwv; 
    const testSpinner = ora({
        prefixText:`(${curr}/${total})`,
        text: `Creating ${chalk.gray('puppeteer.js browser instance')}...`,
        color: 'white',
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
        testSpinner.text = `Creating ${chalk.gray('result images')}...`;

        var resultImagesInstance = new ResultImages({
            page: page, 
            name: config.name,
            screenshots: config.screenshots
        });
        await resultImagesInstance.createTestImages();
        
        testSpinner.stopAndPersist({
            symbol: `${chalk.hex('#33C7FF')('✓')}`,
            text: `Created ${chalk.hex('#33C7FF')('result images')}...`,
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
        outputsJson: config.lighthouseOutputsJson,
        config: config.lighthouseConfig,
        flags: lighthouseFlags
    });

    testSpinner.text =`Running ${chalk.gray('lighthouse report')}...`;
    testSpinner.start();
    
    await lighthouseInstance.runInstance().then((data) => cwv = data);
    
    testSpinner.stopAndPersist({
        symbol: `${chalk.hex('#33C7FF')('✓')}`,
        text: `Completed ${chalk.hex('#33C7FF')('lighthouse report')}...`,
        spinner: 'dots',
    });
    await browser.close();

    testSpinner.stopAndPersist({
        symbol: `${chalk.hex('#1BFF00')('✓')}`,
        text: `Completed ${chalk.hex('#1BFF00')('test run\n\n')}`,
        spinner: 'dots',
    });
    
    testSpinner.clear().stop();

    return cwv;
}

async function createTestRun(test, currentNum, total) {
    let currentTest = new Test(test);
    let result = {};

    console.log(chalk.hex('#FFC300')(`Starting Test ---> ${currentTest.name}`));

    createResultDirectory(currentTest.name);
    return await createBrowserInstance(currentTest, currentNum, total).then((output) => {
        result.lighthouse = output;
        result.name = currentTest.name;
        
        return result;
    });
}

function createResultDirectory(name) {
    var dir = `./results/${name}`;
    console.log(chalk.hex('#00FEC4').italic('results will be output to... ./results/' + name + '\n'));

    if (fs.existsSync(dir) === false) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function runTests(testsToRun) {
    let counter = 1;
    console.log(chalk.hex('#FF00AE')('\nGeppetto.js v1.0') + ' - Initialized');
    console.log(chalk.white(`${testsToRun.length} tests will be run\n`));

    var geppettoSummary = new Summary({});
    
    for (const run of testsToRun) {
        await createTestRun(run, counter, testsToRun.length).then(res => {
            geppettoSummary.createSingleTestSummary(res.name, res.lighthouse);
        });
        counter++;
    }

    console.log(chalk.hex('#FF6725')('\nAll Tests CWVs Summary'));

    let summaryData = geppettoSummary.createDataSummary();
    Object.keys(summaryData).forEach(section => {
        let name = section.split('-').map(str => {
            return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(' ');

        console.log(chalk.white(name) + ' | mean: ' + chalk.hex('#33C7FF')(summaryData[section].mean));
    });

    console.log(chalk.hex('#FF00AE')('\nGeppetto.js v1.0') + ' - Ended\n');
}
runTests(testsToRun);
