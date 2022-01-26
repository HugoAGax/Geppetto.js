import lighthouse from "lighthouse";

export default class LighthouseTest {
    constructor(params) {
        Object.assign(this, params);
        this.defaultSections = [
            'first-contentful-paint',
            'largest-contentful-paint',
            'first-meaningful-paint',
            'speed-index',
            'total-blocking-time',
            'max-potential-fid',
            'cumulative-layout-shift',
            'interactive'
        ];
    }

    async runInstance() {
        const lighthouseTest = this;
        return await this.lighthouse(this.url, this.flags, this.config).then(function(result) {
            var highlights = lighthouseTest.filterAuditSections(result.lhr.audits);
            if (lighthouseTest.outputsJson === true) {
                fs.writeFile(`lighthouse-${lighthouseTest.name}.json`, JSON.stringify(result));
            }
            return highlights;
        });;
    }

    filterAuditSections(result, sections = this.defaultSections) {
        let output = {};
        
        sections.forEach((sc) => {
            output[sc] = result[sc].numericValue
        });
        return output;
    }
}