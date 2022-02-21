import resemble from "resemblejs";
import fs from "fs";
class ImageComparison {
  _defaultConfig = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      errorType: "movement",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
      outputDiff: true,
    },
    scaleToSameSize: true,
    ignore: "antialiasing",
  };

  constructor(params) {
    Object.assign(this, params);
  }

  async _getDirectoryFiles(path) {
    return await fs.promises.readdir(path).then((fileNames) => {
      return fileNames.filter(
        (file) => file.includes(".png") || file.includes(".jpg")
      );
    });
  }

  async findMatchingFiles() {
    let paths = await Promise.all([
      this._getDirectoryFiles(this.currentPath),
      this._getDirectoryFiles(this.controlPath),
    ]);

    await this._handleImageComparison(paths);
  }

  async _handleImageComparison(imageDirectories) {
    let imageComparison = this;
    let controlData = imageDirectories[0];
    let newData = imageDirectories[1];

    var intersections = controlData.filter((e) => newData.indexOf(e) !== -1);

    for (const match of intersections) {
      await imageComparison.compareImagePairs(
        imageComparison.controlPath + "/" + match,
        imageComparison.currentPath + "/" + match,
        match
      );
    }
  }

  async compareAllImages() {}

  async compareImagePairs(baseImage, newImage, filename) {
    const imageCompare = this;
    resemble(baseImage)
      .compareTo(newImage)
      .onComplete((data) => {
        fs.promises.writeFile(
          imageCompare.currentPath + "/compare-" + filename,
          data.getBuffer()
        );
      });
  }
}

export default ImageComparison;
