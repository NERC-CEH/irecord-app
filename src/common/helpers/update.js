/** ****************************************************************************
 * App update functionality.
 **************************************************************************** */

import radio from 'radio';
import CONFIG from 'config';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import Log from './log';
import Analytics from './analytics';

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
    } else if (
      (b[i] && !a[i] && parseInt(b[i], 10) > 0) ||
      parseInt(a[i], 10) < parseInt(b[i], 10)
    ) {
      return -1;
    }
  }

  return 0;
}

/**
 * part of 1.2.2 update
 */
class DatabaseStorage {
  constructor(options = {}) {
    // because of iOS8 bug on home screen: null & readonly window.indexedDB
    this.indexedDB = window._indexedDB || window.indexedDB;
    this.IDBKeyRange = window._IDBKeyRange || window.IDBKeyRange;

    this.VERSION = 1;
    this.STORE_NAME = 'samples';

    this.NAME = `morel-${options.appname}`;
  }

  /**
   * Brings back all saved data from the database.
   */
  getAll(callback) {
    this.open((err, store) => {
      if (err) {
        callback(err);
        return;
      }
      try {
        // Get everything in the store
        const keyRange = this.IDBKeyRange.lowerBound(0);
        const req = store.openCursor(keyRange);
        const data = {};

        req.onsuccess = e => {
          try {
            const result = e.target.result;

            // If there's data, add it to array
            if (result) {
              data[result.key] = result.value;
              result.continue();

              // Reach the end of the data
            } else {
              callback(null, data);
            }
            // eslint-disable-next-line
          } catch (err) {
            callback && callback(err);
          }
        };

        req.onerror = e => {
          console.error('Database error.');
          console.error(e.target.error);
          const error = new Error(e.target.error);
          callback(error);
        };
        // eslint-disable-next-line
      } catch (err) {
        callback && callback(err);
      }
    });
  }

  /**
   * Opens a database connection and returns a store.
   *
   * @param onError
   * @param callback
   */
  open(callback) {
    let req = null;

    try {
      req = this.indexedDB.open(this.NAME, this.VERSION);

      /**
       * On Database opening success, returns the Samples object store.
       *
       * @param e
       */
      req.onsuccess = e => {
        try {
          const db = e.target.result;
          const transaction = db.transaction([this.STORE_NAME], 'readwrite');
          if (transaction) {
            const store = transaction.objectStore(this.STORE_NAME);
            if (store) {
              callback(null, store);
            } else {
              const err = new Error('Database Problem: no such store');
              callback(err);
            }
          }
        } catch (err) {
          callback(err);
        }
      };

      /**
       * If the Database needs an upgrade or is initialising.
       *
       * @param e
       */
      req.onupgradeneeded = e => {
        try {
          const db = e.target.result;
          db.createObjectStore(this.STORE_NAME);
        } catch (err) {
          callback && callback(err);
        }
      };

      /**
       * Error of opening the database.
       *
       * @param e
       */
      req.onerror = e => {
        console.error('Database error.');
        console.error(e.target.error);
        const error = new Error(e.target.error);
        callback(error);
      };

      /**
       * Error on database being blocked.
       *
       * @param e
       */
      req.onblocked = e => {
        console.error('Database error.');
        console.error(e.target.error);
        const error = new Error(e.target.error);
        callback(error);
      };
    } catch (err) {
      callback(err);
    }
  }

  delete() {
    this.indexedDB.deleteDatabase(this.NAME);
  }
}

