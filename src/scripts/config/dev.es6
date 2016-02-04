/******************************************************************************
 * Main app configuration file.
 *****************************************************************************/
define([], function () {

  let CONFIG = {
    version: '{APP_VER}', //replaced on build
    name: '{APP_NAME}', //replaced on build
    gps_accuracy_limit: 100,

    //logging
    log: {
      states: ['e', 'w', 'i', 'd'], //see log helper
      ga_error: true
    },

    //google analytics
    ga: {
      status: true,
      ID: 'UA-58378803-4'
    },

    login: {
      url: 'http://192.171.199.230/irecord7/user/mobile/register',
      timeout: 80000
    },

    //mapping
    map: {
      API_KEY: '28994B5673A86451E0530C6CA40A91A5'
    },

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
            return date.print();
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
            'default': 671,
            '1': 665,
            '2-5': 666,
            '6-20': 667,
            '21-100': 668,
            '101-500': 669,
            '500+': 670
          }
        },
        stage: {
          id: 106,
          values: {
            'default': 1949,
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