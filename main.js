const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const path = require("path");
const url = require("url");
const rq = require("request-promise");
const child_process = require("child_process");
const windowStateKeeper = require("electron-window-state");

const packageInfo = require('./package.json');

const wrConfig = {};

let mainWindow;
let webrecorder_process;

let pluginName;
let pluginDir = "plugins";
let spawn_options;

let stdio = ['ignore', 'pipe', 'ignore'];

switch (process.platform) {
  case "win32":
    pluginName = "pepflashplayer.dll";
    spawn_options = { detached: true, stdio: stdio };
    break;
  case "darwin":
    pluginName = "PepperFlashPlayer.plugin";
    spawn_options = { detached: true, stdio: stdio };
    break;
  case "linux":
    pluginName = "libpepflashplayer.so";
    spawn_options = { detached: true, stdio: stdio };
    break;
}
app.commandLine.appendSwitch(
  "ppapi-flash-path",
  path.join(__dirname, pluginDir, pluginName)
);

var registerOpenWarc = function() {
  const webrecorder = path.join(__dirname, "python-binaries", "webrecorder");

  // get versions for stack
  child_process.execFile(webrecorder, ["--version"], (err, stdout, stderr) => {
    const electronVersion = `electron ${process.versions.electron}<BR>
                             chrome ${process.versions.chrome}`;
    Object.assign(wrConfig, {
      version: `webrecorder player ${packageInfo.version}<BR>
                ${stdout.replace("\n", "<BR>")}<BR>${electronVersion}`
    });
 });

  ipcMain.on("open-warc", (event, argument) => {
    const warc = argument;
    console.log(`warc file: ${warc}`);

    var message = {"url": url.format({
                            pathname: path.join(__dirname, "loader.html"),
                            protocol: "file:",
                            slashes: true})};
 
    // load spinner.html into webview
    mainWindow.webContents.send("loadWebview", message);

    // if a previous webrecorder player is running, kill it
    if (webrecorder_process) {
      if (process.platform == "win32") {
        child_process.execSync(
          `taskkill /F /PID ${webrecorder_process.pid} /T`
        );
      } else {
        webrecorder_process.kill("SIGINT");
      }
    }

    webrecorder_process = child_process.spawn(
        webrecorder,
        ["--no-browser", "--loglevel", "error", "--port", 0, warc],
        spawn_options
      );

    let port = undefined;

    var findPort = function(buff) {
      if (!buff) {
        return;
      }

      buff = buff.toString();

      console.log(buff);

      if (port) {
        return;
      }

      var parts = buff.split("APP_HOST=http://localhost:");
      if (parts.length != 2) {
        return;
      }

      port = parts[1];

      if (process.platform != "win32") {
        webrecorder_process.unref();
      }

      var url = `http://localhost:${port}/`

      console.log(
        `webrecorder is listening on: ${url} (pid ${webrecorder_process.pid}) `
      );
      Object.assign(wrConfig, {host: url});

      var message = {"url": url, "url_base": url};

      mainWindow.webContents.send("loadWebview", message);
    };

    webrecorder_process.stdout.on('data', findPort);

  });
};

var createWindow = function() {
  // keep track of window state
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    webPreferences: { plugins: true },

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
  mainWindow.once('ready-to-show', function() {
    mainWindow.show();
  });

  // load the application into the main window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "main.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.on("closed", function() {
    mainWindow = null;
    if (webrecorder_process) {
      if (process.platform == "win32") {
        child_process.execSync(
          `taskkill /F /PID ${webrecorder_process.pid} /T`
        );
      } else {
        webrecorder_process.kill("SIGINT");
      }
    }
  });
};

app.on("ready", function() {
  createWindow();
  registerOpenWarc();
});

app.on("window-all-closed", function() {
  app.quit();
});

// renderer process communication
electron.ipcMain.on("async-call", (evt, arg) => {
  evt.sender.send("async-response", wrConfig);
});
