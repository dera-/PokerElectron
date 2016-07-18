export default class FileUtil {
  static getFileNameList(dirName) {
    const files = new Folder(dirName);
    return files.map(file => file.fsName);
  }
}