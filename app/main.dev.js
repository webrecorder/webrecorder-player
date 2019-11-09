/* eslint global-require: 1 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 */
require('babel-polyfill');


import { app, BrowserWindow, ipcMain, session } from 'electron';
import child_process from 'child_process';
import Dat from 'dat-node';
import fs from 'fs';
import path from 'path';
import url from 'url';
import windowStateKeeper from 'electron-window-state';

import MenuBuilder from './menu';
import packageInfo from '../package';


let debugOutput = [];
let mainWindow = null;
let pluginName;
let port;
let spawnOptions;
let webrecorderProcess;
let openNextFile = null;


const projectDir = path.join(__dirname, '../');
const EXE_NAME = 'webrecorder_player';
const webrecorderBin = path.join(projectDir, 'python-binaries', EXE_NAME);
const stdio = ['ignore', 'pipe', 'pipe'];
const wrConfig = {};
const pluginDir = 'plugins';


switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll';
    spawnOptions = { detached: true, stdio };
    break;
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin';
    spawnOptions = { detached: true, stdio };
    break;
  case 'linux':
    pluginName = 'libpepflashplayer.so';
    spawnOptions = { detached: true, stdio };
    break;
  default:
    console.log('platform unsupported');
    break;
}

app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch(
  'ppapi-flash-path',
  path.join(projectDir, pluginDir, pluginName)
);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const findPort = function (rawBuff, source) {
  const buff = rawBuff.toString();

  debugOutput.push(buff);

  // clip line buffer
  if (debugOutput.length > 500) {
    debugOutput.shift();
  }

  if (!buff || port) {
    return;
  }

  console.log(buff);

  const parts = buff.split('APP_HOST=http://localhost:');
  if (parts.length !== 2) {
    return;
  }

  port = parts[1].trim();

  if (process.platform !== 'win32') {
    webrecorderProcess.unref();
  }

  const appUrl = `http://localhost:${port}/`;

  console.log(
    `webrecorder is listening on: ${appUrl} (pid ${webrecorderProcess.pid}) `
  );
  Object.assign(wrConfig, { host: appUrl });

  const sesh = session.fromPartition('persist:local-replay', { cache: true });
  const proxy = `localhost:${port}`;
  sesh.setProxy({ proxyRules: proxy }, () => {
    mainWindow.webContents.send('indexing', { host: appUrl, source });
  });

  // Ensure Brotli Support
  sesh.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Accept-Encoding'] = 'gzip, deflate, br';
    callback({cancel: false, requestHeaders: details.requestHeaders});
  });

};


function killProcess() {
  console.log('killing webrecorder?', Boolean(webrecorderProcess));
  // if a previous webrecorder player is running, kill it
  if (webrecorderProcess) {
    port = 0;

    if (process.platform === 'win32') {
      child_process.execSync(
        `taskkill /F /PID ${webrecorderProcess.pid} /T`
      );
    } else {
      webrecorderProcess.kill('SIGTERM');
    }
  }
}


const registerOpenWarc = function () {
  // get versions for stack
  child_process.execFile(webrecorderBin, ['--version'], (err, stdout, stderr) => {
    const electronVersion = `electron ${process.versions.electron}<BR>
                             chrome ${process.versions.chrome}`;
    Object.assign(wrConfig, {
      version: `webrecorder player ${packageInfo.version}<BR>
                ${stdout.replace(/\n/g, '<BR>').replace(EXE_NAME, 'webrecorder')}<BR>${electronVersion}`
    });
  });

  ipcMain.on('open-warc', (event, argument) => {
    openWarc(argument);
  });
};

const openWarc = (warc) => {
  debugOutput = [];
  openNextFile = null;
  console.log(`warc file: ${warc}`);

  // move to homepage
  mainWindow.webContents.send('change-location', '/');

  // notify renderer that we are initializing webrecorder binary
  mainWindow.webContents.send('initializing', { src: 'warc' });

  killProcess();

  webrecorderProcess = child_process.spawn(
    webrecorderBin,
    ['--no-browser', '--loglevel', 'error', '--cache-dir', '_warc_cache', '--port', 0, warc],
    spawnOptions
  );

  // catch any errors spawning webrecorder binary and add to debug info
  webrecorderProcess.on('error', (err) => {
    debugOutput.push(`Error spawning ${webrecorderBin} binary:\n ${err}\n\n`);
  });

  // log any stderr notices
  webrecorderProcess.stderr.on('data', (buff) => {
    debugOutput.push(`stderr: ${buff.toString()}`);

    // clip line buffer
    if (debugOutput.length > 500) {
      debugOutput.shift();
    }
  });

  webrecorderProcess.stdout.on('data', (buff) => findPort(buff, warc));
};

