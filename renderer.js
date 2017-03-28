const electron = require("electron");
const path = require("path");

const ipcRenderer = electron.ipcRenderer;
const dialog = electron.remote.dialog;

const replay_webview = document.getElementById("replay");

const top_bar = document.getElementById("topBar");

function getHost() {
  return electron.remote.getGlobal("sharedConfig").host;
}

/*
button #open
display a file selector and call ipc "open-warc" on main
*/
function openFile() {
  dialog.showOpenDialog(
    {
      properties: ["openFile"],
      filters: [{ name: "Warc", extensions: ["gz", "warc", "arc", "warcgz", "har"] }]
    },
    function(filename) {
      if (filename && filename.toString().match(/\.w?arc(\.gz)?|\.har$/)) {
        ipcRenderer.send("open-warc", filename.toString());
      } else {
        window.alert("Sorry, only WARC or ARC files (.warc, .warc.gz, .arc, .arc.gz) or HAR (.har) can be opened");
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
  if(replay_webview.canGoForward()) {
    webview_history = replay_webview.getWebContents().history;
    current = replay_webview.getWebContents().getURL();
    next = webview_history[webview_history.indexOf(current) + 1];
    if(next.startsWith('http')) {
      replay_webview.goForward();
    }
  }
});

/*
Go to collection listing?
*/
document.getElementById("home").addEventListener("click", _ => {
  //TODO
});

/*
Go to collection listing
*/
document.getElementById("backToCollection").addEventListener("click", _ => {
  replay_webview.loadURL(`${getHost()}/local/collection`);
});

/*
Go to help page
*/
document.getElementById("help").addEventListener("click", _ => {
  img = document.querySelector(".halp");
  if(replay_webview.getURL().indexOf("help.html") !== -1) {
    img.src = "images/halp.png";
    replay_webview.goBack();
  } else {
    img.src = "images/close.png";
    replay_webview.loadURL(`file://${path.join(__dirname, "help.html")}`);
  }
});

/*
Go to landing page
*/
document.getElementById("home").addEventListener("click", _ => {
  replay_webview.loadURL(`file://${path.join(__dirname, "landing.html")}`);
});

/*
Refresh page
*/
document.getElementById("refresh").addEventListener("click", _ => {
  replay_webview.reload();
});


/*
renderer ipc "loadWebview"
called by main after pywb is launched, load a url into webview
*/
ipcRenderer.on("loadWebview", (event, message) => {
  replay_webview.loadURL(message);
});

replay_webview.addEventListener("ipc-message", event => {
  openFile();
});

replay_webview.addEventListener("did-navigate", event => {
  // Initial View
  if (event.url.startsWith("file://")) {
     topBar.className = "side";
  // Everything else (except home page progress load) uses replay view
  } else if (event.url != getHost() + "/") {
     topBar.className = "side replay";
  }

  // manage navigation arrow states
  webview_history = replay_webview.getWebContents().history;
  current = replay_webview.getWebContents().getURL();
  idx = webview_history.indexOf(current);

  if(webview_history.length > 1) {
    if(replay_webview.canGoBack() && idx > 0 && webview_history[idx - 1].startsWith("http")) {
      document.getElementById("back").style.opacity = 1;
    } else {
      document.getElementById("back").style.opacity = 0.5;
    }

    if(replay_webview.canGoForward() && idx < (webview_history.length-1) && webview_history[idx + 1].startsWith("http")) {
      document.getElementById("forward").style.opacity = 1;
    } else {
      document.getElementById("forward").style.opacity = 0.5;
    }
  }
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
