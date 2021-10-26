class Test {
    constructor(params) {
        this.name = params.name;
        this.url = params.url;
        this.auth = params.autenticate;
    }
    // Getter
    get testName() {
        const date = this.getCurrentDate(); 
        return `${this.name}_${date}`;
    }
    // Method
    getCurrentDate() {
        const d = new Date();
        return `${d.getMonth()}-${d.getDate()}-${d.getFullYear()}`;
    }
};