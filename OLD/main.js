/** ****************************************************************************
 * App start.
 *****************************************************************************/
import Bootstrap from 'bootstrap';
import Ratchet from 'ratchet';
import IndexedDBShim from 'indexedDBShim';

import App from './app';
import RecordsRouter from './components/records/router';
import InfoRouter from './components/info/router';
import SettingsRouter from './components/settings/router';
import UserRouter from './components/user/router';

// Load the mighty app :)
App.start();