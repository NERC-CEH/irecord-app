/** ****************************************************************************
 * Sample Attribute controller.
 **************************************************************************** */
import Backbone from 'backbone';
import Indicia from 'indicia';
import Log from 'helpers/log';
import DateHelp from 'helpers/date';
import radio from 'radio';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import { coreAttributes } from 'common/config/surveys/general';
import MainView from './main_view';

import HeaderView from '../../common/views/header_view';
import LockView from '../../common/views/attr_lock_view';

const API = {
  show(sampleID, attr) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        API.show.apply(this, [sampleID, attr]);
      });
      return;
    }

    Log(`Samples:Attr:Controller: showing ${attr}.`);

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', sampleID, { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      attr,
      model: sample,
    });
    radio.trigger('app:main', mainView);

    // HEADER
    const surveyConfig = sample.getSurvey();
    const isCoreAttr = coreAttributes.includes(attr);
    const lockView = new LockView({
      model: new Backbone.Model({ appModel, sample }),
      attr,
      onLockClick: view => API.onLockClick(view, !isCoreAttr && surveyConfig),
      surveyConfig: !isCoreAttr && surveyConfig,
    });

    const surveyAttrs = surveyConfig.attrs;

    const attrParts = attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];
    const attrConfig = surveyAttrs[attrType][attrName];

    const headerView = new HeaderView({
      onExit() {
        API.onExit(mainView, sample, attr, () => {
          window.history.back();
        });
      },
      rightPanel: lockView,
      model: new Backbone.Model({ title: attrConfig.label || attrName }),
    });

    radio.trigger('app:header', headerView);

    // if exit on selection click
    mainView.on('save', () => {
      API.onExit(mainView, sample, attr, () => {
        window.history.back();
      });
    });

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  onLockClick(view, surveyConfig) {
    Log('Samples:Attr:Controller: lock clicked.');
    const attr = view.options.attr;
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock(
      attr,
      !appModel.getAttrLock(attr, surveyConfig),
      surveyConfig
    );
  },

  onExit(mainView, sample, attr, callback) {
    Log('Samples:Attr:Controller: exiting.');
    const values = mainView.getValues();
    API.save(attr, values, sample, callback);
  },

  /**
   * Update sample with new values
   */
  save(attr, values, sample, callback) {
    Log('Samples:Attr:Controller: saving.');

    let currentVal;
    let newVal;
    const occ = sample.getOccurrence();

    switch (attr) {
      case 'occ:number':
        currentVal = occ.get('number') || occ.get('number-ranges');

        // todo: validate before setting up
        if (values[attr][0]) {
          // specific number
          newVal = values[attr][0];
          occ.set('number', newVal);
          occ.unset('number-ranges');
        } else {
          // number ranges
          newVal = values[attr][1];
          occ.set('number-ranges', newVal);
          occ.unset('number');
        }
        break;
      default:
        const surveyAttrs = sample.getSurvey().attrs;

        const attrParts = attr.split(':');
        const attrType = attrParts[0];
        const attrName = attrParts[1];
        const attrConfig = surveyAttrs[attrType][attrName];

        const model = attrType === 'smp' ? sample : occ;

        currentVal = model.get(attrName);
        newVal = values[attr];

        // validate before setting up
        if (attrConfig.isValid && !attrConfig.isValid(newVal)) {
          radio.trigger('app:dialog', {
            title: 'Sorry',
            body: 'Invalid date selected',
            timeout: 2000,
          });
          return;
        }

        model.set(attrName, values[attr]);
      // Log('Samples:Attr:Controller: no such attribute to save!', 'e');
    }

    // save it
    sample
      .save()
      .then(() => {
        // update locked value if attr is locked
        API.updateLock(attr, newVal, currentVal, sample.getSurvey());
        callback();
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  updateLock(attr, newVal, currentVal, surveyConfig) {
    if (coreAttributes.includes(attr)) {
      surveyConfig = null;
    }
    const lockedValue = appModel.getAttrLock(attr, surveyConfig);

    switch (attr) {
      case 'smp:date':
        if (
          !lockedValue ||
          (lockedValue && DateHelp.print(newVal) === DateHelp.print(new Date()))
        ) {
          // don't lock current day
          appModel.unsetAttrLock(attr);
        } else {
          appModel.setAttrLock(attr, newVal);
        }
        break;
      default:
        if (
          lockedValue &&
          (lockedValue === true || lockedValue === currentVal)
        ) {
          appModel.setAttrLock(attr, newVal, surveyConfig);
        }
    }
  },
};

export { API as default };
