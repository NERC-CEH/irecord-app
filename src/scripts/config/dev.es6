/******************************************************************************
 * Main app configuration file.
 *****************************************************************************/
define(['config/map'], function (MAP) {

  let CONFIG = {
    version: '{APP_VER}', //replaced on build
    name: '{APP_NAME}', //replaced on build
    gps_accuracy_limit: 100,

    //logging
    log: {
      states: ['e', 'w', 'i', 'd'], //see log helper
      ga_error: false
    },

    //google analytics
    ga: {
      status: false
    },

    //mapping
    map: MAP,

    //morel configuration
    morel:{
      manager: {
        url: 'http://192.171.199.230/irecord7/mobile/submit',
        appname: "test",
        appsecret: "mytest",
        website_id: 23,
        survey_id: 258
      },
      sample: {
        name: {id: 6},
        surname: {id: 7},
        email: {id: 8},
        location_accuracy: {id: 282},
        location_name: {id: 274}
      },
      occurrence: {
        number: {
          id: 383,
          values: {
            '1': 4774,
            '2-10': 4775,
            '11-100': 4776,
            '101-1000': 4777,
            '1000+': 4778,
            'Present': 4779 //default
          }
        }
      }
    }
  };

  return CONFIG;
});