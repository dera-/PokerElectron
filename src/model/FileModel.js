//import fs from 'fs';
import Conf from '../config/conf.json';

export default class FileModel {
  constructor(path) {
    this.filePath = Conf.data.ai.dir_path + '/' + path;
    this.write_stream = null;
  }

  readAll() {
    const content = fs.readFileSync(this.filePath);
    return content.toString().split('\n');
  }

  open() {
    this.write_stream = fs.createWriteStream(this.filePath);
  }

  writeOneLine(line) {
    this.write_stream.write(line + "\n");
  }

  close() {
    this.write_stream.end();
    this.write_stream = null;
  }

  writeToLocal(content) {
    let errorCallback = e => {
      alert("Error: " + e.name);
    };
    let fsCallback = fs => {
      fs.root.getFile(this.filePath, {create: true}, fileEntry => {
        fileEntry.createWriter(fileWriter => {
          let output = new Blob([content], {type: "text/plain"});
          fileWriter.write(output);
        }, errorCallback);
      }, errorCallback);
    };
    // クオータを要求する。PERSISTENTでなくTEMPORARYの場合は
    // 直接 webkitRequestFileSystem を呼んでよい
    webkitStorageInfo.requestQuota(
      PERSISTENT,
      1024,
      webkitRequestFileSystem(PERSISTENT, 1024, fsCallback, errorCallback),
      errorCallback
    );
  }
}
