# webrecorderplayer

1. **Choose the local web archive you would like to open.**
![Loading a WARC](https://s3.amazonaws.com/wr-demo-assets/gif_01_Load.gif "Webrecorder Player Loading")  

2. **Browse web archive offline.**
![Browsing a WARC](https://s3.amazonaws.com/wr-demo-assets/gif_02_open.gif "Browsing WARC")


## What are Web Archives?

A web archive is a record of web resources. It may include HTML and images, scripts, stylesheets, as well as video, audio and other elements that web pages and web apps are made of, all in one file.

Webrecorder Player currently supports browsing web archives in the following formats:

- [WARC format](https://en.wikipedia.org/wiki/Web_ARChive) **(.warc, warc.gz)** — the most commonly used one
- [HAR format](https://en.wikipedia.org/wiki/.har) **(.har)**
- [ARC format](http://archive.org/web/researcher/ArcFileFormat.php) **(.arc, .arg.gz)**


## How do I Create Web Archives?
You can use free service [https://webrecorder.io](https://webrecorder.io) to create, view, share and save your web archives online.

To view your web archives offline, you can download them from [https://webrecorder.io](https://webrecorder.io) and use this app to browse your archives.




------

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
