'use strict';

const path = require('path');

module.exports = {
  compile: {
    options: {
      amd: true,
      namespace: 'JST',
      templateSettings: {
        variable: 'obj',
      },
      prettify: true,
      processName(filepath) {
        const templatesDir = '/templates';
        let path = filepath;

        // strip all until components folder
        path = path.split('src/')[1];

        // remove 'pages' from common/pages
        if (path.indexOf('common/pages') >= 0) {
          path = path.replace('/pages', '');
        }

        // remove extension
        path = path.split('.')[0];

        // cut out templates dir
        const dirIndex = path.indexOf(templatesDir);
        if (dirIndex) {
          path =
            path.substr(0, dirIndex) +
            path.substr(dirIndex + templatesDir.length);
        }

        return path;
      },
    },
    files: {
      'dist/_build/JST.js': [
        'src/**/**/**/**/*.tpl',
        'src/common/templates/*.tpl',
      ],
    },
  },
};
