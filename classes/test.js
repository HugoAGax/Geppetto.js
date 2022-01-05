module.exports = class Test {
    constructor(params) {
        Object.assign(this, params);
        this.name = this.testName();
    }
    // Getter
    testName() {
        const date = this.getTestTime();
        return `${this.name}(${date})`;
    }
    // Method
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
