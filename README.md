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

Most of the code for Webrecorder, both backend and frontend is found in our main [webrecorder/webrecorder](https://github.com/webrecorder/webrecorder) repository.

This repository includes the Electron wrapper and includes `webrecorder/webrecorder` as a submodule.
Building locally requires Node and Python.


1) Clone this repository with submodules:

		$ git clone --recurse-submodules https://github.com/webrecorder/webrecorderplayer-electron
   or for older versions of git:

		$ git clone https://github.com/webrecorder/webrecorderplayer-electron.git
 
		$ git submodule update --init --recursive
		

2) Switch to the directory and install node modules (`yarn` or `npm` should work):

		$ cd webrecorderplayer-electron; yarn install
		
3) Build the Webrecorder python binary by running the build script. This requires Python 3.5+:

		$ bash ./build-wr.sh

   Alternatively, you can manually download the latest python binary, placing it into ``python-binaries/webrecorder_player``. You can obtain pre-built python binaries here:
     - [OS X](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/master/webrecorder-player-osx)
     - [Windows 32-bit](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/master/webrecorder-player-win-x32.exe)
     - [Windows 64-bit](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/master/webrecorder-player-win-x64.exe)
     - [Linux](https://s3.amazonaws.com/webrecorder-builds/webrecorder-player/master/webrecorder-player-linux)
  
  
4) (Optional) if you want to enable Flash you have to copy a flash plugin into `./plugins`.

   Follow these [instructions](plugins/README.md) to find a local copy of PepperFlashPlugin in Chrome/Chromium

5) Build the electron and webrecorder packages:

		$ yarn run build
	
6) To start in Dev mode run:

		$ yarn run start-dev

7) A final packaged binary version of Webrecorder Player can be created for your environment (Linux, OSX, Windows) and placed in `./dist` by running:

		$ yarn run dist

## Contact

Webrecorder Player is a project of [Rhizome](https://rhizome.org)

For issues with the project, you can open an issue or contact us at [support@webrecorder.io](mailto:support@webrecorder.io)


## License

Webrecorder is Licensed under the Apache 2.0 License. See [NOTICE](NOTICE) and [LICENSE](LICENSE) for details.


