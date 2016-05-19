/** ****************************************************************************
 * App start.
 *****************************************************************************/
import Bootstrap from '../vendor/bootstrap/js/bootstrap';
import Ratchet from '../vendor/ratchet/js/ratchet';
import IndexedDBShim from '../vendor/IndexedDBShim/js/IndexedDBShim';

import App from './app';
import RecordsRouter from './components/records/router';
import InfoRouter from './components/info/router';
import SettingsRouter from './components/settings/router';
import UserRouter from './components/user/router';

// Load the mighty app :)
App.start();