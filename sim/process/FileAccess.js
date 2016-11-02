const fs = require('fs');

export default class FileAccess {
  static writeDataAsync(data, filePath) {
    fs.writeFileSync(filePath, data);
  }

  static readData(filePath) {
    try {
      fs.statSync(filePath);
      return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      return '';
    }
  }
}

