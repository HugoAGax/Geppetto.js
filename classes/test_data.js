// External Dependencies
import fs from "fs";

class TestData {
  constructor(params) {
    Object.assign(this, params);
    this.name = this.testName();
    this.dir = this.createResultDirectory(this.name);
  }

  testName() {
    const date = this.getTestTime();
    return `${date}_${this.name}`;
  }

  getTestTime() {
    let now = new Date().toISOString().split("T");
    let date = now[0].split("-").join("");
    let time = now[1].split(".")[0].split(":").join("");
    return date + "_" + time;
  }

  createResultDirectory(name) {
    var dir = `./results/${name}`;

    if (fs.existsSync(dir) === false) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
}

export default TestData;
