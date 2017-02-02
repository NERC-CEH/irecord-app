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
      survey_id: 374,
    },
  },
});

export default newConfig;
