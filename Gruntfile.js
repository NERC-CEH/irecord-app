require('dotenv').config({ silent: true }); // get local environment variables from .env
const pkg = require('./package.json');

const build = process.env.BITRISE_BUILD_NUMBER || pkg.build;
const OFFSET = 10;

if (!build) throw new Error('BITRISE_BUILD_NUMBER env key is missing');

const replace = {
  config: {
    src: ['cordova.xml'],
    dest: 'cordova/config.xml',
    replacements: [
      {
        from: /\{APP_VER\}/g, // string replacement
        to: () => pkg.version,
      },
      {
        from: /\{APP_TITLE\}/g,
        to: () => pkg.title,
      },
      {
        from: /\{APP_DESCRIPTION\}/g,
        to: () => pkg.description,
      },
      {
        from: /\{BUNDLE_VER\}/g,
        to: () => build,
      },
      {
        from: /\{ANDROID_BUNDLE_VER\}/g,
        to: () => OFFSET + parseInt(build, 10),
      },
    ],
  },
};

const exec = () => ({
  build: {
    command: 'npm run clean && NODE_ENV=production npm run build',
  },
  init: {
    command: 'npx cordova create cordova',
    stdout: true,
  },
  resources: {
    command: `mkdir -p resources &&

              cp -R other/designs/android resources &&
              cp -R other/designs/*.png resources &&

              npx cordova-res --resources resources`,
  },
  clean_www: {
    command: 'rm -R -f cordova/www/* && rm -f cordova/config.xml',
    stdout: true,
  },
  copy_build: {
    command: 'cp -R build/* cordova/www/',
    stdout: true,
  },
  add_platforms: {
    command: 'cd cordova && npx cordova platforms add ios android',
  },
  /**
   * $ANDROID_KEYSTORE must be set up to point to your android certificates keystore
   */
  build_android: {
    command:
      'cd cordova && mkdir -p dist && npx cordova --release build android && npx cordova --debug build android',
    stdout: true,
  },

  build_ios: {
    command: 'cd cordova && npx cordova build ios',
    stdout: true,
  },
});

function init(grunt) {
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.initConfig({
    exec: exec(grunt),
    replace,
  });
}

module.exports = grunt => {
  init(grunt);

  grunt.registerTask('default', [
    'exec:build',

    'exec:init',
    'exec:resources',

    'exec:clean_www',
    'exec:copy_build',
    'replace:config',
    'exec:add_platforms',

    'exec:build_ios',
    'exec:build_android',
  ]);
};
