/** ****************************************************************************
 * App Model attribute lock functions.
 **************************************************************************** */
import _ from 'lodash';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import { coreAttributes } from 'common/config/surveys/general';
import userModel from 'user_model';
import Indicia from 'indicia';
import { observable, extendObservable, observe } from 'mobx';

export default {
  attrLocksExtensionInit() {
    const activity = this.getAttrLock('smp:activity');
    if (activity) {
      if (userModel.hasActivityExpired(activity)) {
        Log('AppModel:AttrLocks: currently locked activity has expired.');
        this.unsetAttrLock('smp:activity');
      }
    }

    function onLogout(change) {
      if (change.newValue === false) {
        Log('AppModel:AttrLocks: removing currently locked activity.');
        this.unsetAttrLock('smp:activity');
      }
    }

    observe(userModel.attrs, 'isLoggedIn', onLogout.bind(this));
  },

  _getRawLocks(surveyType, surveyName) {
    const locks = this.get('attrLocks');

    if (!locks[surveyType] || !locks[surveyType][surveyName]) {
      if (!locks[surveyType]) {
        extendObservable(locks, {
          [surveyType]: {},
        });
      }
      extendObservable(locks[surveyType], {
        [surveyName]: {},
      });
      this.set('attrLocks', locks);
      this.save();
    }

    return locks;
  },

  _extractTypeName(surveyConfig) {
    surveyConfig = surveyConfig || {};
    const surveyType = surveyConfig.complex ? 'complex' : 'general';
    const surveyName = surveyConfig.name || 'default';
    return { surveyType, surveyName };
  },

  /**
   *
   * @param attr in format modelType:attrName
   * @param value
   * @param surveyConfig
   */
  setAttrLock(attr, value, surveyConfig) {
    const val = _.cloneDeep(value);
    const { surveyType, surveyName } = this._extractTypeName(surveyConfig);
    const locks = this._getRawLocks(surveyType, surveyName);

    locks[surveyType][surveyName] = Object.assign(
      {},
      locks[surveyType][surveyName],
      { [attr]: val }
    );
    this.set('attrLocks', observable(locks));
    this.save();
    this.trigger('change:attrLocks');

    if (value) {
      Analytics.trackEvent('Lock', attr);
    }
  },

  /**
   *
   * @param attr in format modelType:attrName
   * @param surveyConfig
   */
  unsetAttrLock(attr, surveyConfig) {
    const { surveyType, surveyName } = this._extractTypeName(surveyConfig);
    const locks = this._getRawLocks(surveyType, surveyName);

    delete locks[surveyType][surveyName][attr];
    this.set('attrLocks', observable(locks));
    this.save();
    this.trigger('change:attrLocks');
  },

  /**
   *
   * @param attr in format modelType:attrName
   * @param surveyConfig
   * @returns {*}
   */
  getAttrLock(attr, surveyConfig) {
    const { surveyType, surveyName } = this._extractTypeName(surveyConfig);
    const locks = this._getRawLocks(surveyType, surveyName);

    return locks[surveyType][surveyName][attr];
  },

  /**
   *
   * @param model
   * @param attr no modelType required only attrName
   * @returns {boolean}
   */
  isAttrLocked(model, attr, noSurveyExists) {
    const fullAttrName =
      model instanceof Indicia.Sample ? `smp:${attr}` : `occ:${attr}`;
    const isCoreAttr = coreAttributes.includes(fullAttrName);
    const surveyConfig =
      isCoreAttr || noSurveyExists ? null : model.getSurvey();

    let value;
    let lockedVal = this.getAttrLock(fullAttrName, surveyConfig);
    if (!lockedVal) {
      // has not been locked
      return false;
    }
    if (lockedVal === true) {
      // has been locked
      return true;
    }

    switch (fullAttrName) {
      case 'smp:activity':
        value = model.get(attr) || {};
        return lockedVal.id === value.id;
      case 'smp:location':
        if (!lockedVal) {
          return false;
        }
        value = model.get(attr);
        // map or gridref
        return (
          lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude
        );
      case 'smp:locationName':
        if (!lockedVal) {
          return false;
        }
        value = model.get('location');
        return lockedVal === value.name;
      case 'occ:number':
        value = model.get(attr);
        return (
          lockedVal === model.get(attr) ||
          lockedVal === model.get('number-ranges')
        );
      case 'smp:date':
        value = model.get(attr);
        if (
          Number.isNaN(Date.parse(value)) ||
          Number.isNaN(Date.parse(lockedVal))
        ) {
          return false;
        }

        lockedVal = new Date(lockedVal);
        const currentValue = new Date(value);
        return lockedVal.getTime() === currentValue.getTime();
      default:
        value = model.get(attr);
        return value === lockedVal;
    }
  },
};
