/** ****************************************************************************
 * Main app configuration file.
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
    ga_error: true,
  },

  // google analytics
  ga: {
    status: true,
    ID: 'UA-58378803-4',
  },

  login: {
    url: 'https://www.brc.ac.uk/irecord/user/mobile/register',
    timeout: 30000,
  },

  report: {
    url: 'http://www.brc.ac.uk/irecord/mobile/report',
    timeout: 80000,
  },

  // mapping
  map: {
    os_api_key: '28994B5673A86451E0530C6CA40A91A5',
    mapbox_api_key: 'pk.eyJ1IjoiY2VoYXBwcyIsImEiOiJjaXBxdTZyOWYwMDZoaWVuYjI3Y3Z0a2x5In0.YXrZA_DgWCdjyE0vnTCrmw',
    mapbox_osm_id: 'cehapps.0fenl1fe',
    mapbox_satellite_id: 'cehapps.0femh3mh',
  },

  // morel configuration
  morel: {
    manager: {
      url: 'https://www.brc.ac.uk/irecord/mobile/submit',
      appname: 'ir',
      appsecret: 'irecordApp123',
      website_id: 23,
      survey_id: 374,
      input_form: 'enter-app-record',
    },
    sample: {
      location: {
        values(location, options) {
          // convert accuracy for map and gridref sources
          let accuracy = location.accuracy;
          if (location.source !== 'gps') {
            if (location.source === 'map') {
              accuracy = LocHelp.mapZoom2meters(location.accuracy);
            } else {
              accuracy = null;
            }
          }

          const attributes = {
            location_name: location.name,
            location_source: location.source,
            location_gridref: location.gridref,
            location_altitude: location.altitude,
            location_altitude_accuracy: location.altitudeAccuracy,
            location_accuracy: accuracy,
          };

          // add other location related attributes
          options.flattener(attributes, options);

          return location.latitude + ', ' + location.longitude;
        },
      },
      location_accuracy: { id: 282 },
      location_altitude: { id: 283 },
      location_altitude_accuracy: { id: 284 },
      location_source: { id: 760 },
      location_gridref: { id: 335 },

      device: {
        id: 273,
        values: {
          iOS: 2398,
          Android: 2399,
        },
      },

      device_version: { id: 759 },

      date: {
        values(date) {
          return DateHelp.print(date);
        },
      },

      group: {
        values(group) {
          return group.id;
        },
      },
    },
    occurrence: {
      taxon: {
        values(taxon) {
          return taxon.warehouse_id;
        },
      },
      number: {
        id: 16,
      },
      'number-ranges': {
        id: 523,
        values: {
          'default': 671,
          '1': 665,
          '2-5': 666,
          '6-20': 667,
          '21-100': 668,
          '101-500': 669,
          '500+': 670,
        },
      },
      stage: {
        id: 106,
        values: {
          'default': 1949,
          'Adult': 1950,
          'Pre-adult': 1951,
          'Other': 1952,
        },
      },
      identifiers: {
        id: 18,
      },
    },
  },
};
