import Log from 'helpers/log';
import Sample from 'sample';
import { observable, observe } from 'mobx';
import { modelStore } from './store';

const savedSamples = observable([]);
observe(savedSamples, change => {
  if (change.addedCount) {
    const sample = change.added[0];
    sample.collection = savedSamples;
  }
});

Log('SavedSamples: fetching all samples.');

// load all the samples from storage
savedSamples._init = modelStore
  .findAll()
  .then(modelsJSON => {
    Log('SavedSamples: fetching all samples done.');
    const initAndAddtoList = modelJSON =>
      savedSamples.push(Sample.fromJSON(modelJSON));
    modelsJSON.forEach(initAndAddtoList);
  })
  .catch(err => {
    Log(err, 'e');
    throw err;
  });

export function removeAllSynced() {
  Log('SavedSamples: removing all synced samples.');

  const toWait = [];
  savedSamples.forEach(sample => {
    if (sample.metadata.synced_on) {
      toWait.push(sample.destroy());
    }
  });

  return Promise.all(toWait);
}

export async function setAllToSend() {
  Log('SavedSamples: setting all samples to send.');
  let affectedRecordsCount = 0;
  for (let index = 0; index < savedSamples.length; index++) {
    const sample = savedSamples[index];
    
    const invalids = await sample.setToSend(); // eslint-disable-line
    if (!invalids) {
      affectedRecordsCount++;
      sample.saveRemote();
    }
  }

  return affectedRecordsCount;
}

/**
 * Reverse order so that newest are at the top of list.
 * @param a
 * @returns {number}
 */
export function comparator(a) {
  const date = new Date(a.metadata.created_on);
  return -date.getTime();
}

export function resetDefaults() {
  const destroyAllSamples = savedSamples.map(sample => sample.destroy());
  return Promise.all(destroyAllSamples);
}

// TODO:
// function syncSamples() {
//   if (Device.isOnline() && appModel.attrs.autosync && userModel.hasLogIn()) {
//     // wait till savedSamples is fully initialized
//     if (savedSamples.metadata.fetching) {
//       observe(savedSamples.metadata, 'fetching', change => {
//         if (change.oldValue !== change.newValue) {
//           Log('Samples:router: syncing all samples.');
//           savedSamples.forEach(sample => sample.save(null, { remote: true }));
//         }
//       });
//       return;
//     }
//     Log('Samples:router: syncing all samples.');
//     savedSamples.forEach(sample => sample.save(null, { remote: true }));
//   }
// }

// function onLogin(change) {
//   if (change.newValue === true) {
//     syncSamples();
//   }
// }

// observe(userModel.attrs, 'isLoggedIn', onLogin);

export { savedSamples as default };
