/** ****************************************************************************
 * Sample router.
 **************************************************************************** */
import React from 'react';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import Device from 'helpers/device';
import App from 'app';
import radio from 'radio';
import savedSamples from 'saved_samples';
import userModel from 'user_model';
import appModel from 'app_model';
import { coreAttributes } from 'common/config/surveys/general';
import DateHelp from 'helpers/date';
import { observe } from 'mobx';
import ShowRecord from './Show';
import EditRecord from './Edit';
import EditRecordHeader from './Edit/Header';
import EditRecordFooter from './Edit/Footer';
import Records from './List';
import RecordsHeader from './List/Header';
import Header from '../common/Components/Header';
import Loader from '../common/Components/Loader';
import EditLocationController from '../common/pages/location/controller';
import Attr from './Attr';
import AttrHeader from './Attr/Header';
import ActivitiesController from '../common/pages/activities/controller';
import TaxonController from '../common/pages/taxon/controller';

App.samples = {};

function getSample(callback, ...args) {
  if (savedSamples.fetching) {
    // wait till savedSamples is fully initialized
    radio.trigger('app:main', <Loader />);
    savedSamples.once('fetching:done', () => {
      callback.apply(this, args);
    });

    return null;
  }

  const [sampleID] = args;
  const sample = savedSamples.get(sampleID);

  // Not found
  if (!sample) {
    Log('No sample model found.', 'e');
    radio.trigger('app:404:show', { replace: true });
    return null;
  }

  // can't edit a saved one - to be removed when sample update
  // is possible on the server
  const isRecursive = callback === showRecord; //eslint-disable-line
  if (sample.metadata.synced_on && !isRecursive) {
    radio.trigger('samples:show', sampleID, { replace: true });
    return null;
  }

  return sample;
}

function showEditRecord(sampleID) {
  Log('Samples:Edit: visited.');

  const sample = getSample(showEditRecord, sampleID);
  if (!sample) {
    return;
  }

  // can't edit a saved one - to be removed when sample update
  // is possible on the server
  if (sample.metadata.synced_on) {
    radio.trigger('samples:show', sampleID, { replace: true });
    return;
  }

  radio.trigger(
    'app:header',
    <EditRecordHeader sample={sample} userModel={userModel} />
  );
  radio.trigger('app:main', <EditRecord sample={sample} appModel={appModel} />);
  radio.trigger('app:footer', <EditRecordFooter sample={sample} />);
}

