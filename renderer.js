const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const dialog = electron.remote.dialog;

const replay_webview = document.getElementById("replay");

/*
button #open
display a file selector and call ipc "open-warc" on main
*/
document.getElementById("open").addEventListener("click", _ => {
  dialog.showOpenDialog(
    {
      properties: [ "openFile" ],
      filters: [ { name: "Warc", extensions: [ "gz" ] } ]
    },
    function(filename) {
      ipcRenderer.send("open-warc", filename.toString());
    }
  );
});


/*
Go Back
*/
document.getElementById("back").addEventListener("click", function() {
    replay_webview.goBack();
});


/*
Go Forward
*/
document.getElementById("forward").addEventListener("click", function() {
    replay_webview.goForward();
});


/*
Go to collection listing?
*/
document.getElementById("home").addEventListener("click", function() {
  //TODO
});




/*
renderer ipc "loadWebview"
called by main after pywb is executed, load a url into webview
*/
ipcRenderer.on("loadWebview", (event, message) => {
  replay_webview.loadURL(message);
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

