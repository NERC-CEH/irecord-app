/* eslint-disable no-case-declarations */

/** ****************************************************************************
 * App Model attribute lock functions.
 **************************************************************************** */
import { extendObservable, observe } from 'mobx';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import userModel from 'models/user';
import { coreAttributes } from 'Survey/common/config';

const isDAFOR = (val: string) =>
  ['Dominant', 'Abundant', 'Frequent', 'Occasional', 'Rare'].includes(val);

function getFullAttrName(model: 'smp' | 'occ' | any, attrName: string) {
  let attrType: any = model;

  if (typeof model !== 'string') {
    attrType = model instanceof Sample ? `smp` : `occ`;
  }

  return `${attrType}:${attrName}`;
}

function getDefaultComplexSurveyConfig(model: any, fullAttrName: string) {
  const isSample = model instanceof Sample;
  const isOccurrenceWithoutParent = !isSample && !model.parent;
  if (isOccurrenceWithoutParent) {
    console.log('Survey lock occurrence without sample parent', 'e');
    return null;
  }

  const surveyConfig = isSample ? model.getSurvey() : model.parent!.getSurvey();

  const isCoreAttr = coreAttributes.includes(fullAttrName);
  const surveyName = isCoreAttr ? 'default' : surveyConfig.name;

  return ['complex', `default-${surveyName}`];
}

function getSurveyConfig(model: any, fullAttrName: string) {
  let surveyConfig: any = { name: 'default', complex: false };

  if (typeof model !== 'string') {
    const getTopParent = (m: any): any =>
      m.parent ? getTopParent(m.parent) : m;
    const surveyModel = getTopParent(model);

    surveyConfig = surveyModel.getSurvey();
  }

  const isComplex = surveyConfig.name !== 'default';
  if (isComplex) {
    const isDefaultComplex = surveyConfig.name === 'list';
    if (isDefaultComplex) {
      return getDefaultComplexSurveyConfig(model, fullAttrName);
    }

    return ['complex', surveyConfig.name];
  }

  const isCoreAttr = coreAttributes.includes(fullAttrName);
  const surveyName = isCoreAttr
    ? 'default'
    : surveyConfig.taxa || surveyConfig.name;

  return ['default', surveyName];
}

