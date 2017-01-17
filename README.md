# webrecorder player

1. install electron and required npm modules

    	~ npm install

2. compile webrecorder standalone

 * macos/linux

			~ build-macos.sh 
	
 * windows

 			~ build-windows.sh (TODO)

 the binary is copied in `./python-binaries`

3. enable Flash: copy the [Pepperflashplayer](plugins/README.md) of a local Chrome/Chromium in `plugins`

4. start (debug)

    	~ npm start
    	
5. package

		~ npm install electron-packager
		~ electron-packager . --icon=ico/new.icns --overwrite