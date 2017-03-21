const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const path = require("path");
const url = require("url");
const rq = require("request-promise");
const child_process = require("child_process");

const portfinder = require("portfinder");
portfinder.basePort = 8095;

require("electron-debug")({ showDevTools: false });

let mainWindow;
let webrecorder_process;

let pluginName;
let pluginDir = "plugins";
let spawn_options;

switch (process.platform) {
  case "win32":
    pluginName = "pepflashplayer.dll";
    spawn_options = { detached: false, stdio: "ignore" };
    break;
  case "darwin":
    pluginName = "PepperFlashPlayer.plugin";
    spawn_options = { detached: true, stdio: "ignore" };
    break;
  case "linux":
    pluginName = "libpepflashplayer.so";
    spawn_options = { detached: true, stdio: "ignore" };
    break;
}
app.commandLine.appendSwitch(
  "ppapi-flash-path",
  path.join(__dirname, pluginDir, pluginName)
);

var openWarc = function() {
  ipcMain.on("open-warc", (event, argument) => {
    const warc = argument;
    console.log(`warc file: ${warc}`);
    const webrecorder = path.join(__dirname, "python-binaries", "webrecorder");

    // load spinner.html into webview
    mainWindow.webContents.send(
      "loadWebview",
      url.format({
        pathname: path.join(__dirname, "loader.html"),
        protocol: "file:",
        slashes: true
      })
    );

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

    portfinder.getPort(function(err, port) {
      webrecorder_process = child_process.spawn(
        webrecorder,
        ["--no-browser", "--port", port, warc],
        spawn_options
      );

      if (process.platform != "win32") {
        webrecorder_process.unref();
      }

      console.log(
        `webrecorder is listening on: http://localhost:${port} (pid ${webrecorder_process.pid}) `
      );
      loadWebview(port);
    });

    var loadWebview = function(port) {
      rq(`http://localhost:${port}`)
        .then(function() {
          mainWindow.webContents.send(
            "loadWebview",
            `http://localhost:${port}/`
          );
        })
        .catch(function(err) {
          loadWebview(port);
        });
    };
  });
};

var createWindow = function() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: { plugins: true }
  });
  mainWindow.maximize();

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
  openWarc();
});

app.on("window-all-closed", function() {
  app.quit();
});
