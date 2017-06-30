/** ****************************************************************************
 * Main app configuration file.
 *****************************************************************************/
import Indicia from 'indicia';

import generalSurvey from './general_survey';
import plantSurvey from './plant_survey';

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

    surveys: {
      general: generalSurvey,
      plant: plantSurvey,
    },
  },
};

export default CONFIG;
