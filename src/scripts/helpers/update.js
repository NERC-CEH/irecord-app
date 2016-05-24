/** ****************************************************************************
 * App update functionality.
 *****************************************************************************/

import appModel from '../components/common/models/app_model';
import Log from './log';
import Analytics from './analytics';
import CONFIG from 'config'; // Replaced with alias

export default function () {
  const prevAppVersion = appModel.get('appVersion');
  const appVersion = CONFIG.version;

  if (prevAppVersion !== appVersion) {
    appModel.set('appVersion', appVersion);
    appModel.save();

    // log only updates and not init as no prev value on init
    if (prevAppVersion) {
      Log('Update');
      Analytics.trackEvent('App', 'updated');
    }
  }
}

