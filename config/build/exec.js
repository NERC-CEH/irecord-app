module.exports = {
  data_init: {
    command:
    'cd src/data && ' +
    'python make.py UKSI.csv warehouse_ids.csv master_list && ' +
    'mkdir -p ../../dist/_build &&' +
    'mv master_list* ../../dist/_build &&' +
    'rm warnings.log',
    stdout: true,
  },
  cordova_init: {
    command: 'cordova create dist/cordova',
    stdout: true,
  },
  cordova_clean_www: {
    command: 'rm -R dist/cordova/www/* && rm dist/cordova/config.xml',
    stdout: true,
  },
  cordova_copy_dist: {
    command: 'cp -R dist/main/* dist/cordova/www/',
    stdout: true,
  },
  cordova_add_platforms: {
    command: 'cd dist/cordova && cordova platforms add ios android',
    stdout: true,
  },
};
