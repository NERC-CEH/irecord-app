import $ from 'jquery';
import _ from 'lodash';
import Morel from 'morel';
import device from '../../helpers/device';
import CONFIG from 'config'; // Replaced with alias
import Sample from './sample';
import userModel from './user_model';

const morelConfiguration = $.extend(CONFIG.morel.manager, {
  Storage: Morel.DatabaseStorage,
  Sample,
  onSend(sample) {
    if (userModel.hasLogIn()) {
      // attach device
      let devicePlatform = '';
      if (window.cordova) {
        devicePlatform = window.device.platform;
      } else {
        if (device.isAndroidChrome()) {
          devicePlatform = 'Android';
        } else if (device.isIOS()) {
          devicePlatform = 'iOS';
        }
      }
      sample.set('device', devicePlatform);

      // attach device version
      if (window.cordova) {
        sample.set('device_version', window.device.version);
      }

      userModel.appendSampleUser(sample);
    } else {
      // don't send until the user is logged in
      return true;
    }
    return null;
  },
});

_.extend(Morel.prototype, {
  removeAllSynced(callback) {
    this.getAll((err, records) => {
      let toRemove = 0;
      let noneUsed = true;
      if (err) {
        callback && callback(err);
        return;
      }

      records.each((record) => {
        if (record.getSyncStatus() === Morel.SYNCED) {
          noneUsed = false;
          toRemove++;
          record.destroy(() => {
            toRemove--;
            if (toRemove === 0) {
              callback && callback();
            }
          });
        }
      });

      if (noneUsed) {
        callback && callback();
      }
    });
  },

  setAllToSend(callback) {
    const that = this;
    let noneUsed = true;
    let saving = 0;

    this.getAll((err, records) => {
      if (err) {
        callback && callback(err);
        return;
      }
      records.each((record) => {
        noneUsed = false;
        saving++;
        record.setToSend(() => {
          saving--;
          if (saving === 0) {
            that.syncAll();
            callback && callback();
          }
        });
      });

      if (noneUsed) {
        callback && callback();
      }
    });
  },
});

const recordManager = new Morel(morelConfiguration);
export { recordManager as default };
