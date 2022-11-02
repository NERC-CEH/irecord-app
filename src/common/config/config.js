/** ****************************************************************************
 * Main app configuration file.
 **************************************************************************** */
import Indicia from '@indicia-js/core';

const HOST = process.env.APP_INDICIA_API_HOST || 'https://erccis.org.uk/';

const isTestEnv = process.env.NODE_ENV === 'test';

const CONFIG = {
  // variables replaced on build
  version: process.env.APP_VERSION,
  build: process.env.APP_BUILD,
  name: process.env.APP_NAME,

  environment: process.env.NODE_ENV,

  gps_accuracy_limit: 100,

  site_url: HOST,

  // use prod logging if testing otherwise full log
  log: !__TEST__,

  // error analytics
  sentryDNS: !isTestEnv && process.env.APP_SENTRY_KEY,

  users: {
    url: `${HOST + Indicia.API_BASE + Indicia.API_VER}/users/`,
    timeout: 80000,
  },

  reports: {
    url: `${HOST +
      Indicia.API_BASE +
      Indicia.API_VER +
      Indicia.API_REPORTS_PATH}`,
    timeout: 80000,
  },

  // mapping
  map: {
    os_api_key: process.env.APP_OS_MAP_KEY,
    mapbox_api_key: process.env.APP_MAPBOX_MAP_KEY,
    mapbox_osm_id: 'mapbox/outdoors-v11',
    mapbox_satellite_id: 'mapbox/satellite-v9',
  },

  // indicia configuration
  indicia: {
    host: HOST,
    api_key: process.env.APP_INDICIA_API_KEY,
    website_id: 23,
  },
};

export default CONFIG;
