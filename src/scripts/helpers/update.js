/** ****************************************************************************
 * App update functionality.
 *****************************************************************************/

import appModel from '../components/common/models/app_model';
import Log from './log';
import Analytics from './analytics';
import CONFIG from 'config'; // Replaced with alias

const API = {
  /**
   * Main update function.
   */
  run(callback) {
    const currentVersion = appModel.get('appVersion');
    const newVersion = CONFIG.version;

    if (currentVersion !== newVersion) {
      // set new app version
      API._updateAppVersion(currentVersion, newVersion);

      // find first update
      const firstUpdate = API._findFirst(API.updatesSeq, currentVersion);
      if (firstUpdate < 0) return callback(); // no update for this version

      // apply all updates
      return API._applyUpdates(firstUpdate, callback);
    }

    callback();
  },

  /**
   * The sequence of updates that should take place.
   * @type {string[]}
   */
  updatesSeq: [],

  /**
   * Update functions.
   * @type {{['1.1.0']: (())}}
   */
  updates: {

  },

  /**
   * Returns the index of the first found update in sequence.
   * @param updatesSeq
   * @param newVersion
   * @private
   */
  _findFirst(updatesSeq = API.updatesSeq, currentVersion) {
    if (!updatesSeq.length) return -1;

    let firstVersion = -1;

    API.updatesSeq.some((version, index) => {
      if (versionCompare(version, currentVersion) === 1) {
        firstVersion = index;
        return true;
      }
    });

    return firstVersion;
  },

  /**
   * Recursively apply all updates.
   * @param updateIndex
   * @param callback
   * @private
   */
  _applyUpdates(updateIndex, callback) {
    const update = API.updates[API.updatesSeq[updateIndex]];

    if (typeof update !== 'function') {
      Log('Update: error with update function', 'e');
      return callback();
    }

    return update(() => {
      // check if last update
      if (API.updatesSeq.length <= updateIndex) {
        return callback();
      }

      API._applyUpdates(updateIndex + 1, callback);
    });
  },

  _updateAppVersion(currentVersion, newVersion) {
    appModel.set('appVersion', newVersion);
    appModel.save();

    // log only updates and not init as no prev value on init
    if (currentVersion) {
      Log('Update');
      Analytics.trackEvent('App', 'updated');
    }
  },
};

/**
 * https://gist.github.com/alexey-bass/1115557
 * Simply compares two string version values.
 *
 * Example:
 * versionCompare('1.1', '1.2') => -1
 * versionCompare('1.1', '1.1') =>  0
 * versionCompare('1.2', '1.1') =>  1
 * versionCompare('2.23.3', '2.22.3') => 1
 *
 * Returns:
 * -1 = left is LOWER than right
 *  0 = they are equal
 *  1 = left is GREATER = right is LOWER
 *  And FALSE if one of input versions are not valid
 *
 * @function
 * @param {String} left  Version #1
 * @param {String} right Version #2
 * @return {Integer|Boolean}
 * @author Alexey Bass (albass)
 * @since 2011-07-14
 */
function versionCompare(left, right) {
  if (typeof left + typeof right != 'stringstring')
    return false;

  var a = left.split('.')
    ,   b = right.split('.')
    ,   i = 0, len = Math.max(a.length, b.length);

  for (; i < len; i++) {
    if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
      return 1;
    } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
      return -1;
    }
  }

  return 0;
}

export default API;
