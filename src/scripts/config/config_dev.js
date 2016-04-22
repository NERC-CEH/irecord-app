/** ****************************************************************************
 * Main app development configuration file.
 *****************************************************************************/
import LocHelp from './helpers/location';
import DateHelp from './helpers/date';

export default {
  version: '{APP_VER}', // replaced on build
  build: '{APP_BUILD}', // replaced on build
  name: '{APP_NAME}', // replaced on build

  gps_accuracy_limit: 100,

  // logging
  log: {
    states: ['e', 'w', 'i', 'd'], // see log helper
    ga_error: false,
  },

  // google analytics
  ga: {
    status: false,
    ID: 'UA-58378803-4'
  },

  login: {
    url: 'http://192.171.199.230/irecord7/user/mobile/register',
    timeout: 80000
  },

  report: {
    url: 'http://192.171.199.230/irecord7/mobile/report',
    timeout: 80000
  },

  // mapping
  map: {
    API_KEY: '28994B5673A86451E0530C6CA40A91A5'
  },

  // morel configuration
  morel:{
    manager: {
      url: 'http://192.171.199.230/irecord7/mobile/submit',
      appname: 'test',
      appsecret: 'mytest',
      website_id: 23,
      survey_id: 269
    },
    sample: {
      location: {
        values: function (location, options) {
          // convert accuracy for map and gridref sources
          let accuracy = location.accuracy;
          if (location.source !== 'gps') {
            if (location.source === 'map') {
              accuracy = LocHelp.mapZoom2meters(location.accuracy);
            } else {
              accuracy = null;
            }
          }

          let attributes = {
            location_name: location.name,
            location_source: location.source,
            location_gridref: location.gridref,
            location_altitude: location.altitude,
            location_altitude_accuracy: location.altitudeAccuracy,
            location_accuracy: accuracy
          };

          // add other location related attributes
          options.flattener(attributes, options);

          return location.latitude + ', ' + location.longitude;
        }
      },
      location_accuracy: { id: 282 },
      location_altitude: { id: 283 },
      location_altitude_accuracy: { id: 284 },
      location_source: { id: 578 },
      location_gridref: { id: 335 },

      device: {
        id: 273,
        values: {
          iOS: 2398,
          Android: 2399
        }
      },

      device_version: { id: 579 },

      date: {
        values: function (date) {
          return DateHelp.print(date);
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
        id: 16,
      },
      'number-ranges': {
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
