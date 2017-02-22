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

  users: {
    url: `${HOST}api/v0.1/users`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST}api/v0.1/reports`,
    timeout: 80000,
  },

  // indicia configuration
  indicia: {
    host: HOST,
    survey_id: 374,
  },
});

export default newConfig;
