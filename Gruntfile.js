const webpackConfig = require('./src/webpack.config.js');
const webpackConfigDev = require('./src/webpack.config.dev.js');

module.exports = function exports(grunt) {
  'use strict';

  const SCRIPTS = 'src/scripts/';
  const CONFIG_NAME = 'config/config';
  const CONFIG_DEV_NAME = 'config/config_dev';

  grunt.option('platform', 'web');

  const pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,

    bower: {
      install: {
        options: {
          targetDir: 'src/vendor',
          layout: 'byComponent',
          cleanBowerDir: false,
        },
      },
    },

    copy: {
      main: {
        files: [
          // HTML
          {
            src: 'src/*.html', dest: 'dist/',
            expand: true, flatten: true,
          },
          {
            src: 'src/*.json', dest: 'dist/',
            expand: true, flatten: true,
          },
          {
            src: '**', cwd: 'src/images/', dest: 'dist/images/',
            expand: true, filter: 'isFile',
          },
          // CSS
          {
            src: 'src/vendor/**/css/*', dest: 'dist/styles/',
            expand: true, flatten: true,
          },
          // FONTS
          {
            src: 'src/vendor/fontello/font/*', dest: 'dist/font/',
            expand: true, flatten: true,
          },
        ],
      },
    },


    jst: {
      compile: {
        options: {
          amd: true,
          namespace: 'JST',
          templateSettings:
          {
            variable: 'obj',
          },
          prettify: true,
          processName(filepath) {
            const templatesDir = '/templates';
            let path = filepath;

            // strip all until components folder
            path = path.split('src/scripts/components/')[1];

            // remove 'pages' from common/pages
            if (path.indexOf('common/pages') >= 0) {
              path = path.replace('/pages', '');
            }

            // remove extension
            path = path.split('.')[0];

            // cut out templates dir
            const dirIndex = path.indexOf(templatesDir);
            if (dirIndex) {
              path = path.substr(0, dirIndex) +
                path.substr(dirIndex + templatesDir.length);
            }

            return path;
          },
        },
        files: {
          'src/scripts/JST.js': [
            'src/scripts/components/**/**/**/**/*.tpl',
            'src/scripts/components/common/templates/*.tpl',
            'src/scripts/helpers/templates/*.tpl',
          ],
        },
      },
    },


    replace: {
      // Fix double define problem
      bootstrap: {
        src: ['src/vendor/bootstrap/js/bootstrap.js'],
        overwrite: true,
        replacements: [
          {
            from: 'if (typeof jQuery === \'undefined\') {',
            to: 'var jQuery = require(\'jquery\'); \nif (false) {',
          },
        ],
      },
      // Fix double define problem
      latlon: {
        src: ['src/vendor/latlon/js/latlon-ellipsoidal.js',
          'src/vendor/latlon/js/latlon-spherical.js'],
        overwrite: true,
        replacements: [
          {
            from: 'if (typeof module != \'undefined\' && module.exports) ' +
            'module.exports.Vector3d = Vector3d;',
            to: '',
          },
          {
            from: 'if (typeof define == \'function\' && define.amd) ' +
            'define([], function() { return Vector3d; });',
            to: '',
          },
          {
            from: 'if (typeof define == \'function\' && define.amd) ' +
            'define([\'Dms\'], function() { return LatLon; });',
            to: '',
          },
        ],
      },
      // Fix iOS 8 readonly broken IndexedDB
      indexedDBShim: {
        src: ['src/vendor/IndexedDBShim/js/IndexedDBShim.js'],
        overwrite: true,
        replacements: [
          {
            from: 'shim(\'indexedDB\', idbModules.shimIndexedDB);',
            to: 'shim(\'_indexedDB\', idbModules.shimIndexedDB);',
          },
          {
            from: 'shim(\'IDBKeyRange\', idbModules.IDBKeyRange);',
            to: 'shim(\'_IDBKeyRange\', idbModules.IDBKeyRange);',
          },
        ],
      },

      // ratchet's modal functionality is not compatable with spa routing
      ratchet: {
        src: ['src/vendor/ratchet/js/ratchet.js'],
        overwrite: true,
        replacements: [{
          from: 'getModal(event)',
          to: 'null',
        }],
      },

      // App NAME and VERSION
      main: {
        src: [
          `${SCRIPTS + CONFIG_NAME}.js`,
          `${SCRIPTS + CONFIG_DEV_NAME}.js`,
        ],
        dest: `${SCRIPTS}`,
        overwrite: false, // overwrite matched source files
        replacements: [
          {
            from: /\{APP_VER\}/g, // string replacement
            to: '<%= pkg.version %>',
          },
          {
            from: /\{APP_NAME\}/g,
            to: '<%= pkg.name %>',
          },
          {
            from: /\{APP_BUILD\}/g,
            to: '<%= pkg.build %>',
          },
        ],
      },

      // need to remove Ratchet's default fonts to work with fontello ones
      ratchet_fonts: {
        src: ['src/vendor/ratchet/css/ratchet.css'],
        overwrite: true,
        replacements: [
          {
            from: /font-family: Ratchicons;/g,
            to: '',
          },
          {
            from: /src: url\(\"\.\.\/fonts.*;/g,
            to: '',
          }],
      },

      // need to remove Ratchet's default fonts to work with fontello ones
      development_code: {
        src: ['dist/index.html'],
        overwrite: true,
        replacements: [{
          from: /<!-- DEVELOPMENT -->(.|\n)*<!-- \/DEVELOPMENT -->/g,
          to: '',
        }],
      },

      // Cordova config changes
      cordova_config: {
        src: [
          'src/config.xml',
        ],
        dest: 'src/config_build.xml',
        replacements: [
          {
            from: /\{ID\}/g, // string replacement
            to: '<%= pkg.id %>',
          },
          {
            from: /\{APP_VER\}/g, // string replacement
            to: '<%= pkg.version %>',
          },
          {
            from: /\{APP_TITLE\}/g,
            to: '<%= pkg.title %>',
          },
          {
            from: /\{APP_DESCRIPTION\}/g,
            to: '<%= pkg.description %>',
          },
          {
            from: /\{BUNDLE_VER\}/g,
            to: '<%= pkg.build %>',
          },
          {
            from: /\{ANDROID_BUNDLE_VER\}/g,
            to: function () {
              return pkg.version.replace(/\./g,'') + pkg.build;
            },
          },
        ],
      },
    },


    uglify: {
      indexedDB: {
        options: {
          banner:
          '/**\n' +
          '* IndexedDBShim\n ' +
          '* https://github.com/axemclion/IndexedDBShim\n ' +
          '*/\n',
        },
        files: {
          'src/vendor/IndexedDBShim/js/IndexedDBShim.min.js': [
            'src/vendor/IndexedDBShim/js/IndexedDBShim.js',
          ],
        },
      },
      backbone: {
        options: {
          banner:
          '//     Backbone.js 1.1.2\n' +
          '//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and ' +
          'Investigative Reporters & Editors\n' +
          '//     Backbone may be freely distributed under the MIT license.\n' +
          '//     For all details and documentation:\n' +
          '//     http://backbonejs.org */\n',
        },
        files: {
          'src/vendor/backbone/js/backbone.min.js': [
            'src/vendor/backbone/js/backbone.js',
          ],
        },
      },
      fastclick: {
        options: {
          banner:
          '/** \n' +
          '* @preserve FastClick: polyfill to remove click delays on browsers with touch UIs. \n' +
          '* \n' +
          '* @version 1.0.3 \n' +
          '* @codingstandard ftlabs-jsv2 \n' +
          '* @copyright The Financial Times Limited [All Rights Reserved] \n' +
          '* @license MIT License (see LICENSE.txt) \n' +
          '*/\n',
        },
        files: {
          'src/vendor/fastclick/js/fastclick.min.js': ['src/vendor/fastclick/js/fastclick.js'],
        },
      },
      dms: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - -  */\n' +
          '/*  Geodesy representation conversion functions  (c) Chris Veness 2002-2015  */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong.html              MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - -  */\n',
        },
        files: {
          'src/vendor/latlon/js/dms.min.js': ['src/vendor/latlon/js/dms.js'],
        },
      },
      latlon_ellipsoid: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */\n' +
          '/* Geodesy tools for an ellipsoidal earth model (c) Chris Veness 2005-2015   */\n' +
          '/* MIT Licence                                                               */\n' +
          '/* Includes methods for converting lat/lon coordinates between               */\n' +
          '/* different coordinate systems.                                             */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong-convert-coords.html            */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */\n',
        },
        files: {
          'src/vendor/latlon/js/latlon-ellipsoidal.min.js': [
            'src/vendor/latlon/js/latlon-ellipsoidal.js',
          ],
        },
      },
      latlon_spherical: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - -  */\n' +
          '/*  Latitude/longitude spherical geodesy formulae & scripts         ' +
          '  (c) Chris Veness 2002-2015  */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong.html              MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - -  */\n',
        },
        files: {
          'src/vendor/latlon/js/latlon-spherical.min.js': [
            'src/vendor/latlon/js/latlon-spherical.js',
          ],
        },
      },

      osgridref: {
        options: {
          // the banner is inserted at the top of the output
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -   */\n' +
          '/*  Ordnance Survey Grid Reference functions            ' +
          '(c) Chris Veness 2005-2015 / MIT Licence  */\n' +
          '/*  Formulation implemented here due to Thomas, Redfearn, ' +
          'etc is as published by OS, but is       */\n' +
          '/*  inferior to Krüger as used by e.g. Karney 2011.                          */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - -- - - - - - - -  */\n',
        },
        files: {
          'src/vendor/latlon/js/osgridref.min.js': ['src/vendor/latlon/js/osgridref.js'],
        },
      },
      vector3d: {
        options: {
          // the banner is inserted at the top of the output
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - -  */\n' +
          '/*  Vector handling functions      (c) Chris Veness 2011-2015 / MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - -  */\n',
        },
        files: {
          'src/vendor/latlon/js/vector3d.min.js': ['src/vendor/latlon/js/vector3d.js'],
        },
      },
    },

    sass: {
      dist: {
        files: {
          'dist/styles/main.css': 'src/styles/main.scss',
        },
        options: {
          sourcemap: 'none',
          style: 'expanded',
        },
      },
    },

    cssmin: {
      target: {
        files: [{
          src: [
            'dist/styles/bootstrap.css',
            'dist/styles/ratchet.css',
            'dist/styles/ionic.css',
            'dist/styles/leaflet.css',
            'dist/styles/icons.css',
            'dist/styles/photoswipe.css',
            'dist/styles/default-skin.css',
            'dist/styles/main.css',
          ],
          dest: 'dist/styles/main.min.css',
        }],
      },
    },

    clean: {
      dist: [
        'dist/vendor/*',
        '!dist/vendor/require.min.js',
        // styles
        'dist/styles/*',
        '!dist/styles/main.min.css',
        // scripts
        'dist/scripts/*',
        '!dist/scripts/main-built.js',
        // data
        '!dist/scripts/data',
        'dist/scripts/data/raw',
      ],
    },

    exec: {
      cordova_init: {
        command: 'cordova create cordova',
        stdout: true,
      },
      cordova_clean_www: {
        command: 'rm -R cordova/www/* && rm cordova/config.xml',
        stdout: true,
      },
      cordova_copy_dist: {
        command: 'cp -R dist/* cordova/www/ && cp src/config_build.xml cordova/config.xml',
        stdout: true,
      },
      cordova_add_platforms: {
        command: 'cd cordova && cordova platforms add ios android',
        stdout: true,
      },
    },

    karma: {
      local: {
        configFile: 'test/karma.conf.js',
      },
      sauce: {
        configFile: 'test/karma.conf-sauce.js',
      },
    },

    webpack: {
      // Main run
      main: webpackConfig,

      // Development run
      dev: webpackConfigDev,

      build: {
        // configuration for this build
      },
    },
  });

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');


  // the default task can be run just by typing 'grunt' on the command line
  grunt.registerTask('init', [
    'bower',
    'replace:bootstrap',
    'replace:indexedDBShim',
    'replace:latlon',
    'replace:ratchet',
    'replace:ratchet_fonts',
    'uglify',
    'copy',
  ]);

  grunt.registerTask('run', [
    'sass',
    'cssmin',
    'jst',
    'replace:main',
  ]);

  grunt.registerTask('default', [
    'init',
    'run',
    'webpack:main',
    'replace:development_code',
  ]);

  // Development run
  grunt.registerTask('update', [
    'run',
    'webpack:main',
    'replace:development_code',
  ]);

  grunt.registerTask('cordova', 'Cordova tasks', update => {
    if (update) {
      // update only

      grunt.task.run('replace:cordova_config');

      // update www
      grunt.task.run('exec:cordova_clean_www');
      grunt.task.run('exec:cordova_copy_dist');
      return;
    }

    // prepare www source
    grunt.task.run('default');

    grunt.task.run('replace:cordova_config');

    // init cordova source
    grunt.task.run('exec:cordova_init');

    // add www source to cordova
    grunt.task.run('exec:cordova_clean_www');
    grunt.task.run('exec:cordova_copy_dist');
    grunt.task.run('exec:cordova_add_platforms');
  });

  // Development update
  grunt.registerTask('dev', [
    'init',
    'run',
    'webpack:dev',
  ]);

  // Development run
  grunt.registerTask('dev:update', [
    'run',
    'webpack:dev',
  ]);

  grunt.registerTask('test', ['karma:local']);
  grunt.registerTask('test:sauce', ['karma:sauce']);
};
