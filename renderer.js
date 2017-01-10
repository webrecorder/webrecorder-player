const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const dialog = electron.remote.dialog

const replay_webview = document.getElementById('replay')

/*
button #open
display a file selector and call ipc "open-warc" on main
*/
document.getElementById('open').addEventListener('click', _ => {
	dialog.showOpenDialog({
		properties: ['openFile'],
		filters: [
			{ name: 'Warc', extensions: ['gz'] },
		],
	}, function (filename) {
		ipcRenderer.send('open-warc', filename.toString());
	})
})

/*
renderer ipc "loadWebview"
called by main after pywb is executed, load a url into webview
*/
ipcRenderer.on('loadWebview', (event, message) => {
	replay_webview.loadURL(message)
})