// External Dependencies
import chalk from "chalk";
import ora from "ora";
import puppeteer from "puppeteer";

// Internal Modules
import ResultImages from "./result_images.js";
import LighthouseTest from "./lighthouse_test.js";
import ImageComparison from "./image_comparison.js";

class TestManager {
  constructor(params) {
    Object.assign(this, params);
    this.pos = params.pos;
    this.total = params.total;
  }

  async runSingleTest() {
    await this._initializeBrowser();
    if (this.screenshots !== undefined) {
      await this.createBrowserScreenshots();
    }
    if (this.lighthouseConfig !== undefined) {
      await this._runLighthouseReport();
    }
    if (this.controlData !== null) {
      await this._compareToControlImages();
    }
    await this._terminateBrowser();
  }

  async _initializeBrowser() {
    this.spinner = ora({
      prefixText: `(${this.pos}/${this.total})`,
      text: `Creating ${chalk.gray("puppeteer.js browser instance")}...`,
      color: "white",
      spinner: "dots",
    }).start();

    this.browser = await puppeteer.launch(this.puppeteerConfig);

    this.page = await this.browser.newPage();
    await this.page.setViewport(this.puppeteerConfig.viewport);
    await this.page.authenticate(this.puppeteerConfig.authenticate);
    await this.page.goto(this.url);

    this.spinner
      .stopAndPersist({
        symbol: `${chalk.hex("#33C7FF")("✓")}`,
        text: `Created ${chalk.hex("#33C7FF")(
          "puppeteer.js browser instance"
        )}...`,
      })
      .start();
  }

  async _terminateBrowser() {
    await this.browser.close();

    this.spinner.stopAndPersist({
      symbol: `${chalk.hex("#1BFF00")("✓")}`,
      text: `Completed ${chalk.hex("#1BFF00")("test run\n\n")}`,
      spinner: "dots",
    });
  }

  async createBrowserScreenshots() {
    this.spinner.text = `Creating ${chalk.gray("result images")}...`;

    this.resultImagesInstance = new ResultImages({
      page: this.page,
      name: this.name,
      screenshots: this.screenshots,
    });
    await this.resultImagesInstance.createTestImages();

    this.spinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Created ${chalk.hex("#33C7FF")("result images")}...`,
      spinner: "dots",
    });
  }

  async _runLighthouseReport() {
    const lighthouseFlags = {
      port: new URL(this.browser.wsEndpoint()).port,
      output: "json",
      logLevel: "silent",
      maxWaitForLoad: 60 * 1000,
    };

    this.lighthouseInstance = new LighthouseTest({
      name: this.name,
      url: this.url,
      browser: this.browser,
      outputsJson: this.lighthouseOutputsJson,
      config: this.outputs.lighthouseFullJson,
      flags: lighthouseFlags,
    });

    this.spinner.text = `Running ${chalk.gray("lighthouse report")}...`;
    this.spinner.start();

    await this.lighthouseInstance.runInstance().then((res) => (this.cwv = res));

    this.spinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Completed ${chalk.hex("#33C7FF")("lighthouse report")}...`,
      spinner: "dots",
    });
  }

  async _compareToControlImages() {
    this.spinner.text = `Running ${chalk.gray(
      "comparison with Resemble.js"
    )}...`;
    this.spinner.start();

    await this._compareRunToControl("./results/" + this.name);

    this.spinner.stopAndPersist({
      symbol: `${chalk.hex("#33C7FF")("✓")}`,
      text: `Completed ${chalk.hex("#33C7FF")("Resemble.js comparison")}...`,
      spinner: "dots",
    });
  }

  async _compareRunToControl() {
    let imageCompare = new ImageComparison({
      controlPath: this.controlData.path,
      currentPath: this.dir,
    });
    await imageCompare.findMatchingFiles();
  }
}

export default TestManager;
