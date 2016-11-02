const ipc = window.require('electron').ipcRenderer;

export default class FileAccess {
  static writeDataAsync(data, filePath) {
    ipc.send('write-file', data, filePath);
  }

  static readData(filePath) {
    return ipc.sendSync('read-file', filePath);
  }
}
