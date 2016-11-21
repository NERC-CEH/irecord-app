/** ****************************************************************************
 * Main app development configuration file.
 *****************************************************************************/
import $ from 'jquery';
import config from './config';

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
    url: 'http://192.171.199.230/irecord7/user/mobile/register',
    timeout: 80000,
  },

  report: {
    url: 'http://192.171.199.230/irecord7/mobile/report',
    timeout: 80000,
  },

  // morel configuration
  morel: {
    manager: {
      url: 'http://192.171.199.230/irecord7/mobile/submit',
      survey_id: 374,
    },
  },
});

export default newConfig;
