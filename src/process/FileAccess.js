const {ipcRenderer} = require('electron');
//const ipc = require('electron').ipcRenderer;//window.require('electron').ipcRenderer;

export default class FileAccess {
  static writeDataAsync(data, filePath) {
    ipcRenderer.send('write-file', data, filePath);
  }

  static readData(filePath) {
    return ipcRenderer.sendSync('read-file', filePath);
  }
}
