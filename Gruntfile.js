require('dotenv').config({ silent: true }); // get local environment variables from .env
const fs = require('fs');
const pkg = require('./package.json');

const exec = grunt => ({
  build: {
    command: 'NODE_ENV=production npm run build',
  },
  resources: {
    command: () => {
      const appMinorVersion = pkg.version
        .split('.')
        .splice(0, 2)
        .join('.');

      return `mkdir -p cordova/resources &&
                cp -R other/designs/android cordova/resources &&

                cp other/designs/splash.svg cordova/resources &&
                sed -i.bak 's/{{APP_VERSION}}/${appMinorVersion}/g' cordova/resources/splash.svg &&

                ./node_modules/.bin/sharp -i cordova/resources/splash.svg -o cordova/resources/splash.png resize 2737 2737 -- removeAlpha &&
                ./node_modules/.bin/sharp -i other/designs/icon.svg -o cordova/resources/icon.png resize 1024 1024 -- removeAlpha &&

                ./node_modules/.bin/cordova-res --skip-config --resources cordova/resources`;
    },
    stdout: false,
  },
  init: {
    command: './node_modules/.bin/cordova create cordova',
    stdout: false,
  },
  clean_www: {
    command: 'rm -R -f cordova/www/* && rm -f cordova/config.xml',
    stdout: true,
  },
  rebuild: {
    command: 'cd cordova/ && ../node_modules/.bin/cordova prepare ios android',
    stdout: true,
  },
  copy_build: {
    command: 'cp -R build/* cordova/www/',
    stdout: true,
  },
  add_platforms: {
    command:
      'cd cordova && ../node_modules/.bin/cordova platforms add ios android',
    stdout: false,
  },
  /**
   * $ANDROID_KEYSTORE must be set up to point to your android certificates keystore
   */
  android_build: {
    command() {
      const pass = grunt.config('keystore-password');
      return `cd cordova && 
              cordova --release build android && 
              cd platforms/android/app/build/outputs/apk/release/ &&
              jarsigner -keystore ${process.env.KEYSTORE}
                -storepass ${pass} app-release-unsigned.apk irecord &&
              zipalign 4 app-release-unsigned.apk main.apk &&
              mv -f main.apk ../../../../../../../`;
    },

    stdout: false,
    stdin: true,
  },

  build_ios: {
    command: 'cd cordova && cordova build ios',
    stdout: true,
  },

  build_android: {
    command: 'cd cordova && cordova build android',
    stdout: true,
  },
});

const replace = grunt => ({
  config: {
    src: ['cordova.xml'],
    dest: 'cordova/config.xml',
    replacements: [
      {
        from: /\{ID\}/g, // string replacement
        to: () => (grunt.option('android') ? 'uk.ac.ceh.irecord' : pkg.id),
      },
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
        to: () => pkg.build,
      },
      {
        from: /\{ANDROID_BUNDLE_VER\}/g,
        to: () => pkg.version.replace(/\./g, '') + pkg.build + 8,
      },
    ],
  },
});

const updateVersionAndBuild = ({ version, build }) => {
  let file = fs.readFileSync('./package.json', 'utf8');
  if (pkg.version !== version) {
    file = file.replace(pkg.version, version);
    file = file.replace(/"build": "\d+"/i, '"build": "1"');
    pkg.version = version;
    pkg.build = 1;
  } else {
    file = file.replace(/"build": "\d+"/i, `"build": "${build}"`);
    pkg.build = build;
  }
  fs.writeFileSync('./package.json', file, 'utf8');
};

const prompt = {
  keystore: {
    options: {
      questions: [
        {
          name: 'keystore-password',
          type: 'password',
          message: 'Please enter keystore password:',
        },
      ],
    },
  },
  version: {
    options: {
      questions: [
        {
          config: 'version',
          type: 'input',
          message: 'Enter new app version?',
          default: pkg.version,
        },
        {
          config: 'build',
          type: 'input',
          message: 'Enter new app build version?',
          default: pkg.build,
          when: ({ version }) => pkg.version === version,
        },
      ],
      then: updateVersionAndBuild,
    },
  },
};

function init(grunt) {
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.initConfig({
    exec: exec(grunt),
    replace: replace(grunt),
    prompt,
  });
}

module.exports = grunt => {
  init(grunt);

  grunt.registerTask('default', [
    'prompt:version',
    'exec:build',

    'exec:init',
    'exec:resources',
    'exec:clean_www',
    'exec:copy_build',
    'replace:config',
    'exec:add_platforms',

    // android
    'prompt:keystore',
    'cordova_prepAndroid',
    'replace:config',
    'exec:android_build',

    'checklist',
  ]);

  /**
   * Sets up the right SDK version and package ID for the config generator
   */
  grunt.registerTask('cordova_prepAndroid', () => {
    grunt.option('android', true);
  });

  grunt.registerTask('update', [
    'exec:clean_www',
    'exec:copy_build',
    'replace:config',
    'exec:rebuild',
  ]);

  grunt.registerTask('checklist', () => {
    const Reset = '\x1b[0m';
    const FgGreen = '\x1b[32m';
    const FgYellow = '\x1b[33m';
    const FgCyan = '\x1b[36m';

    const changelog = fs.readFileSync('./CHANGELOG.md', 'utf8');

    const versionExistsInChangelog = changelog.includes(pkg.version);
    if (!versionExistsInChangelog) {
      console.log(FgYellow);
      console.log('WARN:');
      console.log(`* Have you updated CHANGELOG.md?`);
    } else {
      console.log(FgGreen);
      console.log('Success! 👌');
    }

    console.log(FgCyan);
    console.log('NEXT:');
    console.log(`* Update screenshots.`);
    console.log(`* Update descriptions.`);

    console.log(Reset);
  });
};
