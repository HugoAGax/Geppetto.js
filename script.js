// External Dependencies
import fs from "fs";
import chalk from "chalk";

// Internal Dependencies
import Summary from "./classes/summary.js";
import TestData from "./classes/test_data.js";
import TestManager from "./classes/test_manager.js";

const globalUserConfig = JSON.parse(fs.readFileSync(process.argv.slice(2)[0]));

class Geppetto {
  constructor(params) {
    this.name = params.name;
    this.testsToRun = params.testsToRun;
    this.controlData = params.controlData ? params.controlData : null;
    this.counter = 1;
  }

  init() {
    console.log(chalk.hex(`#FF00AE`)(`\nGeppetto.js v1.0`) + ` - Initialized`);
    this._initializeGlobalSummary();
    this.completeAllTests(this.testsToRun);
    return this;
  }

  _initializeGlobalSummary() {
    this.summary = new Summary({});
  }

  _storeSingleTestData(input) {
    this.summary.createSingleTestSummary(input.name, input.lighthouse);
  }

  async completeAllTests(testsToRun) {
    let currentTest;
    console.log(chalk.white(`${testsToRun.length} tests will be run\n`));

    for (const test of testsToRun) {
      test.pos = this.counter;
      test.total = testsToRun.length;

      currentTest = await this.completeSingleTest(test);
      this._storeSingleTestData(currentTest);
      this.counter++;
    }
    this._logTestsSummary();
  }

  async completeSingleTest(data) {
    const testData = new TestData(data);
    console.log(chalk.hex("#FFC300")(`Starting Test ---> ${testData.name}`));
    console.log(
      chalk
        .hex("#00FEC4")
        .italic(
          "results will be output to... ./results/" + testData.name + "\n"
        )
    );

    const test = new TestManager(testData);
    await test.runSingleTest();

    return {
      lighthouse: test.cwv,
      name: test.name,
    };
  }

  async _logTestsSummary() {
    console.log(chalk.hex(`#FF6725`)(`\nAll Tests CWVs Summary`));
    let summaryData = this.summary.createDataSummary();

    Object.keys(summaryData).forEach((section) => {
      let name = section
        .split(`-`)
        .map((str) => {
          return str.charAt(0).toUpperCase() + str.slice(1);
        })
        .join(` `);

      console.log(
        chalk.white(name) +
          ` | mean: ` +
          chalk.hex(`#33C7FF`)(summaryData[section].mean)
      );
    });

    console.log(chalk.hex(`#FF00AE`)(`\nGeppetto.js v1.0`) + ` - Ended\n`);
  }
}

new Geppetto({
  name: globalUserConfig.name,
  testsToRun: globalUserConfig.tests,
  controlData: globalUserConfig.controlData,
}).init();
