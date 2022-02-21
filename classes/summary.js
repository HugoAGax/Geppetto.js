class Summary {
  constructor() {
    this._resultData = {};
  }

  createSingleTestSummary(testName, values) {
    this._resultData[testName] = values;
  }

  createDataSummary() {
    let summary = this;
    let data = this._resultData;
    let orderedData = {};

    Object.keys(this._resultData).forEach((name) => {
      let test = data[name];
      let resultSections = Object.keys(test);
      resultSections.forEach((category) => {
        if (orderedData[category] === undefined) {
          orderedData[category] = [];
        }
        orderedData[category].push(test[category]);
      });
    });

    Object.keys(orderedData).forEach((category) => {
      orderedData[category] = summary._getSamplesCentralTendencies(
        orderedData[category]
      );
    });

    return orderedData;
  }

  getResultsData() {
    return this._resultData;
  }

  _getSamplesCentralTendencies(data) {
    let statisticalResults;
    const asc = (arr) => arr.sort((a, b) => a - b);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    const mean = (arr) => sum(arr) / arr.length;
    const std = (arr) => {
      const mu = mean(arr);
      const diffArr = arr.map((a) => (a - mu) ** 2);
      return Math.sqrt(sum(diffArr) / (arr.length - 1));
    };

    const quantile = (arr, q) => {
      const sorted = asc(arr);
      const pos = (sorted.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
        return sorted[base];
      }
    };

    const q25 = (arr) => quantile(arr, 0.25);
    const q50 = (arr) => quantile(arr, 0.5);
    const q75 = (arr) => quantile(arr, 0.75);

    statisticalResults = {
      q25: q25(data),
      q50: q50(data),
      q75: q75(data),
      s: std(data),
      get s2() {
        return Math.pow(this.std, 2);
      },
      get mean() {
        return this.q50;
      },
    };

    return statisticalResults;
  }
}

export default Summary;
