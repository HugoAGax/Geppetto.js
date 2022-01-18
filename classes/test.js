export default class Test {
    constructor(params) {
        Object.assign(this, params);
        this.name = this.testName();
        this.dir = this.createResultDirectory(this.name);
    }

    testName() {
        const date = this.getTestTime();
        return `${this.name}(${date})`;
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

    createResultDirectory(name) {
        var dir = `./results/${name}`;
    
        if (this.fs.existsSync(dir) === false) {
            this.fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }
}
