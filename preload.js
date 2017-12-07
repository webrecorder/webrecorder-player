const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', (evt) => {
  // if wbinfo is not present assume 404
  if (typeof window.wbinfo !== 'undefined') {
    const state = {
      wb_type: 'load',
      url: window.wbinfo.url,
      ts: window.wbinfo.timestamp
    };

    ipcRenderer.sendToHost('load', state);
  } else {
    ipcRenderer.sendToHost('not-found', {wb_type: 'not-found'});
  }
});

document.addEventListener('hashchange', (evt) => {
  const state = {
    wb_type: 'hashchange',
    hash: window.location.hash
  };

  ipcRenderer.sendToHost('hashchange', state);
});

document.addEventListener('drop', (evt) => {
  evt.preventDefault();

  const filename = evt.dataTransfer.files[0].path;
  const state = {
    wb_type: 'open',
    filename
  };

  ipcRenderer.sendToHost('open', state);
});

document.addEventListener('dragover', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
});
