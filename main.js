const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain

const path = require('path')
const url = require('url')
const rq = require('request-promise');

const portfinder = require('portfinder');
portfinder.basePort = 8090;

let mainWindow
let pywb_process

let pluginName
let pluginDir = "plugins"
switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginDir ,pluginName))

var openWarc = function () {
  ipcMain.on('open-warc', (event, argument) => {
    const warc = argument;
    console.log(`warc file: ${warc}`);
    const pywb = path.join(__dirname, 'python-binaries', 'webarchiveplayer');

    if (pywb_process){
          pywb_process.kill('SIGINT');
    }

    portfinder.getPort(function (err, port) {
      pywb_process = require('child_process').spawn(pywb, ["--port", port, warc]);
      console.log(`pywb is listening on: http://localhost:${port} (pid ${pywb_process.pid}) `);
      loadWebview(port);
    });

    var loadWebview = function (port) {
        rq(`http://localhost:${port}`).then(function() {
        mainWindow.webContents.send('loadWebview', `http://localhost:${port}/`);
      }).catch(function(err) {
        loadWebview(port);
      });
    }
  });

}


var createWindow = function () {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      plugins: true
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null;
    pywb_process.kill('SIGINT');
  });
}

app.on('ready', function () {
  createWindow();
  openWarc();
});

app.on('window-all-closed', function () {
  app.quit();
});