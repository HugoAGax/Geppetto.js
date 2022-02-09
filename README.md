# Geppetto.js

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/HugoAGax/Geppetto.js/blob/main/LICENSE)

Website testing tool based on **Puppeteer.js** that allows for the evaluation of Core Web Vitals and storing screenshots of certain elements or full page visualizations

  - [**Puppeteer.js:**](https://github.com/puppeteer/puppeteer) This technology enables the creation of browser instances and taking screenshots of various elements on the rendered page
  - [**Lighthouse:**](https://github.com/GoogleChrome/lighthouse) Runs a full suite of performance and rendering tests to rate the quiality of your suite
  - [**Resemble.js:**](https://github.com/rsmbl/Resemble.js) Image analysis tool that enabled comparison of past and currently rendered elements

## Features

  - Running instances of desktop/mobile user agents
  - Full page and selector-specific screenshots
  - Running reports for performance and evaluation of CWVs
  - Performance auditing results output as JSON
  - Live view of progress on the command line

## Running Geppetto.js

To run tests, run the following command (the las argument related to the specific test configuration the user would decide to enact on this run)

```bash
  node script.js path-to-your-config.json
```

## Test configuration JSON

#### Running your specific tests

In order to maximize flexibility the project can run any supported configuration that Puppeteer.js and Lighthouse already do (the last argument of the command will allow to plug this config file)

```
  path-to-your-config.json
```

Inside the top level of the JSON under the tests property an Object array contains parameters for each test run, these are as follows:

| Parameter               | Type      | Description                                                                                                                                                                                 |
| :---------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                  | `string`  | **Required**. Name of the test that will be run (the output of this test will be stored in a new directory `./results/name + time and date of test`                                         |
| `url`                   | `string`  | **Required**. URL to page that will be subject to the test                                                                                                                                  |
| `viewport`              | `object`  | **Required**. Object with the viewport properties to initialize a browser instance                                                                                                          |
| `lighthouseOutputsJson` | `boolean` | With every lighthouse report comes alongside a JSON report (which is a big file), setting this flag as true will save the output in the test directory                                      |
| `lighthouseConfig`      | `object`  | This is a config for the report that will be run, follows the same format of [Lighthouse API](https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically) |
| `puppeteerConfig`       | `object`  | This is a config for the report that will be run, follows the same format of [Puppeteer.js API](https://github.com/puppeteer/puppeteer/blob/v13.0.1/docs/api.md)                            |

Examples of config file on [sample JSON](https://github.com/HugoAGax/Geppetto.js/blob/main/tests/sample_test.json)

## Installation

Install dependencies on Geppetto.js by changing directories into the project root and running

```bash
  npm install
```

## Roadmap

  - Better storing solutions for results metrics
  - Support for image analysis integrations (so a current test can be compared to a past run)
  - Event-triggered screenshots
  - Support for external code to be run in browser instance
  - CSV output of Geppeto.js summary
  - Cookies and other forms of authentication
