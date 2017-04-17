const electron = require("electron");
const path = require("path");

const ipcRenderer = electron.ipcRenderer;
const dialog = electron.remote.dialog;

const replay_webview = document.getElementById("replay");

const top_bar = document.getElementById("topBar");
let wrConfig;

ipcRenderer.on("async-response", (evt, arg) => {
  wrConfig = arg;
});
ipcRenderer.send("async-call");

function getHost() {
  if (typeof wrConfig === "undefined" || typeof wrConfig.host === "undefined") {
    return ipcRenderer.send("async-call");
  }
  return wrConfig.host;
}

function getVersion() {
  if (typeof wrConfig === "undefined" || typeof wrConfig.version === "undefined") {
    return ipcRenderer.send("async-call");
  }
  return wrConfig.version;
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
      } else if (filename) {
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
document.getElementById("back").addEventListener("click", event => {
  if (replay_webview.canGoBack()) {
    var webview_history = replay_webview.getWebContents().history;
    var current = replay_webview.getWebContents().getURL();
    var previous = webview_history[webview_history.indexOf(current) - 1];
    if (previous.startsWith("http")) {
      replay_webview.goBack();
    }
  }
});

/*
Go Forward
*/
document.getElementById("forward").addEventListener("click", _ => {
  if (replay_webview.canGoForward()) {
    var webview_history = replay_webview.getWebContents().history;
    var current = replay_webview.getWebContents().getURL();
    var next = webview_history[webview_history.indexOf(current) + 1];
    if (next.startsWith("http")) {
      replay_webview.goForward();
    }
  }
});

/*
Go to collection listing
*/
const buttons = document.querySelectorAll(".home-btn");
for(btn of buttons) {
  btn.addEventListener("click", _ => {
    const currentUrl = replay_webview.getURL();
    if(currentUrl.startsWith("file") && currentUrl.endsWith("help.html")) {
      document.querySelector(".halp").src = "images/halp.png";
    }

    replay_webview.loadURL(`${getHost()}/local/collection`);
  });
}

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
  const currentUrl = replay_webview.getURL();
  if(currentUrl.startsWith("file") && currentUrl.endsWith("help.html")) {
    img.src = "images/halp.png";
    replay_webview.goBack();
  } else {
    img.src = "images/close.png";
    replay_webview.loadURL(`file://${path.join(__dirname, "help.html")}`);
  }
});

/*
Refresh page
*/
document.getElementById("refresh").addEventListener("click", _ => {
  replay_webview.reload();
});


/*
Open help page links in external browser
*/
replay_webview.addEventListener('new-window', (e) => {
  const currentUrl = replay_webview.getURL();
  if(currentUrl.startsWith("file") && currentUrl.endsWith("help.html")) {
    const protocol = require('url').parse(e.url).protocol
    if (protocol === 'http:' || protocol === 'https:') {
      electron.shell.openExternal(e.url);
    }
  }
});

/*
renderer ipc "loadWebview"
called by main after pywb is launched, load a url into webview
*/
ipcRenderer.on("loadWebview", (event, message) => {
  replay_webview.clearHistory();
  replay_webview.loadURL(message);
});

replay_webview.addEventListener("ipc-message", event => {
  switch (event.channel) {
    case "open":
      openFile();
      break;
    case "version":
      replay_webview.send("version", getVersion());
      break;
  }
});

// Check if coll or home page url, eg.
//  http://localhost:<port>/local/collection or
//  http://localhost:<port>
function isCollPage(url) {
   return url.split("/").length <= 5;
}

replay_webview.addEventListener("will-navigate", event => {
  var webview_history = replay_webview.getWebContents().history;
  var current = replay_webview.getWebContents().getURL();

  if (isCollPage(current)) {
    replay_webview.clearHistory();
  }
});

replay_webview.addEventListener("did-navigate", event => {
  // Initial View
  if (event.url.startsWith("file://")) {
     topBar.className = "side";
     return;

  // Everything else (except home page progress load) uses replay view
  } else if (event.url != getHost() + "/") {
     topBar.className = "side replay";
  }

  // manage navigation arrow states
  var webview_history = replay_webview.getWebContents().history;
  var current = replay_webview.getWebContents().getURL();
  var idx = webview_history.indexOf(current);

  //console.log(getHost());

  // is collection page
  var isColl = isCollPage(current);

  const backBtn = document.getElementById("back");
  const fwdBtn = document.getElementById("forward");
  const refresh = document.getElementById("refresh");
  const backToCollection = document.getElementById("backToCollection");

  backToCollection.classList.toggle("off", isColl);
  refresh.classList.toggle("off", isColl);

  // determine if on collection page
  if (isColl) {
    backBtn.classList.add("off");
    fwdBtn.classList.add("off");
    refresh.classList.add("off");
    return;
  }

  var backEnabled = false;
  var fwdEnabled = false;

  if (webview_history.length > 1) {
    if (replay_webview.canGoBack() && idx > 0 && webview_history[idx - 1].startsWith("http")) {
      backEnabled = true;
    }

    if (replay_webview.canGoForward() && idx < (webview_history.length-1) && webview_history[idx + 1].startsWith("http")) {
      fwdEnabled = true;
    }
  }

  // otherwise, toggle enabled state
  backBtn.classList.toggle("off", false);
  backBtn.classList.toggle("inactive", !backEnabled);

  fwdBtn.classList.toggle("off", false);
  fwdBtn.classList.toggle("inactive", !fwdEnabled);

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
