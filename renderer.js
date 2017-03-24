const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const dialog = electron.remote.dialog;

const replay_webview = document.getElementById("replay");

/*
button #open
display a file selector and call ipc "open-warc" on main
*/
function openFile() {
  dialog.showOpenDialog(
    {
      properties: ["openFile"],
      filters: [{ name: "Warc", extensions: ["gz", "warc", "arc", "warcgz"] }]
    },
    function(filename) {
      if (filename) {
        ipcRenderer.send("open-warc", filename.toString());
      }
    }
  );
}

document.getElementById("open").addEventListener("click", openFile);


/*
Go Back
(excluding about:blank and loader.html)
*/
document.getElementById("back").addEventListener("click", _ => {
  webview_history = replay_webview.getWebContents().history;
  current = replay_webview.getWebContents().getURL();
  previous = webview_history[webview_history.indexOf(current) - 1];
  if (previous.startsWith("http")) {
    replay_webview.goBack();
  }
});

/*
Go Forward
*/
document.getElementById("forward").addEventListener("click", _ => {
  replay_webview.goForward();
});

/*
Go to collection listing?
*/
document.getElementById("home").addEventListener("click", _ => {
  //TODO
});

/*
renderer ipc "loadWebview"
called by main after pywb is launched, load a url into webview
*/
ipcRenderer.on("loadWebview", (event, message) => {
  replay_webview.loadURL(message);
});


replay_webview.addEventListener("ipc-message", (event) => {
  openFile();
});


/*
hides all .btn on webview dom-ready
*/
/*
replay_webview.addEventListener("dom-ready", () => {
  replay_webview.executeJavaScript(
    'for (let el of document.querySelectorAll(".btn")) el.style.visibility = "hidden";'
  );
});
*/
