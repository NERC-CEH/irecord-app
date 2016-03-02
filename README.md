# irecord-app
iRecord mobile application

## Configuration

App configuration hosted in `src/conf.js`.

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


### Cordova

- Build the project:

```bash
grunt cordova
```

- Update Cordova project with new www

```bash
grunt cordova:update
```

### Web

If you are building for the web platform only then:

- Build the project:

`Production`

```bash
grunt
```

`Testing/development`

```bash
grunt bower dev
```


This will create a `dist` folder with the app code and its dependencies.


## Running locally

[Express](http://expressjs.com/) framework is provided for a quick launch of a web server.

```bash
node app.js
```

Note: Make sure the server MIME has **application/json**


## Bugs and feature requests

Have a bug or a feature request? search for existing and closed issues. [Please open a new issue](https://github.com/NERC-CEH/irecord-dragonfly-app/issues).


## Creators

**Karolis Kazlauskis**

- <https://github.com/kazlauskis>


## Copyright and license

Code and documentation copyright 2015 CEH. Code released under the [GNU GPL v3 license](LICENSE).
Media (photos, maps) all rights reserved.
