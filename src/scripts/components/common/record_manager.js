import $ from '../../../vendor/jquery/js/jquery';
import Morel from '../../../vendor/morel/js/morel';
import browser from '../../helpers/browser';
import CONFIG from 'config'; // Replaced with alias
import Sample from './sample';
import userModel from './user_model';

let morelConfiguration = $.extend(CONFIG.morel.manager, {
  Storage: Morel.DatabaseStorage,
  Sample: Sample,
  onSend: function (sample) {
    if (userModel.hasLogIn()) {
      //attach device
      let devicePlatform = '';
      if (window.cordova) {
        devicePlatform = window.device.platform;
      } else {
        if (browser.isAndroidChrome()) {
          devicePlatform = 'Android';
        } else if (browser.isIOS()) {
          devicePlatform = 'iOS';
        }
      }
      sample.set('device', devicePlatform);

      //attach device version
      if (window.cordova) {
        sample.set('device_version', window.device.version);
      }

      userModel.appendSampleUser(sample);
    } else {
      //don't send until the user is logged in
      return true;
    }
  }
});

//todo: make it more specific
Morel.Collection.prototype.comparator = function (a, b) {
  return a.get('date') > b.get('date');
};

_.extend(Morel.Manager.prototype, {
  removeAllSynced: function (callback) {
    this.getAll(function (err, records) {
      let toRemove = 0;
      let noneUsed = true;
      if (err) {
        callback && callback(err);
        return;
      }

      records.each(function (record) {
        if (record.getSyncStatus() === Morel.SYNCED) {
          noneUsed = false;
          toRemove++;
          record.destroy(function () {
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

  setAllToSend: function (callback) {
    let that = this;
    let noneUsed = true;
    let saving = 0;

    this.getAll(function (err, records) {
      if (err) {
        callback && callback(err);
        return;
      }
      records.each(function(record) {
          noneUsed = false;
          saving++;
          record.setToSend(function () {
            saving--;
            if (saving === 0) {
              that.syncAll();
              callback && callback();
            }
          });
        }
      )

      if (noneUsed) {
        callback && callback();
      }
    })
  }
});

const recordManager = new Morel.Manager(morelConfiguration);
export { recordManager as default };
