/** ****************************************************************************
 * App Model attribute lock functions.
 *****************************************************************************/
import _ from 'lodash';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import userModel from 'user_model';

export default {
  setAttrLock(attr, value, survey) {
    const val = _.cloneDeep(value);
    const locks = this.get('attrLocks');

    locks[survey] || (locks[survey] = {});
    locks[survey][attr] = val;
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');

    if (value) {
      Analytics.trackEvent('Lock', attr);
    }
  },

  unsetAttrLock(attr, survey) {
    const locks = this.get('attrLocks');
    locks[survey] || (locks[survey] = {});

    delete locks[survey][attr];
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');
  },

  getAttrLock(attr, survey) {
    const locks = this.get('attrLocks');
    locks[survey] || (locks[survey] = {});
    return locks[survey][attr];
  },

  isAttrLocked(attr, value = {}, survey) {
    let lockedVal = this.getAttrLock(attr, survey);
    if (!lockedVal) return false; // has not been locked
    if (lockedVal === true) return true; // has been locked
    switch (attr) {
      case 'activity':
        return lockedVal.id === value.id;
      case 'location':
        if (!lockedVal) {
          return false;
        }

        // map or gridref
        const mapGrid = lockedVal.name === value.name &&
          lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude;

        // GPS only locks the name
        const gps = lockedVal.name === value.name &&
          !lockedVal.latitude && !lockedVal.longitude;

        return mapGrid || gps;
      case 'date':
        lockedVal = new Date(lockedVal);
        if (lockedVal === 'Invalid Date') return false;

        return lockedVal.getTime() === value.getTime();
      default:
        return value === lockedVal;
    }
  },

  appendAttrLocks(sample) {
    Log('AppModel:AttrLocks: appending.');

    const survey = sample.metadata.survey;
    const locks = this.get('attrLocks')[survey];

    _.each(locks, (value, key) => {
      // false or undefined
      if (!value) {
        return;
      }

      const val = _.cloneDeep(value);

      let occurrence, model;
      switch (key) {
        case 'activity':
          if (!userModel.hasActivityExpired(val)) {
            Log('AppModel:AttrLocks: appending activity to the sample.');
            sample.set('group', val);
          } else {
            // unset the activity as it's now expired
            Log('AppModel:AttrLocks: activity has expired.');
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
          occurrence = sample.getOccurrence();
          occurrence.set('number', val);
          break;
        case 'number-ranges':
          occurrence = sample.getOccurrence();
          occurrence.set('number-ranges', val);
          break;
        case 'stage':
          occurrence = sample.getOccurrence();
          occurrence.set('stage', val);
          break;
        case 'identifiers':
          model = sample;
          if (survey === 'general') {
            occurrence = sample.getOccurrence();
            model = occurrence;
          }
          model.set('identifiers', val);
          break;
        case 'comment':
          model = sample;
          if (survey === 'general') {
            occurrence = sample.getOccurrence();
            model = occurrence;
          }
          occurrence.set('comment', val);
          break;
        default:
      }
    });
  },

  checkExpiredAttrLocks() {
    const that = this;
    const activity = this.getAttrLock('activity', 'general');
    if (activity) {
      if (userModel.hasActivityExpired(activity)) {
        Log('AppModel:AttrLocks: activity has expired.');
        this.unsetAttrLock('activity', 'general');
      }
    }
    userModel.on('logout', () => {
      Log('AppModel:AttrLocks: activity has expired.');
      that.unsetAttrLock('activity', 'general'); // remove locked activity
    });
  },
};
