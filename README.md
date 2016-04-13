# iRecord App
[![Build Status](https://travis-ci.org/NERC-CEH/irecord-app.svg?branch=master)](https://travis-ci.org/NERC-CEH/irecord-app)

An application that enables you to get involved in biological
recording. You can contribute your sightings with GPS acquired coordinates,
descriptions and other information, thus providing scientists with important
new biodiversity information that contributes to nature conservation,
planning, research and education.

App web demo page: [development demo](http://dev.irecord.org.uk).


## Contribution

Think you've found a bug or have a new feature to suggest?
[Let us know!](https://github.com/NERC-CEH/irecord-app/issues).

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

App configuration is hosted in `src/conf.js`.

**Note:** it should be done *before* building the code.


## Building

- Install [NodeJS](http://nodejs.org/)
- Get a copy of the code by running:

```bash
git clone git://github.com/NERC-CEH/irecord-app.git
```

- Enter the `irecord-app` directory and install the npm build dependencies:

```bash
cd irecord-app && npm install
```


### Cordova mobile app

- Build the project:

```bash
grunt cordova
```

- Update Cordova project with new web pages (replaces the www)

```bash
grunt cordova:update
```

### Web app

If you are building for the web platform only:

- Build the project:

`Production`

```bash
grunt
```

`Development`

```bash
grunt dev
```

This will create a `dist` folder with the app code and its dependencies.


## Running app locally

- [Express](http://expressjs.com/) framework is provided for a quick
launch of a web server.

```bash
node app.js
```

- Open the app on a browser [http://localhost:8000](http://localhost:8000)


## Authors

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>


## Copyright and license

Code copyright 2016 Centre for Ecology & Hydrology.
Code released under the [GNU GPL v3 license](LICENSE).