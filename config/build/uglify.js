module.exports = {
  indexedDB: {
    options: {
      banner:
      '/**\n' +
      '* IndexedDBShim\n ' +
      '* https://github.com/axemclion/IndexedDBShim\n ' +
      '*/\n',
    },
    files: {
      'dist/_build/vendor/IndexedDBShim/js/IndexedDBShim.min.js': [
        'dist/_build/vendor/IndexedDBShim/js/IndexedDBShim.js',
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
      'dist/_build/vendor/backbone/js/backbone.min.js': [
        'dist/_build/vendor/backbone/js/backbone.js',
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
      'dist/_build/vendor/fastclick/js/fastclick.min.js': ['dist/_build/vendor/fastclick/js/fastclick.js'],
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
      'dist/_build/vendor/latlon/js/dms.min.js': ['dist/_build/vendor/latlon/js/dms.js'],
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
      'dist/_build/vendor/latlon/js/latlon-ellipsoidal.min.js': [
        'dist/_build/vendor/latlon/js/latlon-ellipsoidal.js',
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
      'dist/_build/vendor/latlon/js/latlon-spherical.min.js': [
        'dist/_build/vendor/latlon/js/latlon-spherical.js',
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
      'dist/_build/vendor/latlon/js/osgridref.min.js': ['dist/_build/vendor/latlon/js/osgridref.js'],
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
      'dist/_build/vendor/latlon/js/vector3d.min.js': ['dist/_build/vendor/latlon/js/vector3d.js'],
    },
  },
};
