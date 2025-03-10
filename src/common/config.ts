import {
  Filesystem,
  Directory as FilesystemDirectory,
} from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';

const backendUrl = process.env.APP_BACKEND_URL || 'https://irecord.org.uk';

const indiciaUrl =
  process.env.APP_BACKEND_INDICIA_URL || 'https://warehouse1.indicia.org.uk';

const feedbackEmail = process.env.APP_FEEDBACK_EMAIL || 'apps%40ceh.ac.uk';

const config = {
  version: process.env.APP_VERSION as string,
  build: process.env.APP_BUILD as string,
  feedbackEmail,

  environment: process.env.NODE_ENV as string,

  sentryDSN: process.env.APP_SENTRY_KEY as string,

  POSITIVE_THRESHOLD: 0.7,
  POSSIBLE_THRESHOLD: 0.2,

  map: {
    mapboxApiKey: process.env.APP_MAPBOX_MAP_KEY as string,
    osApiKey: process.env.APP_OS_MAP_KEY as string,
  },

  backend: {
    url: backendUrl,
    websiteId: 118,
    clientId: process.env.APP_BACKEND_CLIENT_ID as string,
    clientPass: process.env.APP_BACKEND_CLIENT_PASS as string,

    occurrenceServiceURL: `${indiciaUrl}/index.php/services/rest/es-occurrences/_search`,
    sampleServiceURL: `${indiciaUrl}/index.php/services/rest/es-samples/_search`,

    mediaUrl: `${indiciaUrl}/upload/`,

    indicia: { url: indiciaUrl },
  },

  dataPath: '',
};

(async function getMediaDirectory() {
  if (isPlatform('hybrid')) {
    const { uri } = await Filesystem.getUri({
      path: '',
      directory: FilesystemDirectory.Data,
    });
    config.dataPath = uri;
  }
})();

export default config;
