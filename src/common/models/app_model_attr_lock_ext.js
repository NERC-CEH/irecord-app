/** ****************************************************************************
 * App Model attribute lock functions.
 *****************************************************************************/
import _ from 'lodash';
import { Log, Analytics } from 'helpers';
import userModel from './user_model';

export default {
  setAttrLock(attr, value) {
    const val = _.cloneDeep(value);
    const locks = this.get('attrLocks');

    locks[attr] = val;
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');

    if (value) {
      Analytics.trackEvent('Lock', attr);
    }
  },

  unsetAttrLock(attr) {
    const locks = this.get('attrLocks');
    delete locks[attr];
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');
  },

  getAttrLock(attr) {
    const locks = this.get('attrLocks');
    return locks[attr];
  },

  isAttrLocked(attr, value = {}) {
    let lockedVal = this.getAttrLock(attr);
    if (!lockedVal) return false; // has not been locked
    if (lockedVal === true) return true; // has been locked
    let locked;
    switch (attr) {
      case 'activity':
        return lockedVal.id === value.id;
      case 'location':
        locked =
          // map or gridref
          (lockedVal &&
          (lockedVal.name === value.name &&
          lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude) ||

            // GPS doesn't lock the location only name
          (lockedVal.name === value.name && (
          !lockedVal.latitude && !lockedVal.longitude)));

        return locked;
      case 'date':
        lockedVal = new Date(lockedVal);
        if (lockedVal === 'Invalid Date') return false;

        return lockedVal.getTime() === value.getTime();
      default:
        return value === lockedVal;
    }
  },

  appendAttrLocks(sample) {
    const locks = this.get('attrLocks');
    const occurrence = sample.occurrences.at(0);

    _.each(locks, (value, key) => {
      // false or undefined
      if (!value) {
        return;
      }

      const val = _.cloneDeep(value);

      switch (key) {
        case 'activity':
          if (!userModel.hasActivityExpired(val)) {
            Log('AppModel: appending activity to the sample');
            sample.set('group', val);
          } else {
            // unset the activity as it's now expired
            Log('AppModel: activity has expired');
            this.unsetAttrLock('activity');
          }
          break;
        case 'location':
          sample.set('location', val);
          break;
        case 'date':
          // parse stringified date
          sample.set('date', new Date(val));
          break;
        case 'number':
          occurrence.set('number', val);
          break;
        case 'number-ranges':
          occurrence.set('number-ranges', val);
          break;
        case 'stage':
          occurrence.set('stage', val);
          break;
        case 'identifiers':
          occurrence.set('identifiers', val);
          break;
        case 'comment':
          occurrence.set('comment', val);
          break;
        default:
      }
    });
  },

  checkExpiredAttrLocks() {
    const that = this;
    const locks = this.get('attrLocks');
    if (locks.activity) {
      if (userModel.hasActivityExpired(locks.activity)) {
        Log('AppModel: activity has expired');
        this.unsetAttrLock('activity');
      }
    }
    userModel.on('logout', () => {
      Log('AppModel: activity has expired');
      that.unsetAttrLock('activity'); // remove locked activity
    });
  },
};