const createWindow = function () {
  // keep track of window state
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    webPreferences: { plugins: true,
                      webviewTag: true,
                      nodeIntegration: true },

    // start with state from windowStateKeeper
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    isMaximized: mainWindowState.isMaximized,
    isFullScreen: mainWindowState.isFullScreen,

    // hide the window until the content is loaded
    show: false
  });

  // have windowStateKeeper subscribe to window state changes
  mainWindowState.manage(mainWindow);

  // show the window once its content is ready to go
  mainWindow.once('ready-to-show', () => {
    // init session earlier
    const sesh = session.fromPartition('persist:wr', { cache: true });

    if (openNextFile) {
      openWarc(openNextFile);
    } else if (process.argv.length == 2 && !process.argv[1].startsWith('-psn')) {
      openWarc(process.argv[1]);
    }

    mainWindow.show()

  });

  // load the application into the main window
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (webrecorderProcess) {
      if (process.platform === 'win32') {
        child_process.execSync(
          `taskkill /F /PID ${webrecorderProcess.pid} /T`
        );
      } else {
        webrecorderProcess.kill('SIGINT');
      }
    }
  });
};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();

  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  app.quit();
});

// Ensure new-window urls are just opened directly in the webview
app.on('web-contents-created', (e, contents) => {
  if (contents.getType() == 'webview') {
    // Listen for any new window events on the webview
    contents.on('new-window', (e, url) => {
      e.preventDefault();
      contents.loadURL(url);
    })
  }
})


app.on('will-finish-launching', function() {
  app.on('open-file', function(event, filePath) {
    event.preventDefault();
    openNextFile = filePath;
    if (mainWindow) {
      openWarc(openNextFile);
    }
  });
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  createWindow();
  registerOpenWarc();

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

});

// renderer process communication
ipcMain.on('async-call', (evt, arg) => {
  evt.sender.send('async-response', {
    config: wrConfig,
    stdout: debugOutput.join('<BR>').replace(/\n/g, '<BR>')});
});


ipcMain.on('sync-dat', (evt, datKey) => {
  console.log('launching dat with key:', datKey)
  const baseFolder = path.join(app.getPath('downloads'), 'webrecorder-dat');

  fs.mkdir(baseFolder, (err) => {
    if (err === null || err.code === 'EEXIST') {
      const dlDir = path.join(baseFolder, datKey.replace('dat://', ''));
      const openWarcDir = () => {
        killProcess();

        webrecorderProcess = child_process.spawn(
          webrecorderBin,
          ['--no-browser', '--loglevel', 'error', '--cache-dir', '_warc_cache', '--port', 0, '--coll-dir', dlDir],
          spawnOptions
        );

        // catch any errors spawning webrecorder binary and add to debug info
        webrecorderProcess.on('error', (err) => {
          debugOutput.push(`Error spawning ${webrecorderBin} binary:\n ${err}\n\n`);
        });

        // log any stderr notices
        webrecorderProcess.stderr.on('data', (buff) => {
          debugOutput.push(`stderr: ${buff.toString()}`);

          // clip line buffer
          if (debugOutput.length > 500) {
            debugOutput.shift();
          }
        });

        webrecorderProcess.stdout.on('data', (buff) => findPort(buff, datKey));
      }

      Dat(dlDir, {key: datKey}, (err, dat) => {
        dat.joinNetwork((err) => {
          if (err) {
            throw err;
          }

          if (!dat.network.connected || !dat.network.connecting) {
            console.log('dat key not found');
            //mainWindow.loadURL(`file://${__dirname}/app.html`);
          }
        });

        mainWindow.webContents.send('initializing', { src: 'dat' });

        const stats = dat.trackStats();
        let handle = null;

        const up = () => {
          const s = stats.get();
          clearTimeout(handle);

          mainWindow.webContents.send('indexProgress', { perct: Math.round((s.downloaded / s.length) * 100) });

          if (s.length > 0 && s.downloaded === s.length) {
            handle = setTimeout(openWarcDir, 750);
          }
        }
        stats.on('update', up);
      });
    }
  });
});
