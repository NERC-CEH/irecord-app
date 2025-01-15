/** ****************************************************************************
 * App update functionality.
 **************************************************************************** */
import { set as setMobXAttrs } from 'mobx';
import { loader } from '@flumens';
import CONFIG from 'common/config';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import userModel from 'models/user';

const MIN_UPDATE_TIME = 5000; // show updating dialog for minimum seconds

/**
 * https://gist.github.com/alexey-bass/1115557
 * Simply compares left version to right one.
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
  if (typeof left + typeof right !== 'stringstring') {
    return false;
  }

  const a = left.split('.');
  const b = right.split('.');
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if (
      (a[i] && !b[i] && parseInt(a[i], 10) > 0) ||
      parseInt(a[i], 10) > parseInt(b[i], 10)
    ) {
      return 1;
    }
    if (
      (b[i] && !a[i] && parseInt(b[i], 10) > 0) ||
      parseInt(a[i], 10) < parseInt(b[i], 10)
    ) {
      return -1;
    }
  }

  return 0;
}

export function updateSamples(samplesList, callback) {
  samplesList.each(sample => {
    const { group } = sample.attrs;
    if (group) {
      console.log('Update: moving a sample group to activity');
      // eslint-disable-next-line no-param-reassign
      sample.attrs.activity = group;
      sample.unset('group');
      sample.save();
    }
  });

  callback();
}

const API = {
  /**
   * Main update function.
   */
  run(callback, silent = false) {
    appModel.ready.then(() => {
      let currentVersion = appModel.attrs.appVersion;

      const newVersion = CONFIG.version;
      let currentBuild = appModel.attrs.appBuild;
      const newBuild = CONFIG.build;

      // part of 4.0.0 update START
      const oldStr = localStorage.getItem('irecord-app-app');
      const old = JSON.parse(oldStr);
      if (old && typeof old === 'object' && old.appVersion) {
        currentVersion = old.appVersion;
        currentBuild = old.appBuild;
        delete old.appVersion;
        delete old.appBuild;
        localStorage.setItem('irecord-app-app', JSON.stringify(old));
      }
      // part of 4.0.0 update END

      // when Beta testing we set training mode
      if (currentVersion !== newVersion || currentBuild !== newBuild) {
        appModel.attrs.useTraining = CONFIG.training;
      }

      let savePromise = Promise.resolve();
      if (currentBuild !== newBuild) {
        appModel.attrs.appBuild = newBuild;
        savePromise = appModel.save();
      }

      savePromise.then(() => {
        if (currentVersion !== newVersion) {
          // TODO: check for backward downgrade
          // set new app version
          appModel.attrs.appVersion = newVersion;
          appModel.save().then(() => {
            // first install
            if (!currentVersion) {
              callback();
              return;
            }

            API._initApplyUpdates(currentVersion, callback, silent);
          });
          return;
        }

        callback();
      });
    });
  },

  /**
   * The sequence of updates that should take place.
   * @type {string[]}
   */
  updatesSeq: ['3.0.0', '4.0.0'],

  /**
   * Update functions.
   * @type {{['1.1.0']: (())}}
   */
  updates: {
    '3.0.0': callback => {
      console.log('Update: version 3.0.0');

      function onFinish() {
        console.log('Update: finished.');
        callback();
      }

      if (samples.fetching) {
        console.log('Update: waiting for samples collection to be ready');
        samples.once('fetching:done', () => updateSamples(samples, onFinish));
        samples.once('fetching:error', callback);
        return;
      }

      updateSamples(samples, onFinish);
    },

    '4.0.0': callback => {
      console.log('Update: version 4.0.0');

      function onFinish() {
        console.log('Update: finished.');
        callback();
      }

      function onError() {
        console.error('Update: errored.');
        callback();
      }

      const userModelPromise = new Promise(resolve => {
        const oldStr = localStorage.getItem('irecord-app-user');
        const old = JSON.parse(oldStr);
        if (old && typeof old === 'object') {
          console.log('Update: updating userModel.');
          setMobXAttrs(userModel.attrs, old);
          localStorage.removeItem('irecord-app-user');
          userModel.save().then(resolve);
          return;
        }
        resolve();
      });

      const appModelPromise = new Promise(resolve => {
        const oldStr = localStorage.getItem('irecord-app-app');
        const old = JSON.parse(oldStr);
        if (old && typeof old === 'object') {
          console.log('Update: updating appModel.');
          setMobXAttrs(appModel.attrs, old);
          localStorage.removeItem('irecord-app-app');
          appModel.save().then(resolve);
          return;
        }
        resolve();
      });

      Promise.all([userModelPromise, appModelPromise]).then(onFinish, onError);
    },
  },

  _initApplyUpdates(currentVersion, callback, silent) {
    // find first update
    const firstUpdate = API._findFirst(API.updatesSeq, currentVersion);
    if (firstUpdate < 0) {
      return callback();
    } // no update for this version

    // hide loader
    if (navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }

    if (!silent) {
      loader.show({
        header: 'Updating',
        message: 'This should take only a moment...',
      });
    }
    const startTime = Date.now();

    // apply all updates
    return API._applyUpdates(firstUpdate, error => {
      if (error) {
        if (!silent) {
          error('Sorry, an error has occurred while updating the app');
        }
        return null;
      }

      const timeDiff = Date.now() - startTime;
      if (timeDiff < MIN_UPDATE_TIME) {
        setTimeout(() => {
          if (!silent) {
            loader.hide();
          }
          callback();
        }, MIN_UPDATE_TIME - timeDiff);
      } else {
        if (!silent) {
          loader.hide();
        }
        callback();
      }

      return null;
    });
  },

  /**
   * Returns the index of the first found update in sequence.
   * @param updatesSeq
   * @param currentVersion
   * @returns {number}
   * @private
   */
  _findFirst(updatesSeq = API.updatesSeq, currentVersion) {
    if (!updatesSeq.length) {
      return -1;
    }

    let firstVersion = -1;
    API.updatesSeq.some((version, index) => {
      if (versionCompare(version, currentVersion) === 1) {
        firstVersion = index;
        return true;
      }
      return null;
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
      console.error('Update: error with update function.');
      return callback();
    }

    let fullRestartRequired = false;
    return update((error, _fullRestartRequired) => {
      if (error) {
        callback(error);
        return null;
      }

      if (_fullRestartRequired) {
        fullRestartRequired = true;
      }

      // check if last update
      if (API.updatesSeq.length - 1 <= updateIndex) {
        if (!fullRestartRequired) {
          return callback();
        }
        // TODO:
        // radio.trigger('app:restart');
        return null;
      }

      API._applyUpdates(updateIndex + 1, callback);
      return null;
    });
  },
};

export default API;
