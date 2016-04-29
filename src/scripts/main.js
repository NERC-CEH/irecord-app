/** ****************************************************************************
 * App start.
 *****************************************************************************/
import Bootstrap from '../vendor/bootstrap/js/bootstrap';
import Ratchet from '../vendor/ratchet/js/ratchet';
import App from './app';
import RecordsRouter from './components/records/router';
import InfoRouter from './components/info/router';
import SettingsRouter from './components/settings/router';
import UserRouter from './components/user/router';
import ActivitiesRouter from './components/activities/router';


// Load the mighty app :)
App.start();