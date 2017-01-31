/** ****************************************************************************
 * Main app development configuration file.
 *****************************************************************************/
import $ from 'jquery';
import config from './config';

const HOST = 'http://localhost/drupal/';

const newConfig = $.extend(true, config, {
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
    url: `${HOST}user/mobile/register`,
    timeout: 80000,
  },

  report: {
    url: `${HOST}mobile/report`,
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