export function updateSamples(samples, callback) {
  samples.each(sample => {
    const group = sample.get('group');
    if (group) {
      Log('Update: moving a sample group to activity');
      sample.set('activity', group);
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
    const currentVersion = appModel.get('appVersion');
    const newVersion = CONFIG.version;
    const currentBuild = appModel.get('appBuild');
    const newBuild = CONFIG.build;

    // when Beta testing we set training mode
    if (currentVersion !== newVersion || currentBuild !== newBuild) {
      appModel.set('useTraining', CONFIG.training);
    }

    if (currentBuild !== newBuild) {
      appModel.set('appBuild', newBuild);
      appModel.save();
    }

    if (currentVersion !== newVersion) {
      // todo: check for backward downgrade
      // set new app version
      appModel.set('appVersion', newVersion);
      appModel.save();

      // first install
      if (!currentVersion) {
        return callback();
      }

      return API._initApplyUpdates(currentVersion, callback, silent);
    }

    return callback();
  },

  /**
   * The sequence of updates that should take place.
   * @type {string[]}
   */
  updatesSeq: ['2.0.0', '3.0.0'],

  /**
   * Update functions.
   * @type {{['1.1.0']: (())}}
   */
  updates: {
    /**
     *  Migrate to new indicia database.
     */
    '2.0.0': callback => {
      Log('Update: version 2.0.0', 'i');

      function finishUpdate() {
        // reset app and user models
        appModel.clear().set(appModel.defaults);
        appModel.save();

        userModel.clear().set(userModel.defaults);
        userModel.save();

        Log('Update: finished.', 'i');
        callback(); // fully restart afterwards
      }

      function moveRecords(err, samples = []) {
        if (err) {
          Log(err, 'e');
          return null;
        }

        const samplesCount = Object.keys(samples).length;
        Log(`Update: copying ${samplesCount} samples to SQLite.`, 'i');

        // samples
        function updateSampleStructure(sample) {
          const newSample = sample;
          if (newSample.occurrences.length) {
            newSample.occurrences[0].media = newSample.occurrences[0].images;
            delete newSample.occurrences[0].images;
          }

          return newSample;
        }

        // eslint-disable-next-line
        for (const sample in samples) {
          // eslint-disable-next-line
          if (samples.hasOwnProperty(sample)) {
            const updatedSample = updateSampleStructure(samples[sample]);
            savedSamples.add(updatedSample);
          }
        }

        return savedSamples.save().then(() => {
          Log('Update: copying done.', 'i');
        });
      }

      // copy over all the samples to SQLite db
      const oldDB = new DatabaseStorage({ appname: 'test' });
      oldDB.getAll((err, samples = []) => {
        moveRecords(err, samples).then(() => {
          // clean up old db
          Log('Update: clearing test db.', 'i');
          oldDB.delete();

          // recover lost records too
          const evenOlderDB = new DatabaseStorage({ appname: 'ir' });
          // eslint-disable-next-line
          evenOlderDB.getAll((err, samples = []) => {
            // eslint-disable-line
            moveRecords(err, samples).then(() => {
              // clean up old db
              Log('Update: clearing ir db.', 'i');
              evenOlderDB.delete();

              finishUpdate();
            });
          });
        });
      });
    },
    '3.0.0': callback => {
      Log('Update: version 3.0.0', 'i');

      function onFinish() {
        Log('Update: finished.', 'i');
        callback();
      }

      if (savedSamples.fetching) {
        Log('Update: waiting for samples collection to be ready', 'i');
        savedSamples.once('fetching:done', () =>
          updateSamples(savedSamples, onFinish)
        );
        savedSamples.once('fetching:error', callback);
        return;
      }

      updateSamples(savedSamples, onFinish);
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
      radio.trigger('app:dialog:show', {
        title: 'Updating',
        body: 'This should take only a moment...',
        hideAllowed: false,
      });
    }
    const startTime = Date.now();

    // apply all updates
    return API._applyUpdates(firstUpdate, error => {
      if (error) {
        if (!silent) {
          radio.trigger(
            'app:dialog:error',
            'Sorry, an error has occurred while updating the app'
          );
        }
        return null;
      }

      const timeDiff = Date.now() - startTime;
      if (timeDiff < MIN_UPDATE_TIME) {
        setTimeout(() => {
          if (!silent) {
            radio.trigger('app:dialog:hide', true);
          }
          callback();
        }, MIN_UPDATE_TIME - timeDiff);
      } else {
        if (!silent) {
          radio.trigger('app:dialog:hide', true);
        }
        callback();
      }

      Analytics.trackEvent('App', 'updated');
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
      Log('Update: error with update function.', 'e');
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
        radio.trigger('app:restart');
        return null;
      }

      API._applyUpdates(updateIndex + 1, callback);
      return null;
    });
  },
};

export default API;
