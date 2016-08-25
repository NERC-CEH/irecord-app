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
};
