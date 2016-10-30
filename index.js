"use strict";
const electron = require("electron");
const fs = require('fs');
const ipc = electron.ipcMain;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


let mainWindow,
  createWindow = () => {
    mainWindow = new BrowserWindow({ width: 1920, height: 1080 });
    mainWindow.loadURL("file://" + __dirname + "/htdocs/index.html");
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", () => mainWindow = null);
  };

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipc.on('write-file', (event, data, filePath) => {
  fs.writeFile(filePath, data , function (err) {
    console.log(err);
    console.log('データ書き込み完了');
  });
});

// ファイル読み込み機能
ipc.on('read-file', (event, filePath) => {
  try {
    fs.statSync(filePath);
    event.returnValue = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    event.returnValue = '';
  }
});

// // オートアップデート機能
// const autoUpdater = electron.autoUpdater;
// autoUpdater.setFeedURL(<先ほどのURL>);
// autoUpdater.checkForUpdates();

// autoUpdater.on("update-downloaded", () => {
//   index = dialog.showMessageBox({
//     message: "アップデートあり",
//     detail: "再起動してインストールできます。",
//     buttons: ["再起動", "後で"]
//   });
//   if (index === 0) {
//     autoUpdater.quitAndInstall();
//   }
// });
// autoUpdater.on("update-not-available", () => {
//   dialog.showMessageBox({
//     message: "アップデートはありません",
//     buttons: ["OK"]
//   });
// });
// autoUpdater.on("error", () => {
//   dialog.showMessageBox({
//     message: "アップデートエラーが起きました",
//     buttons: ["OK"]
//   });
// });
