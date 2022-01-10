export default class LighthouseTest {
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
        // console.log('OUTPUT', output);
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