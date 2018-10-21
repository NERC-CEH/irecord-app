# iRecord App [![Build Status](https://travis-ci.org/NERC-CEH/irecord-app.svg?branch=master)](https://travis-ci.org/NERC-CEH/irecord-app)

An application that enables you to get involved in biological
recording. You can contribute your sightings with GPS acquired coordinates,
descriptions and other information, thus providing scientists with important
new biodiversity information that contributes to nature conservation,
planning, research and education.

App home page: **[live](https://irecord.org.uk/app/)**

App web demo page: **[development](https://irecord-app.herokuapp.com)**

## Requirements

* Android 5.0+ - or a WebView based on Chromium 37+
* [iOS 10+](https://github.com/ionic-team/cordova-plugin-ionic-webview#plugin-requirements)

## Contribution

Think you've found a bug or have a new feature to suggest?
[Let us know!](https://github.com/NERC-CEH/irecord-app/issues)

In the spirit of open source software development, we'd love for you to contribute
to our source code and make it better than it is today! To help you get started
and before you jump into writing code, please read the contribution guidelines
thoroughly:

Contribution guidelines:
[CONTRIBUTING.md](https://github.com/NERC-CEH/irecord-app/blob/master/CONTRIBUTING.md)


## Questions

If you have any questions, please feel free to ask on the
[iRecord forum](http://www.brc.ac.uk/irecord/forum/26).


## Configuration

App configuration is hosted in multiple places. **Note:** config changes should be done *before* building the code.

* **Main configuration** in `src/common/config.js`.
* App version/build is set in the package.json
* Cordova config is `other/cordova/cordova.xml`
* [Environmental variables](https://wiki.archlinux.org/index.php/environment_variables) like *INDICIA_API_KEY* can optionally be placed in `.env` file


## Building

- Install [NodeJS](http://nodejs.org/) ( > 4.5)

- Get a copy of the code by running:

```bash
git clone git://github.com/NERC-CEH/irecord-app.git
```

- Enter the `irecord-app` directory and install the npm build dependencies:

```bash
cd irecord-app
```
```bash
npm install
```

### Web app

If you are building for the web platform only:

`Production`

```bash
npm run build
```

`Development`

```bash
npm run build:dev
```

This will create a `dist` folder with the app code and its dependencies.


#### Running app locally

- [Express](http://expressjs.com/) framework is provided for a quick
launch of a web server.

```bash
npm start
```

- Open the app on a browser [http://localhost:8000](http://localhost:8000)


### Cordova app

Building a cordova application requires cordova 7.1.0

- Initialize the project:

```bash
npm run build:cordova
```

- This will create a `dist/cordova` folder with the cordova project

- *(optionally)* Update Cordova project with new web pages if you have initialized
 but have made some source code changes (ie. only replaces the www folder contents)

```bash
npm run build:cordova:update
```

- **Android build**:

```bash
npm run build:cordova:android
```

- **iOS build** open `dist/cordova/platforms/ios/iRecord App.xcodeproj` in XCode


### Shortcuts

For more shortcuts please see the `package.json` and dig in the `config/build/aliases.js` file that is used by grunt runner.

## Authors

[Karolis Kazlauskis](https://github.com/kazlauskis)


## Copyright and license

Code copyright 2017 Centre for Ecology & Hydrology.
Code released under the [GNU GPL v3 license](LICENSE).
