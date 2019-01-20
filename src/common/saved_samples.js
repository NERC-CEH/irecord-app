import Indicia from 'indicia';
import Log from 'helpers/log';
import Sample from 'sample';
import { observable } from 'mobx';
import store from './store';

const Collection = Indicia.Collection.extend({
  store,
  model: Sample,

  initialize() {
    Log('Saved Samples: initializing');
    this.metadata = observable({ fetching: undefined }); // for mobx hook only
  },

  /**
   * Disable sort for mobx to keep the same refs.
   */
  add(...args) {
    return Indicia.Collection.prototype.add.apply(this, [
      ...args,
      { sort: false },
    ]);
  },

  removeAllSynced() {
    Log('SavedSamples: removing all synced samples.');

    const toWait = [];
    this.models.forEach(sample => {
      if (sample.metadata.synced_on) {
        toWait.push(sample.destroy());
      }
    });

    return Promise.all(toWait);
  },

  setAllToSend() {
    Log('SavedSamples: setting all samples to send.');

    const toWait = [];
    this.models.forEach(sample => {
      const validPromise = sample.setToSend();
      if (!validPromise) {
        return;
      }
      toWait.push(validPromise);
    });
    return Promise.all(toWait).then(() => {
      const toWaitSend = [];
      this.models.forEach(sample => {
        const validPromise = sample.save(null, { remote: true });
        if (!validPromise) {
          return;
        }
        toWaitSend.push(validPromise);
      });
      // return Promise.all(toWaitSend);
      // no promise return since we don't want wait till all are submitted
      // as this can be done in the background
    });
  },

  /**
   * Reverse order so that newest are at the top of list.
   * @param a
   * @returns {number}
   */
  comparator(a) {
    const date = new Date(a.metadata.created_on);
    return -date.getTime();
  },

  resetDefaults() {
    const destroyAllSamples = this.models.map(sample =>
      sample.destroy()
    );
    return Promise.all(destroyAllSamples);
  },
});

const savedSamples = new Collection();
Log('SavedSamples: fetching all samples.');

// load all the samples from storage
savedSamples.fetching = true;
savedSamples.metadata.fetching = true; // for mobx hook only
savedSamples
  .fetch()
  .then(() => {
    Log('SavedSamples: fetching all samples done.');

    savedSamples.fetching = false;
    savedSamples.metadata.fetching = false; // for mobx hook only

    // because the reference is changed in the meanwhile
    savedSamples.models = observable(savedSamples.models);
    window.s1 = savedSamples.models;
    window.savedSamples = savedSamples;
    savedSamples.trigger('fetching:done');
  })
  .catch(err => {
    Log(err, 'e');

    savedSamples.fetching = false;
    savedSamples.metadata.fetching = false; // for mobx hook only

    savedSamples.trigger('fetching:error');
  });

export { savedSamples as default, Collection };
