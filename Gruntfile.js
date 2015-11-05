module.exports = function (grunt) {
  var DEST = 'dist/',
      SCRIPTS = 'dist/scripts/',
      MANIFEST_NAME = 'manifest.json',
      CONFIG_NAME = 'config/app',
      CONFIG_DEV_NAME = 'config/dev';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    bower: {
      install: {
        options: {
          targetDir: 'src/scripts/libs',
          layout: 'byComponent',
          cleanBowerDir: false
        }
      }
    },


    copy: {
      main: {
        files: [
          //HTML
          {
            src: "src/*.html", dest: 'dist/',
            expand: true, flatten: true
          },
          {
            src: "src/*.json", dest: 'dist/',
            expand: true, flatten: true
          },
          {
            src: "src/images/**", dest: 'dist/images/',
            expand: true, flatten: true, filter: 'isFile'
          },
          {
            src: "src/images/ajax-loader.gif", dest: 'dist/styles/images/',
            expand: true, flatten: true
          },
          //JS
          {
            src: "src/scripts/libs/**/js/*", dest: 'dist/scripts/libs/',
            expand: true, flatten: true
          },
          {
            src: "src/scripts/libs/**/css/*", dest: 'dist/styles/',
            expand: true, flatten: true
          }
        ]
    }
    },


    jst: {
      compile: {
        options: {
          amd: true,
          namespace: 'JST',
          prettify: true,
          processName: function(filepath) {
            return filepath.split('templates/')[1].split('.')[0];
          }
        },
        files: {
          "dist/scripts/JST.js": [
            "src/templates/*.tpl",
            "src/templates/**/*.tpl"
          ]
        }
      }
    },


    replace: {
      // Fix double define problem
      latlon: {
        src: ['src/scripts/libs/latlon/js/latlon-ellipsoidal.js'],
        overwrite: true,
        replacements: [
          {
            from: 'if (typeof module != \'undefined\' && module.exports) module.exports.Vector3d = Vector3d;',
            to: ''
          },
          {
            from: 'if (typeof define == \'function\' && define.amd) define([], function() { return Vector3d; });',
            to: ''
          }
        ]
      },
      //Fix iOS 8 readonly broken IndexedDB
      indexedDBShim: {
        src: ['src/scripts/libs/IndexedDBShim/js/IndexedDBShim.js'],
        overwrite: true,
        replacements: [
          {
            from: 'shim(\'indexedDB\', idbModules.shimIndexedDB);',
            to:  'shim(\'_indexedDB\', idbModules.shimIndexedDB);'
          },
          {
            from: 'shim(\'IDBKeyRange\', idbModules.IDBKeyRange);',
            to:  'shim(\'_IDBKeyRange\', idbModules.IDBKeyRange);'
          }
        ]
      },
      //App NAME and VERSION
      main: {
        src: [
          SCRIPTS + CONFIG_NAME + '.js',
          SCRIPTS + CONFIG_DEV_NAME + '.js',
          DEST + MANIFEST_NAME
        ],
        overwrite: true, // overwrite matched source files
        replacements: [{
          from: /{APP_VER}/g, // string replacement
          to: '<%= pkg.version %>'
        },
          {
            from: /{APP_NAME}/g,
            to: '<%= pkg.name %>'
          }
        ]
      },

      //App CONFIG
      config: {
        src: [SCRIPTS + 'main.js'],
        overwrite: true,
        replacements: [{
          from: /{CONFIG}/g,
          to: CONFIG_NAME
        }]
      },

      dev_config: {
        src: [SCRIPTS + 'main.js'],
        overwrite: true,
        replacements: [{
          from: /{CONFIG}/g,
          to: CONFIG_DEV_NAME
        }]
      }
    },


    uglify: {
      indexedDB: {
        options: {
          banner:
          '/**\n' +
          '* IndexedDBShim\n ' +
          '* https://github.com/axemclion/IndexedDBShim\n ' +
          '*/\n'
        },
        files: {
          'src/scripts/libs/IndexedDBShim/js/IndexedDBShim.min.js': ['src/scripts/libs/IndexedDBShim/js/IndexedDBShim.js']
        }
      },
      backbone: {
        options: {
          banner:
          '//     Backbone.js 1.1.2\n' +
          '//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n' +
          '//     Backbone may be freely distributed under the MIT license.\n' +
          '//     For all details and documentation:\n' +
          '//     http://backbonejs.org */\n'
        },
        files: {
          'src/scripts/libs/backbone/js/backbone.min.js': ['src/scripts/libs/backbone/js/backbone.js']
        }
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
          '*/\n'
        },
        files: {
          'src/scripts/libs/fastclick/js/fastclick.min.js': ['src/scripts/libs/fastclick/js/fastclick.js']
        }
      },
      dms: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n' +
          '/*  Geodesy representation conversion functions                       (c) Chris Veness 2002-2015  */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n'
        },
        files: {
          'src/scripts/libs/latlon/js/dms.min.js': ['src/scripts/libs/latlon/js/dms.js']
        }
      },
      latlon_ellipsoid: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n' +
          '/* Geodesy tools for an ellipsoidal earth model         (c) Chris Veness 2005-2015 / MIT Licence  */\n' +
          '/*                                                                                                */\n' +
          '/* Includes methods for converting lat/lon coordinates between different coordinate systems.      */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong-convert-coords.html                                 */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n'
        },
        files: {
          'src/scripts/libs/latlon/js/latlon-ellipsoidal.min.js': ['src/scripts/libs/latlon/js/latlon-ellipsoidal.js']
        }
      },
      osgridref: {
        options: {
          // the banner is inserted at the top of the output
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n' +
          '/*  Ordnance Survey Grid Reference functions            (c) Chris Veness 2005-2015 / MIT Licence  */\n' +
          '/*  Formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is       */\n' +
          '/*  inferior to Krüger as used by e.g. Karney 2011.                                               */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n'
        },
        files: {
          'src/scripts/libs/latlon/js/osgridref.min.js': ['src/scripts/libs/latlon/js/osgridref.js']
        }
      },
      vector3d: {
        options: {
          // the banner is inserted at the top of the output
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n' +
          '/*  Vector handling functions                           (c) Chris Veness 2011-2015 / MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n'
        },
        files: {
          'src/scripts/libs/latlon/js/vector3d.min.js': ['src/scripts/libs/latlon/js/vector3d.js']
        }
      },
      requirejs: {
        options: {
          // the banner is inserted at the top of the output
          banner:
          '/** vim: et:ts=4:sw=4:sts=4\n' +
          '* @license RequireJS 2.1.16 Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.\n' +
          '* Available via the MIT or new BSD license.\n' +
          '* see: http://github.com/jrburke/requirejs for details\n' +
          '*/\n'
        },
        files: {
          'src/scripts/libs/requirejs/js/require.min.js': ['src/scripts/libs/requirejs/js/require.js']
        }
      }
    },

    sass: {
      dist: {
        files: {
          'dist/styles/main.css': 'src/styles/main.scss'
        },
        options: {
          sourcemap: 'none',
          style: 'expanded'
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          src: [
            'dist/styles/jquery.mobile.custom.structure.min.css',
            'dist/styles/icons.css',
            'dist/styles/main.css'
          ],
          dest: 'dist/styles/main.min.css'
        }]
      }
    },

    fontello: {
      dist: {
        options: {
          config  : 'src/images/icons/config.json',
          fonts   : 'dist/font',
          styles  : 'dist/styles/'
        }
      }
    },

    babel: {
      options: {},
      files: {
        expand: true,
        cwd: 'src',
        src: ['scripts/**/*.es6'],
        dest: 'dist',
        ext: '.js'
      }
    },

    requirejs: {
      compile: {
        options: {
          verbose: true,
          baseUrl: "dist/scripts/",
          mainConfigFile: 'dist/scripts/main.js',
          name: "main",
          out: "dist/scripts/main-built.js",

          optimize: 'none',
          paths: {
            data: 'empty:'
          }

        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-fontello');
  grunt.loadNpmTasks('grunt-babel');


  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('init', [
    'bower',
    'replace:indexedDBShim',
    'replace:latlon',
    'uglify',
    'fontello',
    'copy'
  ]);

  grunt.registerTask('run', [
    'babel',
    'sass',
    'cssmin',
    'jst',
    'replace:main'
  ]);

  grunt.registerTask('default', [
    'init',
    'run',
    'replace:config',
    'requirejs'
  ]);

  //Development run
  grunt.registerTask('dev', [
    'run',
    'replace:dev_config'
  ]);
};