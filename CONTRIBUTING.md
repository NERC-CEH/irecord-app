# Intro

Here is some important information about the project workings and its development.

The app is written in [ECMAScript 2015](http://es6-features.org) (**ES6**) the 
new Javascript standard. Unfortunately, not all of the browsers support this yet,
so the code is transpiled to ES5 using Babel compiler. To see what ES6 features Babel
transpiles check the [Babel Docs](https://babeljs.io/docs/learn-es2015).

The code is packaged up by [Webpack](https://webpack.github.io) module bundler. It
takes care of passing the ES6 code through Babel and pulling the code together
to make an *dist/app.js* file that is loaded in the *index.html*.


## Style Guide

The code is *[eslint](http://eslint.org)*'ed, to detect issues early on, so it is 
important to lint your code before commiting the changes to the repository.
To do that you can run eslint command line tool or choose one of the numerous 
eslint plugins for your IDE.

Project uses [AirBnB Style Guide](https://github.com/airbnb/javascript).


# Architecture

The app is designed around [Backbone](backbone.org) framework that helps to 
structure the code
into a MV* like pattern. Backbone is very open on how you build your app and is also
missing some useful *View* functionality that other frameworks like Angular or Ember
provide, so we use Backbone plugin [Marionette](marionettejs.org) to extend and 
improve the Backbone Views. Since Backbone doesn't provide a controller - 
the logic is shared between Views (making them somewhat presenter like), 
we have introduced simple controllers which hold the internal app logic. 
The app is structured in such a way:  

```
├── images
├── scripts
│   ├── components
│   │   ├── common
│   │   │   ├── pages
│   │   │   └── templates
│   │   └── **component**
│   │       └── **sub component**
│   │           └── templates
│   ├── config
│   ├── data
│   │   └── raw
│   └── helpers
├── styles
│   ├── common
│   └── **component**
└── vendor
```

## Components folder

* App **components** - a group of page-like components (sub components) providing similar
 functionality eg. records, maping, information pages. 
 Components should work independently between each other, so that for example mapping should
 have no dependencies on record components.

* App **sub components** - page-like components. For example *records* component 
includes: list, edit, attribute, show sub components.  

* Common files or pages between components are placed in *common* folder.

* Common page level components (common sub components) are placed in *pages* 
folder within common folder.


## Helpers folder

* App helper libraries
* Independent from Marionette, otherwise should be in *common*
* Too small to be put into vendor


## Other

*App* object holds the app component APIs;

For clarity reasons, Libraries and Helper code must be imported as capitalized 
variables: App, Backbone, Device, GPS etc.


# Continous Integration and Testing

New functionality should be provided with tests in *\_\_tests\_\_* folder next to the 
code that is being tested. It is important to test any new code on as many devices
as possible so for that we are using Travis CI. It detects new repository 
commits and runs the app tests on 20+ browsers using Sauce Labs. To see the build
test output visit [Travis project builds](https://travis-ci.org/NERC-CEH/irecord-app).

- To run the tests locally:

```bash
grunt test
```

# Cordova

## Signing

Generate a key with first one if don't have one
```bash
jarsigner -keytool -genkey -v -keystore irecord.keystore -alias irecord -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore irecord.keystore android-release-unsigned.apk irecord
```

Zipalign is in sdk build tools. On Mac /Applications/Android/sdk/build-tools/

```bash
zipalign -v 4 android-release-unsigned.apk irecord.apk
```
