module.exports = function (grunt) {
  var DEST = 'dist/',
      SCRIPTS = 'dist/scripts/',
      MANIFEST_NAME = 'appcache.manifest',
      CONFIG_NAME = 'config/main',
      CONFIG_DEV_NAME = 'config/main_dev';

  grunt.option('platform', 'web');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    bower: {
      install: {
        options: {
          targetDir: 'src/vendor',
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
            src: ['src/appcache.manifest'], dest: 'dist/appcache.manifest'
          },
          {
            src: "src/*.json", dest: 'dist/',
            expand: true, flatten: true
          },
          {
            src: "**", cwd: 'src/images/', dest: 'dist/images/',
            expand: true, filter: 'isFile'
          },
          {
            src: "src/images/ajax-loader.gif", dest: 'dist/styles/images/',
            expand: true, flatten: true
          },
          //JS
          {
            src: ["src/vendor/**/js/*"], dest: 'dist/vendor/',
            expand: true, flatten: true
          },
          //CSS
          {
            src: "src/vendor/**/css/*", dest: 'dist/styles/',
            expand: true, flatten: true
          },
          //FONTS
          {
            src: "src/vendor/fontello/font/*", dest: 'dist/font/',
            expand: true, flatten: true
          },
          //DATA
          {
            src: "src/data/*", dest: 'dist/scripts/data/',
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
            var templatesDir = '/templates';

            //strip all until components folder
            filepath = filepath.split('src/scripts/components/')[1];

            //remove 'pages' from common/pages
            if (filepath.indexOf('common/pages') >= 0) {
              filepath = filepath.replace('/pages', '');
            }

            //remove extension
            filepath = filepath.split('.')[0];

            //cut out templates dir
            var dirIndex = filepath.indexOf(templatesDir);
            if (dirIndex){
              filepath = filepath.substr(0, dirIndex) +
                filepath.substr(dirIndex + templatesDir.length);
            }

            return filepath;
          }
        },
        files: {
          "dist/scripts/JST.js": [
            "src/scripts/components/**/**/**/**/*.tpl",
            "src/scripts/components/common/templates/*.tpl",
            "src/scripts/helpers/templates/*.tpl"
          ]
        }
      }
    },


    replace: {
      // Fix double define problem
      latlon: {
        src: ['src/vendor/latlon/js/latlon-ellipsoidal.js',
          'src/vendor/latlon/js/latlon-spherical.js'],
        overwrite: true,
        replacements: [
          {
            from: 'if (typeof module != \'undefined\' && module.exports) module.exports.Vector3d = Vector3d;',
            to: ''
          },
          {
            from: 'if (typeof define == \'function\' && define.amd) define([], function() { return Vector3d; });',
            to: ''
          },
          {
            from: 'if (typeof define == \'function\' && define.amd) define([\'Dms\'], function() { return LatLon; });',
            to: ''
          }
        ]
      },
      //Fix iOS 8 readonly broken IndexedDB
      indexedDBShim: {
        src: ['src/vendor/IndexedDBShim/js/IndexedDBShim.js'],
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

      //ratchet's modal functionality is not compatable with spa routing
      ratchet: {
        src: ['src/vendor/ratchet/js/ratchet.js'],
        overwrite: true,
        replacements: [{
          from: 'getModal(event)',
          to: 'null'
        }]
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
          from: /\{APP_VER\}/g, // string replacement
          to: '<%= pkg.version %>'
        },
          {
            from: /\{APP_NAME\}/g,
            to: '<%= pkg.name %>'
          }
        ]
      },

      //App CONFIG
      config: {
        src: [SCRIPTS + 'main.js'],
        overwrite: true,
        replacements: [{
          from: /\{CONFIG\}/g,
          to: CONFIG_NAME
        },
          {
            from: /\{SPECIES\}/g,
            to: 'data/master_list'
          }
        ]
      },

      dev_config: {
        src: [SCRIPTS + 'main_dev.js'],
        overwrite: true,
        replacements: [{
          from: /\{CONFIG\}/g,
          to: CONFIG_DEV_NAME
        },
          {
            from: /\{SPECIES\}/g,
            to: 'data/master_list_dev'
          }
        ]
      },

      //need to remove Ratchet's default fonts to work with fontello ones
      ratchet_fonts: {
        src: ['src/vendor/ratchet/css/ratchet.css'],
        overwrite: true,
        replacements: [{
          from: /font-family: Ratchicons;/g,
          to: ''
        },
          {
            from: /src: url\(\"\.\.\/fonts.*;/g,
            to: ''
          }]
      },

      //Cordova config changes
      cordova_config: {
        src: [
          'src/config.xml'
        ],
        dest: 'src/config_build.xml',
        replacements: [{
          from: /\{APP_VER\}/g, // string replacement
          to: '<%= pkg.version %>'
        },
          {
            from: /\{APP_TITLE\}/g,
            to: '<%= pkg.title %>'
          },
          {
            from: /\{APP_DESCRIPTION\}/g,
            to: '<%= pkg.description %>'
          }
        ]
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
          'src/vendor/IndexedDBShim/js/IndexedDBShim.min.js': ['src/vendor/IndexedDBShim/js/IndexedDBShim.js']
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
          'src/vendor/backbone/js/backbone.min.js': ['src/vendor/backbone/js/backbone.js']
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
          'src/vendor/fastclick/js/fastclick.min.js': ['src/vendor/fastclick/js/fastclick.js']
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
          'src/vendor/latlon/js/dms.min.js': ['src/vendor/latlon/js/dms.js']
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
          'src/vendor/latlon/js/latlon-ellipsoidal.min.js': ['src/vendor/latlon/js/latlon-ellipsoidal.js']
        }
      },
      latlon_spherical: {
        options: {
          banner:
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n' +
          '/*  Latitude/longitude spherical geodesy formulae & scripts           (c) Chris Veness 2002-2015  */\n' +
          '/*   - www.movable-type.co.uk/scripts/latlong.html                                   MIT Licence  */\n' +
          '/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */\n'
        },
        files: {
          'src/vendor/latlon/js/latlon-spherical.min.js': ['src/vendor/latlon/js/latlon-spherical.js']
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
          'src/vendor/latlon/js/osgridref.min.js': ['src/vendor/latlon/js/osgridref.js']
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
          'src/vendor/latlon/js/vector3d.min.js': ['src/vendor/latlon/js/vector3d.js']
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
          'src/vendor/requirejs/js/require.min.js': ['src/vendor/requirejs/js/require.js']
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
            'dist/styles/bootstrap.css',
            'dist/styles/ratchet.css',
            'dist/styles/ionic.css',
            'dist/styles/leaflet.css',
            'dist/styles/icons.css',
            'dist/styles/main.css'
          ],
          dest: 'dist/styles/main.min.css'
        }]
      }
    },

    babel: {
      options: {},
      files: {
        expand: true,
        cwd: 'src',
        src: ['scripts/**/**/**/*.es6'],
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
    },

    clean: {
      dist: [
        'dist/vendor/*',
        '!dist/vendor/require.min.js',
        //styles
        'dist/styles/*',
        '!dist/styles/main.min.css',
        //scripts
        'dist/scripts/*',
        '!dist/scripts/main-built.js',
        //data
        '!dist/scripts/data',
        'dist/scripts/data/raw'
      ]
    },

    exec: {
      cordova_init: {
        command: 'cordova create cordova',
        stdout: true
      },
      cordova_clean_www: {
        command: 'rm -R cordova/www/* && rm cordova/config.xml',
        stdout: true
      },
      cordova_copy_dist: {
        command: 'cp -R dist/* cordova/www/ && cp src/config_build.xml cordova/config.xml',
        stdout: true
      },
      cordova_add_platforms: {
        command: 'cd cordova && cordova platforms add ios android',
        stdout: true
      }
    }

  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jst');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-babel');


  //Grunt Configuration Function
  grunt.registerTask('set_option', 'Set a option property.', function(name, val) {
    grunt.option(name, val);
  });

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('init', [
    'bower',
    'replace:indexedDBShim',
    'replace:latlon',
    'replace:ratchet',
    'replace:ratchet_fonts',
    'uglify',
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
  grunt.registerTask('update', [
    'run',
    'replace:config',
    'requirejs'
  ]);

  grunt.registerTask('cordova', 'Cordova tasks', function(update) {
    if (update) {
      //update only
      grunt.task.run('exec:cordova_clean_www');
      grunt.task.run('exec:cordova_copy_dist');
      return;
    }

    //prepare www source
    grunt.task.run('default');
    // 'clean:dist'

    grunt.task.run('replace:cordova_config');

    //init cordova source
    grunt.task.run('exec:cordova_init');

    //add www source to cordova
    grunt.task.run('exec:cordova_clean_www');
    grunt.task.run('exec:cordova_copy_dist');
    grunt.task.run('exec:cordova_add_platforms');
  });

  //Development run
  grunt.registerTask('update:dev', [
    'run',
    'replace:dev_config',
    'requirejs'
  ]);
};