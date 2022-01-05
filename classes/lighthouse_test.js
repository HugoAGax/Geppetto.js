

// function getPuppeteerConfig (options) {
//     let puppeteerConfig = {
//         headless: false,
//         devtools: true
//     }
//     if (options.userDataDir) {
//         puppeteerConfig.userDataDir = options.userDataDir;
//         //'~/Library/Application\ Support/Google/Chrome\ Canary/'
//     }
//     if (options.executablePath) {
//         puppeteerConfig.executablePath = options.executablePath;
//         //'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
//     }
//     if (options.desktop) {
//         puppeteerConfig.defaultViewport = {
//             width: 1920,
//             height: 1080
//         }
//     }
//     return puppeteerConfig;
// }


// async function runTest(uri, options) {
//     const puppeteerConfig = getPuppeteerConfig(options)
//     const lighthouseConfig = getLighthouseConfig(options)
//     const browser = await puppeteer.launch(puppeteerConfig);
//     const lighthouseFlags = {
//         port: (new URL(browser.wsEndpoint())).port,
//         output: 'json',
//         logLevel: 'info',
//         maxWaitForLoad: 60 * 1000
//     }

//     // Lighthouse will open the URL.
//     // Puppeteer will observe `targetchanged`
//     let {lhr} = await lighthouse(uri, lighthouseFlags, lighthouseConfig);
//     await browser.close();
//     return lhr;
// }

// {
//     'largest-contentful-paint': 3561.2175000000007,
//     'first-meaningful-paint': 956.794,
//     'speed-index': 4327.032852510731,
//     'total-blocking-time': 530.5,
//     'max-potential-fid': 270.00000000000045,
//     'cumulative-layout-shift': 0.060850532307080527,
//     interactive: 5317.8810723114
//   }

module.exports = class LighthouseTest {
    constructor(params) {
        Object.assign(this, params);

        this.defaultSections = [
            'largest-contentful-paint',
            'first-meaningful-paint',
            'speed-index',
            'total-blocking-time',
            'max-potential-fid',
            'cumulative-layout-shift',
            'interactive'
        ]
    }

    async runInstance() {
        const lighthouseTest = this;
        return await this.lighthouse(this.url, this.flags, this.config).then(function(result) {
            // console.log('result data', result.lhr.audits);
            lighthouseTest.filterAuditSections(result.lhr.audits);
            // results.push(result);
            // fs.writeFile(`${getOutputFilename()}_${testNumber}.json`, JSON.stringify(result), () => console.log)
            return result;
        });;
    }

    filterAuditSections(result, sections = this.defaultSections) {
        let output = {};
        sections.forEach((sc) => {
            output[sc] = result[sc].numericValue
        })
        console.log('OUTPUT', output);
    }

    getTestTime() {

        var currentdate = new Date();
        return currentdate.getDate() + "-"
            + (currentdate.getMonth() + 1) + "-"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + "H"
            + currentdate.getMinutes() + "M"
            + currentdate.getSeconds();+ "S"
    }
}