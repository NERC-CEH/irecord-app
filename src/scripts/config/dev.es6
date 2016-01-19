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

    login: {
      url: 'http://192.171.199.230/irecord7/user/mobile/register',
      timeout: 80000
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
        survey_id: 269
      },
      sample: {
        name: {id: 6},
        surname: {id: 7},
        email: {id: 8},
        location: {
          values: function (location) {
            //todo: move name and accuracy to different fields
            return location.latitude + ', ' + location.longitude;
          }
        },
        location_accuracy: {id: 282},
        location_name: {id: 274},
        date: {
          values: function (date) {
            return '11/01/2015';
          }
        }
      },
      occurrence: {
        taxon: {
          values: function (taxon) {
            return taxon.warehouse_id;
          }
        },
        number: {
          id: 379,
          values: {
            '1': 665,
            '2-5': 666,
            '6-20': 667,
            '21-100': 668,
            '101-500': 669,
            '500+': 670,
            'Present': 671 //default
          }
        },
        stage: {
          id: 106,
          values: {
            'Not Recorded': 1949,
            'Adult': 1950,
            'Pre-adult': 1951,
            'Other': 1952
          }
        }
      }
    }
  };

  return CONFIG;
});