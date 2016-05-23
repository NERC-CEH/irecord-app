import $ from 'jquery';
import _ from 'lodash';
import Morel from 'morel';
import Device from '../../helpers/device';
import Log from '../../helpers/log';
import CONFIG from 'config'; // Replaced with alias
import Sample from './models/sample';
import userModel from './models/user_model';

const morelConfiguration = $.extend(CONFIG.morel.manager, {
  Storage: Morel.DatabaseStorage,
  Sample,
  onSend(sample) {
    if (userModel.hasLogIn()) {
      // attach device information
      sample.set('device', Device.getPlatform());
      sample.set('device_version', Device.getVersion());

      userModel.appendSampleUser(sample);
    } else {
      // don't send until the user has logged in
      return true;
    }
    return null;
  },
});

class Manager extends Morel {
  syncAll(method, collection, options) {
    if(!Device.connectionWifi()) {
      options.timeout = 180000; // 3 min
    }
    return Morel.prototype.syncAll.apply(this, arguments);
  }

  sync(method, collection, options) {
    if(!Device.connectionWifi()) {
      options.timeout = 180000; // 3 min
    }
    return Morel.prototype.sync.apply(this, arguments);
  }

  removeAllSynced(callback) {
    this.getAll((err, records) => {
      if (err) {
        Log(err, 'e');
        callback && callback(err);
        return;
      }

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
            }
          });
        }
      });

      if (noneUsed) {
        callback && callback();
      }
    });
  }

  setAllToSend(callback) {
    const that = this;
    let noneUsed = true;
    let saving = 0;

    this.getAll((err, records) => {
      if (err) {
        Log(err, 'e');
        callback && callback(err);
        return;
      }
      records.each((record) => {
        noneUsed = false;
        saving++;
        const valid = record.setToSend((error) => {
          if (error) {
            callback && callback(error);
            return;
          }
          saving--;
          if (saving === 0) {
            callback && callback();
            that.syncAll();
          }
        });

        if (!valid) {
          saving--;
        }
      });

      if (noneUsed || saving === 0) {
        callback && callback();
      }
    });
  }
};

const recordManager = new Manager(morelConfiguration);
export { recordManager as default, Manager };
