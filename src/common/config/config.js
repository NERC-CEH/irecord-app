/** ****************************************************************************
 * Main app configuration file.
 *****************************************************************************/
import $ from 'jquery';
import Indicia from 'indicia';
import DateHelp from 'helpers/date';
import LocHelp from 'helpers/location';

const HOST = 'https://www.brc.ac.uk/irecord/';

const CONFIG = {
  // variables replaced on build
  /* global APP_VERSION, APP_BUILD, APP_NAME, REGISTER_URL, API_KEY, API_SECRET,
   REPORT_URL, STATISTICS_URL, RECORD_URL, APP_SECRET */
  version: APP_VERSION,
  build: APP_BUILD,
  name: APP_NAME,

  gps_accuracy_limit: 100,

  site_url: HOST,

  // logging
  log: true,

  // google analytics
  ga: {
    status: true,
    ID: 'UA-58378803-4',
  },

  // error analytics
  sentry: {
    key: 'fdde66f95b1c4f50a8186e828b595351',
    project: '128357',
  },

  users: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER}/users/`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER + Indicia.API_REPORTS_PATH}`,
    timeout: 80000,
  },

  // mapping
  map: {
    os_api_key: '28994B5673A86451E0530C6CA40A91A5',
    mapbox_api_key: 'pk.eyJ1IjoiY2VoYXBwcyIsImEiOiJjaXBxdTZyOWYwMDZoaWVuYjI3Y3Z0a2x5In0.YXrZA_DgWCdjyE0vnTCrmw',
    mapbox_osm_id: 'cehapps.0fenl1fe',
    mapbox_satellite_id: 'cehapps.0femh3mh',
  },

  // indicia configuration
  indicia: {
    host: HOST,
    api_key: API_KEY,
    website_id: 23,
    survey_id: 374,
    input_form: 'enter-app-record',

    sample: {
      location: {
        values(location, submission) {
          // convert accuracy for map and gridref sources
          let accuracy = location.accuracy;
          if (location.source !== 'gps') {
            if (location.source === 'map') {
              accuracy = LocHelp.mapZoom2meters(location.accuracy);
            } else {
              accuracy = null;
            }
          }

          const attributes = {};
          const keys = CONFIG.indicia.sample;
          attributes.location_name = location.name; // this is a native indicia attr
          attributes[keys.location_source.id] = location.source;
          attributes[keys.location_gridref.id] = location.gridref;
          attributes[keys.location_altitude.id] = location.altitude;
          attributes[keys.location_altitude_accuracy.id] = location.altitudeAccuracy;
          attributes[keys.location_accuracy.id] = accuracy;

          // add other location related attributes
          $.extend(submission.fields, attributes);

          return `${location.latitude}, ${location.longitude}`;
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
      training: {
        id: 'training',
      },

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
        default: 'Present',
        values: {
          Present: 671,
          1: 665,
          '2-5': 666,
          '6-20': 667,
          '21-100': 668,
          '101-500': 669,
          '500+': 670,
        },
      },
      stage: {
        id: 106,
        default: 'Not Recorded',
        values: {
          'Not Recorded': 1949,
          Adult: 1950,
          'Pre-adult': 1951,
          Other: 1952,
        },
      },
      identifiers: {
        id: 18,
      },
    },
  },
};

export default CONFIG;