function showEditAttr(sampleID, attrID) {
  Log('Samples:Attr: visited.');
  const sample = getSample(showEditAttr, sampleID, attrID);
  if (!sample) {
    return;
  }
  const occ = sample.getOccurrence();

  const attr = attrID;

  const attrParts = attr.split(':');
  const attrType = attrParts[0];
  const attrName = attrParts[1];

  let initialVal =
    attrType === 'smp' ? sample.get(attrName) : occ.get(attrName);

  if (attr === 'occ:number') {
    initialVal = [occ.get('number-ranges'), occ.get('number')];
  }

  function onLockClick() {
    Log('Samples:Attr: lock clicked.');
    let surveyConfig = sample.getSurvey();
    const isCoreAttr = coreAttributes.includes(attr);

    surveyConfig = !isCoreAttr && surveyConfig;
    // invert the lock of the attribute
    // real value will be put on exit
    appModel.setAttrLock(
      attr,
      !appModel.getAttrLock(attr, surveyConfig),
      surveyConfig
    );
  }

  let latestVal = initialVal;

  function updateLock(newVal, currentVal, surveyConfig) {
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
  }

  /**
   * Update sample with new values
   */
  function save(values, callback) {
    Log('Samples:Attr:Controller: saving.');

    let currentVal;
    let newVal;

    switch (attr) {
      case 'occ:number':
        currentVal = occ.get('number') || occ.get('number-ranges');
        const [rangesValue, sliderValue] = values;

        // todo: validate before setting up
        if (sliderValue) {
          // specific number
          newVal = sliderValue;
          occ.set('number', sliderValue);
          occ.unset('number-ranges');
        } else {
          // number ranges
          newVal = rangesValue;
          occ.set('number-ranges', rangesValue);
          occ.unset('number');
        }
        break;
      default:
        const surveyAttrs = sample.getSurvey().attrs;

        const attrConfig = surveyAttrs[attrType][attrName];

        const model = attrType === 'smp' ? sample : occ;

        currentVal = model.get(attrName);
        newVal = values;

        // validate before setting up
        if (attrConfig.isValid && !attrConfig.isValid(newVal)) {
          radio.trigger('app:dialog', {
            title: 'Sorry',
            body: 'Invalid date selected',
            timeout: 2000,
          });
          return;
        }

        model.set(attrName, newVal);
    }

    // save it
    sample
      .save()
      .then(() => {
        // update locked value if attr is locked
        updateLock(newVal, currentVal, sample.getSurvey());
        callback && callback();
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  }

  function onExit(callback) {
    Log('Samples:Attr: exiting.');
    save(latestVal, callback);
  }

  function onValueChange(newValue, exit) {
    latestVal = newValue; // cache the val if left using the header
    if (exit) {
      onExit(() => {
        window.history.back();
      });
    }
  }

  radio.trigger(
    'app:header',
    <AttrHeader
      sample={sample}
      attr={attrID}
      appModel={appModel}
      onLockClick={onLockClick}
      onLeave={onExit}
    />
  );
  radio.trigger(
    'app:main',
    <Attr
      sample={sample}
      attr={attrID}
      onValueChange={onValueChange}
      initialVal={initialVal}
    />
  );
  radio.trigger('app:footer:hide');
}

function showRecord(sampleID) {
  Log('Samples:Show: visited.');

  const sample = getSample(showRecord, sampleID);
  if (!sample) {
    return;
  }

  radio.trigger('app:header', <Header>Record</Header>);
  radio.trigger('app:main', <ShowRecord sample={sample} />);
  radio.trigger('app:footer:hide');
}

function showRecords() {
  Log('Samples:List: visited.');

  if (savedSamples.metadata.fetching) {
    // wait till savedSamples is fully initialized
    radio.trigger('app:main', <Loader />);
    savedSamples.once('fetching:done', () => {
      showRecords.apply(this);
    });

    return;
  }

  const activity = appModel.getAttrLock('smp:activity') || {};
  const isActivity = !!activity.title;
  const isTraining = appModel.get('useTraining');

  radio.trigger('app:header', <RecordsHeader appModel={appModel} />);
  radio.trigger(
    'app:main',
    <Records
      savedSamples={savedSamples.models}
      isActivity={isActivity}
      isTraining={isTraining}
      appModel={appModel}
    />
  );
  radio.trigger('app:footer:hide');
}

const Router = Marionette.AppRouter.extend({
  routes: {
    'samples(/)': showRecords,
    'samples/new(/)': TaxonController.show,
    'samples/:id': showRecord,
    'samples/:id/edit(/)': showEditRecord,
    'samples/:id/edit/location(/)': EditLocationController.show,
    'samples/:id/edit/activity(/)': ActivitiesController.show,
    'samples/:id/edit/:attr(/)': showEditAttr,
    'samples/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('samples:list', options => {
  App.navigate('samples', options);
  showRecords();
});

radio.on('samples:show', (sampleID, options) => {
  App.navigate(`samples/${sampleID}`, options);
  showRecord(sampleID);
});

radio.on('samples:edit', (sampleID, options) => {
  App.navigate(`samples/${sampleID}/edit`, options);
  showEditRecord(sampleID);
});

radio.on('samples:edit:attr', (sampleID, attrID, options = {}) => {
  App.navigate(`samples/${sampleID}/edit/${attrID}`, options);
  switch (attrID) {
    case 'location':
      EditLocationController.show(sampleID);
      break;
    case 'taxon':
      TaxonController.show(options);
      break;
    case 'activity':
      ActivitiesController.show(sampleID);
      break;
    default:
      showEditAttr(sampleID, attrID);
  }
});

radio.on('sample:saved', () => {
  window.history.back();
});

function syncSamples() {
  if (Device.isOnline() && appModel.get('autosync') && userModel.hasLogIn()) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        Log('Samples:router: syncing all samples.');
        savedSamples.models.forEach(sample =>
          sample.save(null, { remote: true })
        );
      });
      return;
    }
    Log('Samples:router: syncing all samples.');
    savedSamples.models.forEach(sample => sample.save(null, { remote: true }));
  }
}

function onLogin(change) {
  if (change.newValue === true) {
    syncSamples();
  }
}

observe(userModel.attrs, 'isLoggedIn', onLogin);

App.on('before:start', () => {
  Log('Samples:router: initializing.');
  App.samples.router = new Router();
});
