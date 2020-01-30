// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, session, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');

//setup logger
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

//setup updater events
autoUpdater.on('checking-for-update',() => {
    console.log("güncelleme kontrol ediliyor");
});

autoUpdater.on('update-available',(info) => {
    mainWindow.webContents.send('update_available');
    console.log("güncelleme bulundu");
    console.log("versiyon", info.version);
    console.log("release tarihi", info.releaseDate);
});

autoUpdater.on('update-not-available',()=>{
    console.log("güncelleme bulunamadı.");
});

autoUpdater.on('download-progress',(progress) => {
    mainWindow.webContents.send('download-progress');
    console.log(`Islem ${Math.floor(progress.percent)}`);
});

autoUpdater.on('update-downloaded',(info)=> {
    console.log("güncelleme indirildi");
    autoUpdater.quitAndInstall();
});

autoUpdater.on('error',(error) => {
    console.log(error);
});

global.sharedObject = {
    tokenModel: null
};

global.sharedUrl = {
    tokenUrl: "https://gtsmobilapi.dstrace.com/token",
    apiUrl: "https://gtsmobilapi.dstrace.com/api"
    // tokenUrl: "http://testapi.dstrace.com:90/token",
    // apiUrl: "http://testapi.dstrace.com:90/api"
    // tokenUrl: "http://localhost:2239/token",
    // apiUrl: "http://localhost:2239/api"
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: true,
        fullscreen: false,
        alwaysOnTop: false,
        movable: true,
        icon: "../Content/img/logo.png",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('Login/Login.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    if(!isDev){
        autoUpdater.checkForUpdates();
    }
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});