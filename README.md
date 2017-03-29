# webrecorderplayer
Browse Web Archives offline.

## {{Introduction}}
+screenshots



## Build locally

- clone this repository

		$ git clone https://github.com/webrecorder/webrecorderplayer-electron/tree/readme
		$ cd webrecorderplayer-electron

- install required npm modules

		$ npm install

- copy a release of **webrecorderplayer** into `./python-binaries`. you can get a [prebuilt](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/master/) **!!!CAN WE CREATE A index.html HERE? !!!** release , otherwise you can compile it following instructions in the script `build-macos.sh`

- if you want to enable Flash you have to copy a flash plugin into `./plugins`. Follow these [instructions](plugins/README.md) to find a local copy of PepperFlashPlugin in Chrome/Chromium 

- start the player

    	$ npm start
    	
- package the player. a self-packaged version for you environment (linux, macos, windows) will be saved in `./dist`

		$ npm run dist


	