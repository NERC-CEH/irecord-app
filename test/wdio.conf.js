const chai = require('chai');

exports.config = {
  // 4723 is the default port for Appium
  port: 4723,

  // How much detail should be logged. The options are:
  // 'silent', 'verbose', 'command', 'data', 'result', 'error'
  logLevel: 'error',

  // This defines which kind of device we want to test on, as well as how it should be
  // configured.
  capabilities: [
    // {
    //   platformName: 'iOS',
    //   platformVersion: '11.3',
    //   deviceName: 'iPhone 8', // this will launch the iPhone 8 emulator
    //   app: './dist/cordova/platforms/ios/build/emulator/iRecord App.app',
    //   autoWebview: true,
    //   autoGrantPermissions: true,
    //   autoAcceptAlerts: true,
    // },
    {
      // 'Android' or 'iOS'
      platformName: 'Android',

      // The version of the Android or iOS system
      platformVersion: '8.1',

      // For Android, Appium uses the first device it finds using "adb devices". So, this
      // string simply needs to be non-empty.
      // For iOS, this must exactly match the device name as seen in Xcode.
      deviceName: 'any',

      // Where to find the .apk or .ipa file to install on the device. The exact location
      // of the file may change depending on your Cordova version.
      app:
        './dist/cordova/platforms/android/build/outputs/apk/android-debug.apk',

      // By default, Appium runs tests in the native context. By setting autoWebview to
      // true, it runs our tests in the Cordova context.
      autoWebview: true,

      // When set to true, it will not show permission dialogs, but instead grant all
      // permissions automatically.
      autoGrantPermissions: true,
    },
  ],

  // Where the files we are testing can be found.
  specs: ['./test/acceptance/*.js'],

  // Use the Appium plugin for Webdriver. Without this, we would need to run appium
  // separately on the command line.
  services: ['appium'],
  appium: {
    args: {
      'chromedriver-executable':
        './node_modules/chromedriver/lib/chromedriver/chromedriver',
    },
  },

  // The reporter is what formats your test results on the command line. 'spec' lists
  // the names of the tests with a tick or X next to them. See
  // https://www.npmjs.com/search?q=wdio-reporter for a full list of reporters.
  reporters: ['spec'],

  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
  },

  before: function before() {
    /**
     * Setup the Chai assertion framework
     */
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should();
  },
};
