// External Dependencies
import puppeteer from "puppeteer";
import fs from "fs";
import lighthouse from "lighthouse";
import chalk from "chalk";
import ora from "ora";

// Internal Modules
import Test from "./classes/test.js";
import ResultImages from "./classes/result_images.js";
import LighthouseTest from "./classes/lighthouse_test.js";
import Summary from "./classes/summary.js";
import ImageComparison from "./classes/image_comparison.js";

const config = JSON.parse(fs.readFileSync(process.argv.slice(2)[0]));
const controlData = config.control ? config.control : null;
const testsToRun = config.tests;

runAllTests(testsToRun);

async function createBrowserInstance(config, curr, total) {
  let cwv, resultImagesInstance, lighthouseInstance;
  const testSpinner = ora({
    prefixText: `(${curr}/${total})`,
    text: `Creating ${chalk.gray("puppeteer.js browser instance")}...`,
    color: "white",
    spinner: "dots",
  }).start();

  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
    devtools: false,
  });

  const page = await browser.newPage();
  await page.setViewport(config.viewport);
  await page.authenticate(config.authenticate);
  await page.goto(config.url);

  testSpinner
    .stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Created ${chalk.hex("#33C7FF")(
        "puppeteer.js browser instance"
      )}...`,
    })
    .start();

  if (config.screenshots !== undefined) {
    testSpinner.text = `Creating ${chalk.gray("result images")}...`;

    resultImagesInstance = new ResultImages({
      page: page,
      name: config.name,
      screenshots: config.screenshots,
    });
    await resultImagesInstance.createTestImages();

    testSpinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Created ${chalk.hex("#33C7FF")("result images")}...`,
      spinner: "dots",
    });
  }

  if (config.lighthouseConfig !== undefined) {
    const lighthouseFlags = {
      port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "silent",
      maxWaitForLoad: 60 * 1000,
    };

    lighthouseInstance = new LighthouseTest({
      name: config.name,
      url: config.url,
      lighthouse: lighthouse,
      browser: browser,
      outputsJson: config.lighthouseOutputsJson,
      config: config.lighthouseConfig,
      flags: lighthouseFlags,
    });

    testSpinner.text = `Running ${chalk.gray("lighthouse report")}...`;
    testSpinner.start();

    await lighthouseInstance.runInstance().then((data) => (cwv = data));

    testSpinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Completed ${chalk.hex("#33C7FF")("lighthouse report")}...`,
      spinner: "dots",
    });
  }

  await browser.close();

  if (controlData !== null) {
    testSpinner.text = `Running ${chalk.gray("comparison with Resemble.js")}...`;
    testSpinner.start();

    await compareRunToControl("./results/" + config.name);
    testSpinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Completed ${chalk.hex("#33C7FF")("Resemble.js comparison")}...`,
      spinner: "dots",
    });
  }

  testSpinner.stopAndPersist({
    symbol: `${chalk.hex("#1BFF00")("✓")}`,
    text: `Completed ${chalk.hex("#1BFF00")("test run\n\n")}`,
    spinner: "dots",
  });

  testSpinner.clear().stop();

  return cwv;
}

async function runSingleTest(test, currentNum, total) {
  let currentTest,
    result = {};
  test.fs = fs;
  currentTest = new Test(test);

  console.log(chalk.hex("#FFC300")(`Starting Test ---> ${currentTest.name}`));
  console.log(
    chalk
      .hex("#00FEC4")
      .italic(
        "results will be output to... ./results/" + currentTest.name + "\n"
      )
  );

  let browserSimulationData = await createBrowserInstance(currentTest, currentNum, total);

  return {
    lighthouse: browserSimulationData,
    name: currentTest.name
  };
}

async function compareRunToControl(path) {
    let imageCompare = new ImageComparison({
      controlPath: controlData.path,
      currentPath: path
    })
    await imageCompare.findMatchingFiles();
}

async function runAllTests(testsToRun) {
  let counter = 1;
  console.log(chalk.hex("#FF00AE")("\nGeppetto.js v1.0") + " - Initialized");
  console.log(chalk.white(`${testsToRun.length} tests will be run\n`));

  var geppettoSummary = new Summary({});

  for (const test of testsToRun) {
    await runSingleTest(test, counter, testsToRun.length).then((res) => {
      geppettoSummary.createSingleTestSummary(res.name, res.lighthouse);
    });
    counter++;
  }

  console.log(chalk.hex("#FF6725")("\nAll Tests CWVs Summary"));

  let summaryData = geppettoSummary.createDataSummary();
  fs.writeFile(
    "summarized_geppetto_run.json",
    JSON.stringify(summaryData),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          chalk
            .hex("#00FEC4")
            .italic("Summary Data JSON saved on ./summarized_geppetto_run.json")
        );
      }
    }
  );

  fs.writeFile(
    "all_tests_data.json",
    JSON.stringify(geppettoSummary.getResultsData()),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          chalk
            .hex("#00FEC4")
            .italic("All Tests Data JSON saved on ./all_tests_data.json")
        );
      }
    }
  );

  Object.keys(summaryData).forEach((section) => {
    let name = section
      .split("-")
      .map((str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      })
      .join(" ");

    console.log(
      chalk.white(name) +
        " | mean: " +
        chalk.hex("#33C7FF")(summaryData[section].mean)
    );
  });

  console.log(chalk.hex("#FF00AE")("\nGeppetto.js v1.0") + " - Ended\n");
}
