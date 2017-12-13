# Webrecorder Player

Webrecorder Player is a desktop application for viewing high-fidelity web archives on your local machine, no internet connection required. Webrecorder Player is available for download for OSX, Windows and Linux (experimental).

### [Download Latest Release](https://github.com/webrecorder/webrecorderplayer-electron/releases/latest)

## Usage

1) Download the latest version for your platform. On OSX, you can move the extracted Webrecorder Player app into your Applications directory.

2) Start the application. (Note: At this time, Webrecorder Player is not yet signed through official app store, so you may have to accept launching unsigned apps).

3) Click **Load Web Archive** to select a web archive file and start browsing.

See [Visual Walkthrough](walkthrough.md)


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

		$ git clone https://github.com/webrecorder/webrecorderplayer-electron.git
		$ cd webrecorderplayer-electron

- install required npm modules

		$ npm install

- copy a release of python *webrecorder-player* into `./python-binaries`. You can obtain pre-built python binaries here:
  - [OS X](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/develop/webrecorder-player-osx)
  - [Windows 32-bit](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/develop/webrecorder-player-win-x32.exe)
  - [Windows 64-bit](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/develop/webrecorder-player-win-x64.exe)
  - [Linux](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/develop/webrecorder-player-linux)
  
  Or, you can compile the [Webrecorder](https://github.com/webrecorder/webrecorder) python binary following instructions found in the `build-macos.sh`.

- if you want to enable Flash you have to copy a flash plugin into `./plugins`. Follow these [instructions](plugins/README.md) to find a local copy of PepperFlashPlugin in Chrome/Chromium

- start the player

    	$ npm start

- package the player. a self-packaged version for you environment (linux, macos, windows) will be saved in `./dist`

        $ npm run dist

## Contact

Webrecorder Player is a project of [Rhizome](https://rhizome.org)

For issues with the project, you can open an issue or contact us at [support@webrecorder.io](mailto:support@webrecorder.io)


## License

Webrecorder is Licensed under the Apache 2.0 License. See [NOTICE](NOTICE) and [LICENSE](LICENSE) for details.


