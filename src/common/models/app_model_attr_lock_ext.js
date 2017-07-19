/** ****************************************************************************
 * App Model attribute lock functions.
 *****************************************************************************/
import _ from 'lodash';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import userModel from 'user_model';

export default {
  _getRawLocks(survey) {
    const locks = this.get('attrLocks');
    locks[survey] || (locks[survey] = {});

    return locks;
  },
  setAttrLock(attr, value, survey = 'general') {
    const val = _.cloneDeep(value);
    const locks = this._getRawLocks(survey);

    locks[survey][attr] = val;
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');

    if (value) {
      Analytics.trackEvent('Lock', attr);
    }
  },

  unsetAttrLock(attr, survey = 'general') {
    const locks = this._getRawLocks(survey);
    delete locks[survey][attr];
    this.set(locks);
    this.save();
    this.trigger('change:attrLocks');
  },

  getAttrLock(attr, survey = 'general') {
    const locks = this._getRawLocks(survey);
    return locks[survey][attr];
  },

  isAttrLocked(attr, value = {}, survey = 'general') {
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
        return lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude;
      case 'locationName':
        if (!lockedVal) {
          return false;
        }

        return lockedVal.name === value.name;
      case 'date':
        if (isNaN(Date.parse(value)) || isNaN(Date.parse(lockedVal))) {
          return false;
        }

        lockedVal = new Date(lockedVal);
        const currentValue = new Date(value);
        return lockedVal.getTime() === currentValue.getTime();
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

      let occurrence;
      let model;
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
          let location = sample.get('location');
          val.name = location.name; // don't overwrite old name
          sample.set('location', val);
          break;
        case 'locationName':
          // insert location name
          location = sample.get('location');
          location.name = val;
          sample.set('location', location);
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
    const activity = this.getAttrLock('activity');
    if (activity) {
      if (userModel.hasActivityExpired(activity)) {
        Log('AppModel:AttrLocks: activity has expired.');
        this.unsetAttrLock('activity');
      }
    }
    userModel.on('logout', () => {
      Log('AppModel:AttrLocks: activity has expired.');
      that.unsetAttrLock('activity'); // remove locked activity
    });
  },
};
