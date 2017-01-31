import $ from 'jquery';
import Morel from 'morel';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Device, Log } from 'helpers';
import CONFIG from 'config';
import Sample from './models/sample';
import appModel from './models/app_model';
import userModel from './models/user_model';

class Manager extends Morel {
  syncAll(method, collection, options = {}) {
    if (!Device.connectionWifi()) {
      options.timeout = 180000; // 3 min
    }
    return Morel.prototype.syncAll.apply(this, [method, collection, options]);
  }

  sync(method, model, options = {}) {
    if (!Device.connectionWifi()) {
      options.timeout = 180000; // 3 min
    }
    return Morel.prototype.sync.apply(this, [method, model, options]);
  }

  removeAllSynced(callback) {
    this.getAll()
      .then((records) => {
        let toRemove = 0;
        let noneUsed = true;

        records.each((record) => {
          if (record.getSyncStatus() === Morel.SYNCED) {
            noneUsed = false;
            toRemove++;
            record.destroy({
              success: () => {
                toRemove--;
                if (toRemove === 0) {
                  callback && callback();
                }
              },
            });
          }
        });

        if (noneUsed) {
          callback && callback();
        }
      })
      .catch((err) => {
        Log(err, 'e');
        callback && callback(err);
      });
  }

  setAllToSend(callback) {
    const that = this;
    let noneUsed = true;
    let saving = 0;

    this.getAll()
      .then((records) => {
        records.each((record) => {
          noneUsed = false;
          saving++;
          const promise = record.setToSend();
          if (!promise) {
            return saving--;
          }
          promise
            .then(() => {
              saving--;
              if (saving === 0) {
                callback && callback();
                that.syncAll();
              }
            })
            .catch((error) => {
              callback && callback(error);
            });
        });

        if (noneUsed || saving === 0) {
          callback && callback();
        }
      })
      .catch((err) => {
        Log(err, 'e');
        callback && callback(err);
      });
  }

  clearAll(local, callback) {
    const that = this;
    this.getAll()
      .then((samples) => {
        if (window.cordova) {
          // we need to remove the images from file system
          samples.each((sample) => {
            sample.trigger('destroy');
          });
        }
        that.clear(callback);
      })
      .catch((err) => {
        Log(err, 'e');
        callback && callback(err);
      });
  }
}

function onSend(sample) {
  if (userModel.hasLogIn()) {
    // attach device information
    sample.set('device', Device.getPlatform());
    sample.set('device_version', Device.getVersion());

    // attach user information
    userModel.appendSampleUser(sample);

    // training setting
    const training = appModel.get('useTraining');
    sample.occurrences.at(0).set('training', training);
  } else {
    // don't send until the user has logged in
    return true;
  }
  return null;
}


const morelConfiguration = $.extend(CONFIG.morel.manager, {
  Sample,
  onSend,
});

// enable SQLite
if (window.cordova) {
  morelConfiguration.storage = {
    driverOrder: [CordovaSQLiteDriver, 'indexeddb', 'websql'],
  };
}

const recordManager = new Manager(morelConfiguration);
export { recordManager as default, Manager };
