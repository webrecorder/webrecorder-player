const { ipcRenderer } = require('electron')

global.sendToHost = (msg, data) => {
  ipcRenderer.sendToHost(msg, data);
}

ipcRenderer.on("version", (evt, arg) => {
  document.getElementById("stack-version").innerHTML= arg;
});


global.iframeLoad = () => {
  ipcRenderer.sendToHost("did-frame-navigate");
}
