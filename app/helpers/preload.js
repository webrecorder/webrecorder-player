const { ipcRenderer } = require('electron');


document.addEventListener('DOMContentLoaded', (evt) => {
  const state = {
    wb_type: 'load',
    url: window.wbinfo.url,
    ts: window.wbinfo.timestamp
  };

  ipcRenderer.sendToHost('load', state);
});

document.addEventListener('hashchange', (evt) => {
  const state = {
    wb_type: 'hashchange',
    hash: window.location.hash
  };

  ipcRenderer.sendToHost('hashchange', state);
});
