export default class Summary {
    constructor(params) {
        this._resultData = {};
    }

    createSingleTestSummary(testName, values) {
        this._resultData[testName] = values;
    }
}
