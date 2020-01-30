/** ****************************************************************************
 * App Model attribute lock functions.
 **************************************************************************** */
import _ from 'lodash';
import Log from 'helpers/log';
import { coreAttributes } from 'common/config/surveys/default';
import userModel from 'user_model';
import Indicia from 'indicia';
import { observable, extendObservable, observe } from 'mobx';

function getSurveyConfig(model, attrName) {
  let attrType = model;
  let surveyConfig = { name: 'default', complex: false };

  if (typeof model !== 'string') {
    attrType = model instanceof Indicia.Sample ? `smp` : `occ`;

    const getTopParent = m => (m.parent ? getTopParent(m.parent) : m);
    const surveyModel = getTopParent(model);

    surveyConfig = surveyModel.getSurvey();
    const isDefaultComplex =
      surveyConfig.complex && surveyConfig.name === 'default';
    if (isDefaultComplex) {
      // use non-complex default namespace
      surveyConfig = model.getSurvey();
    }
  }
  const fullAttrName = `${attrType}:${attrName}`;

  const surveyType = surveyConfig.complex ? 'complex' : 'default';
  const isCoreAttr = coreAttributes.includes(fullAttrName);
  const isCoreDefault = !surveyConfig.complex && isCoreAttr;
  const surveyName = isCoreDefault ? 'default' : surveyConfig.name;

  return [fullAttrName, surveyType, surveyName];
}

export default {
  attrLocksExtensionInit() {
    const activity = this.getAttrLock('smp', 'activity');
    if (activity) {
      if (userModel.hasActivityExpired(activity)) {
        Log('AppModel:AttrLocks: currently locked activity has expired.');
        this.unsetAttrLock('smp', 'activity');
      }
    }

    function onLogout(change) {
      if (change.newValue === false) {
        Log('AppModel:AttrLocks: removing currently locked activity.');
        this.unsetAttrLock('smp', 'activity');
      }
    }

    observe(userModel.attrs, 'isLoggedIn', onLogout.bind(this));
  },

  _getRawLocks(surveyType, surveyName) {
    const locks = this.attrs.attrLocks;

    if (!locks[surveyType] || !locks[surveyType][surveyName]) {
      return null;
    }

    return locks;
  },

  _initRawLocks(surveyType, surveyName) {
    const locks = this.attrs.attrLocks;

    if (!locks[surveyType]) {
      extendObservable(locks, {
        [surveyType]: {},
      });
    }
    extendObservable(locks[surveyType], {
      [surveyName]: {},
    });
    this.attrs.attrLocks = locks;
    return this.attrs.attrLocks;
  },

  async setAttrLock(model, attr, value) {
    const [fullAttrName, surveyType, surveyName] = getSurveyConfig(model, attr);

    const val = _.cloneDeep(value);
    let locks = this._getRawLocks(surveyType, surveyName);
    if (!locks) {
      locks = this._initRawLocks(surveyType, surveyName);
    }

    locks[surveyType][surveyName] = {
      ...locks[surveyType][surveyName],
      [fullAttrName]: val,
    };
    this.attrs.attrLocks = observable(locks);
    await this.save();
  },

  unsetAttrLock(model, attr) {
    const [fullAttrName, surveyType, surveyName] = getSurveyConfig(model, attr);

    const locks = this._getRawLocks(surveyType, surveyName);
    if (!locks) {
      return;
    }

    delete locks[surveyType][surveyName][fullAttrName];
    this.attrs.attrLocks = observable(locks);
    this.save();
  },

  getAttrLock(model, attr) {
    const [fullAttrName, surveyType, surveyName] = getSurveyConfig(model, attr);

    const locks = this._getRawLocks(surveyType, surveyName);
    if (!locks) {
      return null;
    }

    return locks[surveyType][surveyName][fullAttrName];
  },

  isAttrLocked(model, attr) {
    const [fullAttrName] = getSurveyConfig(model, attr);

    let value;
    let lockedVal = this.getAttrLock(model, attr);
    if (!lockedVal) {
      return false;
    }

    switch (fullAttrName) {
      case 'smp:activity':
        value = model.attrs[attr] || {};
        return lockedVal.id === value.id;
      case 'smp:location':
        if (!lockedVal) {
          return false;
        }
        value = model.attrs[attr];
        // map or gridref
        return (
          lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude
        );
      case 'smp:locationName':
        if (!lockedVal) {
          return false;
        }
        value = model.attrs.location;
        return lockedVal === value.name;
      case 'occ:number':
        value = model.attrs[attr];
        return (
          lockedVal === model.attrs[attr] ||
          lockedVal === model.attrs['number-ranges']
        );
      case 'smp:date':
        value = model.attrs[attr];
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
        value = model.attrs[attr];
        return JSON.stringify(value) === JSON.stringify(lockedVal);
    }
  },
};
