const { ipcRenderer } = require('electron')

global.sendToHost = (msg, data) => {
  ipcRenderer.sendToHost(msg, data)
}