export default {
  attrLocksExtensionInit() {
    const activity = this.getAttrLock('smp', 'activity');
    if (activity) {
      if (userModel.hasActivityExpired(activity)) {
        console.log(
          'AppModel:AttrLocks: currently locked activity has expired.'
        );
        this.unsetAttrLock('smp', 'activity');
      }
    }

    const that = this;
    function onLogout(change: any) {
      if (change.newValue === false) {
        console.log('AppModel:AttrLocks: removing currently locked activity.');
        that.unsetAttrLock('smp', 'activity');
      }
    }

    observe(userModel.data, 'email', onLogout.bind(this));
  },

  getAllLocks(model: any, fullAttrName = ''): any {
    const [surveyType, surveyName]: any = getSurveyConfig(model, fullAttrName);

    const { attrLocks } = (this as any).data;
    if (!attrLocks[surveyType] || !attrLocks[surveyType][surveyName]) {
      return {};
    }

    return attrLocks[surveyType][surveyName];
  },

  async setAttrLock(
    model: any,
    attr: string,
    value: any,
    skipConfig?: boolean
  ) {
    const survey = model.getSurvey?.();
    if (!skipConfig && survey && survey.attrs?.[attr]?.menuProps?.setLock) {
      survey.attrs?.[attr]?.menuProps?.setLock(model, attr, value);
      return;
    }

    const fullAttrName = getFullAttrName(model, attr);
    const [surveyType, surveyName]: any = getSurveyConfig(model, fullAttrName);
    const { attrLocks } = (this as any).data;

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

    (this as any).data.attrLocks = attrLocks;

    const val = JSON.parse(JSON.stringify(value));
    (this as any).data.attrLocks[surveyType][surveyName][fullAttrName] = val;

    await (this as any).save();
  },

  async unsetAttrLock(model: any, attr: string, skipConfig?: boolean) {
    const survey = (model as any).getSurvey?.();
    if (!skipConfig && survey && survey.attrs?.[attr]?.menuProps?.unsetLock) {
      survey.attrs?.[attr]?.menuProps?.unsetLock(model, attr);
      return;
    }

    const fullAttrName = getFullAttrName(model, attr);
    const locks = this.getAllLocks(model, fullAttrName);

    delete locks[fullAttrName];
    await (this as any).save();
  },

  getAttrLock(model: 'smp' | 'occ', attr: string) {
    const fullAttrName = getFullAttrName(model, attr);
    const locks = this.getAllLocks(model, fullAttrName);

    return locks[fullAttrName];
  },

  isAttrLocked(model: any, attr: string, skipConfig?: boolean) {
    const survey = model.getSurvey?.();
    if (!skipConfig && survey && survey.attrs?.[attr]?.menuProps?.isLocked) {
      return survey.attrs[attr].menuProps.isLocked(model);
    }

    const fullAttrName = getFullAttrName(model, attr);

    let value;
    const lockedVal = this.getAttrLock(model, attr);
    if (!lockedVal) return false;

    // TODO: clean this mess by splitting and moving to surveys attrs
    switch (fullAttrName) {
      case 'smp:activity':
        value = model.data[attr] || {};
        return lockedVal.id === value.id;
      case 'smp:location':
        if (!lockedVal) return false;

        value = model.data[attr];
        // map or gridref
        return (
          lockedVal.latitude === value.latitude &&
          lockedVal.longitude === value.longitude
        );
      case 'smp:locationName':
        if (!lockedVal) return false;
        value = model.data.location;
        return lockedVal === value?.name;

      default:
        value = model.data[attr];
        return JSON.stringify(value) === JSON.stringify(lockedVal);
    }
  },

  appendAttrLocks(model: any, locks: any = {}, skipLocation?: boolean) {
    const isOccurrenceOnly = model instanceof Occurrence;

    function selectModel(attrType: 'smp' | 'occ') {
      const isSampleAttr = attrType === 'smp';
      if (isSampleAttr && isOccurrenceOnly) {
        throw new Error('Invalid attribute lock configuration');
      }

      if (isSampleAttr) return model;

      return isOccurrenceOnly ? model : model.occurrences[0];
    }

    Object.keys(locks).forEach(attr => {
      const value = locks[attr];
      // false or undefined or temp 'true' flag
      if (!value || value === true) {
        return;
      }

      const attrParts = attr.split(':');
      const attrType = attrParts[0] as 'smp' | 'occ';
      const attrName = attrParts[1];

      const selectedModel = selectModel(attrType);

      const val = JSON.parse(JSON.stringify(value));
      switch (attr) {
        case 'smp:activity':
          if (!userModel.hasActivityExpired(val)) {
            console.log(
              'SampleModel:AttrLocks: appending activity to the sample.'
            );
            // eslint-disable-next-line no-param-reassign
            model.data.group = val;
          } else {
            // unset the activity as it's now expired
            console.log('SampleModel:AttrLocks: activity has expired.');
            this.unsetAttrLock('smp', 'activity');
          }
          break;
        case 'smp:location':
          if (skipLocation) {
            break;
          }
          val.name = selectedModel.data.location.name; // don't overwrite old name
          selectedModel.data.location = val;
          break;
        case 'smp:locationName':
          if (skipLocation) {
            break;
          }

          if (!selectedModel.data.location) selectedModel.data.location = {};
          selectedModel.data.location.name = val;

          break;
        case 'occ:number':
          const isValidNumber = !Number.isNaN(Number(val));

          if (!isValidNumber && isDAFOR(val)) {
            selectedModel.data.numberDAFOR = val;
            break;
          }
          const numberAttrName = isValidNumber ? 'number' : 'number-ranges';
          selectedModel.data[numberAttrName] = val;
          break;
        default:
          selectedModel.data[attrName] = val;
      }
    });
  },
};
