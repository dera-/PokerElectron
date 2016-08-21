"use strict";

const electron = require("electron");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow,
  createWindow = () => {
    mainWindow = new BrowserWindow({ width: 1920, height: 1080 });
    mainWindow.loadURL("file://" + __dirname + "/htdocs/index.html");
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
