const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const dialog = electron.remote.dialog

/*
button open warc
	display a file selector and call ipc "open-warc" on main
*/
document.getElementById('warc').addEventListener('click', _ => {
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
	called by main after pywb is executed
	load a url into webview
*/
ipcRenderer.on('loadWebview', (event, message) => {
	replay_webview.loadURL(message);
})

/*
listeners to DOM events of the webview #replay
http://electron.atom.io/docs/api/web-view-tag/#dom-events

	load-commit: Fired when a load has committed
	update the url and the date in the control bar

*/
const replay_webview = document.getElementById('replay')
replay_webview.addEventListener('load-commit', () => {
	replayed_url = require('url').parse(replay_webview.getURL()).path

	const regex = /(\d+)\/(.*)/g
	parts = regex.exec(replayed_url)
	const date = parts[1]
	const url = parts[2]

	document.getElementById('url').value = url

	archival_date = new Date(date.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,'$4:$5:$6 $2/$3/$1'));
	document.getElementById('date').value = `${archival_date.toLocaleDateString()} - ${archival_date.toLocaleTimeString()}`

})