/** ****************************************************************************
 * Main app development configuration file.
 *****************************************************************************/
import $ from 'jquery';
import config from './config';

const HOST = 'http://localhost/drupal/';

const newConfig = $.extend(true, config, {
  irecord_url: 'http://192.171.199.230/irecord7',

  // google analytics
  ga: {
    status: false,
  },

  log: {
    // use prod logging if testing otherwise full log
    states: process.env.ENV === 'testing' ? null : ['e', 'w', 'i', 'd'], // see log helper
    ga_error: false,
  },

  login: {
    url: `${HOST}api/v0.1/users/auth`,
    timeout: 80000,
  },

  report: {
    url: `${HOST}api/v0.1/reports`,
    timeout: 80000,
  },

  // morel configuration
  morel: {
    manager: {
      host: HOST,
      survey_id: 266,
    },
  },

  sample: {
    location_accuracy: { id: 833 },
    location_altitude: { id: 274 },
    location_altitude_accuracy: { id: 275 },
    location_source: { id: 832 },
    location_gridref: { id: 830 },

    device: {
      id: 829,
      values: {
        iOS: 14317,
        Android: 14318,
      },
    },

    device_version: { id: 831 },

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
      values: {
        default: 671,
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
});

export default newConfig;
