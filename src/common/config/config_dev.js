/** ****************************************************************************
 * Main app development configuration file.
 *****************************************************************************/
import $ from 'jquery';
import Indicia from 'indicia';
import config from './config';

const HOST = 'localhost/drupal/';

const newConfig = $.extend(true, config, {
  irecord_url: HOST,

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
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER}/users/`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER + Indicia.API_REPORTS_PATH}`,
    timeout: 80000,
  },

  // indicia configuration
  indicia: {
    host: HOST,
    survey_id: 374,
  },
});

export default newConfig;
