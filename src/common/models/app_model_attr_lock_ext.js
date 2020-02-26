/** ****************************************************************************
 * App Model attribute lock functions.
 **************************************************************************** */
import Log from 'helpers/log';
import coreAttributes from 'common/config/surveys/index';
import userModel from 'user_model';
import Indicia from '@indicia-js/core';
import { extendObservable, observe } from 'mobx';
import Occurrence from './occurrence';

function getFullAttrName(model, attrName) {
  let attrType = model;

  if (typeof model !== 'string') {
    attrType = model instanceof Indicia.Sample ? `smp` : `occ`;
  }

  return `${attrType}:${attrName}`;
}

function getDefaultComplexSurveyConfig(model, fullAttrName) {
  const isSample = model instanceof Indicia.Sample;
  const isOccurrenceWithoutParent = !isSample && !model.parent;
  if (isOccurrenceWithoutParent) {
    Log('Survey lock occurrence without sample parent', 'e');
    return null;
  }

  const surveyConfig = isSample ? model.getSurvey() : model.parent.getSurvey();

  const isCoreAttr = coreAttributes.includes(fullAttrName);
  const surveyName = isCoreAttr ? 'default' : surveyConfig.name;

  return ['complex', `default-${surveyName}`];
}

function getSurveyConfig(model, fullAttrName) {
  let surveyConfig = { name: 'default', complex: false };

  if (typeof model !== 'string') {
    const getTopParent = m => (m.parent ? getTopParent(m.parent) : m);
    const surveyModel = getTopParent(model);

    surveyConfig = surveyModel.getSurvey();
  }

  const isComplex = surveyConfig.complex;
  if (isComplex) {
    const isDefaultComplex = isComplex && surveyConfig.name === 'default';
    if (isDefaultComplex) {
      return getDefaultComplexSurveyConfig(model, fullAttrName);
    }

    return ['complex', surveyConfig.name];
  }

  const isCoreAttr = coreAttributes.includes(fullAttrName);
  const surveyName = isCoreAttr ? 'default' : surveyConfig.name;

  return ['default', surveyName];
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

  getAllLocks(model, fullAttrName = '') {
    const [surveyType, surveyName] = getSurveyConfig(model, fullAttrName);

    const { attrLocks } = this.attrs;
    if (!attrLocks[surveyType] || !attrLocks[surveyType][surveyName]) {
      return {};
    }

    return attrLocks[surveyType][surveyName];
  },

  async setAttrLock(model, attr, value) {
    const fullAttrName = getFullAttrName(model, attr);
    const [surveyType, surveyName] = getSurveyConfig(model, fullAttrName);
    const { attrLocks } = this.attrs;

    if (!attrLocks[surveyType]) {
      extendObservable(attrLocks, {
        [surveyType]: {},
      });
    }

    if (!attrLocks[surveyType][surveyName]) {
      extendObservable(attrLocks[surveyType], {
        [surveyName]: {},
      });
    }

    this.attrs.attrLocks = attrLocks;

    const val = JSON.parse(JSON.stringify(value));
    this.attrs.attrLocks[surveyType][surveyName][fullAttrName] = val;

    await this.save();
  },

  async unsetAttrLock(model, attr) {
    const fullAttrName = getFullAttrName(model, attr);
    const locks = this.getAllLocks(model, fullAttrName);

    delete locks[fullAttrName];
    await this.save();
  },

  getAttrLock(model, attr) {
    const fullAttrName = getFullAttrName(model, attr);
    const locks = this.getAllLocks(model, fullAttrName);

    return locks[fullAttrName];
  },

  isAttrLocked(model, attr) {
    const fullAttrName = getFullAttrName(model, attr);

    let value;
    let lockedVal = this.getAttrLock(model, attr);
    if (!lockedVal) {
      return false;
    }

    // TODO: clean this mess by splitting and moving to surveys attrs
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
          lockedVal === model.attrs['number-ranges'] ||
          lockedVal === model.attrs.numberDAFOR
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

  appendAttrLocks(model, locks = {}, skipLocation) {
    Log('appModel: appending attr locks.');

    const isOccurrenceOnly = model instanceof Occurrence;

    function selectModel(attrType) {
      const isSampleAttr = attrType === 'smp';
      if (isSampleAttr && isOccurrenceOnly) {
        throw new Error('Invalid attibute lock configuration');
      }

      if (isSampleAttr) {
        return model;
      }

      return isOccurrenceOnly ? model : model.occurrences[0];
    }

    Object.keys(locks).forEach(attr => {
      const value = locks[attr];
      // false or undefined or temp 'true' flag
      if (!value || value === true) {
        return;
      }

      const attrParts = attr.split(':');
      const attrType = attrParts[0];
      const attrName = attrParts[1];

      const selectedModel = selectModel(attrType);

      const val = JSON.parse(JSON.stringify(value));
      switch (attr) {
        case 'smp:activity':
          if (!userModel.hasActivityExpired(val)) {
            Log('SampleModel:AttrLocks: appending activity to the sample.');
            model.attrs.activity = val;
          } else {
            // unset the activity as it's now expired
            Log('SampleModel:AttrLocks: activity has expired.');
            this.unsetAttrLock('smp', 'activity');
          }
          break;
        case 'smp:location':
          if (skipLocation) {
            break;
          }
          let { location } = selectedModel.attrs;
          val.name = location.name; // don't overwrite old name
          selectedModel.attrs.location = val;
          break;
        case 'smp:locationName':
          if (skipLocation) {
            break;
          }
          location = selectedModel.attrs.location;
          location.name = val;
          selectedModel.attrs.location = location;
          break;
        case 'smp:date':
          // parse stringified date
          selectedModel.attrs.date = new Date(val);
          break;
        case 'occ:number':
          const isValidNumber = !Number.isNaN(Number(val));

          const isDAFOR = [
            'Dominant',
            'Abundant',
            'Frequent',
            'Occasional',
            'Rare',
          ].includes(val);

          if (!isValidNumber && isDAFOR) {
            selectedModel.attrs.numberDAFOR = val;
            break;
          }
          const numberAttrName = isValidNumber ? 'number' : 'number-ranges';
          selectedModel.attrs[numberAttrName] = val;
          break;
        default:
          selectedModel.attrs[attrName] = val;
      }
    });
  },
};
