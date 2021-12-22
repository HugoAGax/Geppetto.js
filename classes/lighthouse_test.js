function getLighthouseConfig(options) {
    let lighthouseConfig = {
        extends: 'lighthouse:default',
        settings: {
            onlyCategories: ['performance'],
            //maxWaitForLoad: 10000
        }
    }

    if (options.desktop) {
        // Settings taken from https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/constants.js
        Object.assign(lighthouseConfig.settings, {
            formFactor: 'desktop',
            throttling: {
                rttMs: 40,
                throughputKbps: 10 * 1024,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0, // 0 means unset
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              },
            screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false,
              },
            emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4420.0 Safari/537.36 Chrome-Lighthouse'
        })
    }

    return lighthouseConfig
}

function getPuppeteerConfig (options) {
    let puppeteerConfig = {
        headless: false,
        devtools: true
    }
    if (options.userDataDir) {
        puppeteerConfig.userDataDir = options.userDataDir;
        //'~/Library/Application\ Support/Google/Chrome\ Canary/'
    }
    if (options.executablePath) {
        puppeteerConfig.executablePath = options.executablePath;
        //'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    }
    if (options.desktop) {
        puppeteerConfig.defaultViewport = {
            width: 1920,
            height: 1080
        }
    }
    return puppeteerConfig;
}


async function runTest(uri, options) {
    const puppeteerConfig = getPuppeteerConfig(options)
    const lighthouseConfig = getLighthouseConfig(options)
    const browser = await puppeteer.launch(puppeteerConfig);
    const lighthouseFlags = {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'info',
        maxWaitForLoad: 60 * 1000
    }

    // Lighthouse will open the URL.
    // Puppeteer will observe `targetchanged`
    let {lhr} = await lighthouse(uri, lighthouseFlags, lighthouseConfig);
    await browser.close();
    return lhr;
}
