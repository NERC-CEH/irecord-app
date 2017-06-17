import Indicia from 'indicia';
import Log from 'helpers/log';
import Sample from 'sample';
import store from './store';

const Collection = Indicia.Collection.extend({
  store,
  model: Sample,

  removeAllSynced() {
    Log('SavedSamples: removing all synced samples.');

    const toWait = [];
    this.models.forEach((sample) => {
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        toWait.push(sample.destroy());
      }
    });

    return Promise.all(toWait);
  },

  setAllToSend() {
    Log('SavedSamples: setting all samples to send.');

    const that = this;
    const toWait = [];
    this.models.forEach((sample) => {
      const validPromise = sample.setToSend();
      if (!validPromise) {
        return;
      }
      toWait.push(validPromise);
    });
    return Promise.all(toWait)
      .then(() => {
        const toWaitSend = [];
        that.models.forEach((sample) => {
          const validPromise = sample.save(null, { remote: true });
          if (!validPromise) {
            return;
          }
          toWaitSend.push(validPromise);
        });
        Promise.all(toWaitSend);
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
    return -a.metadata.created_on;
  },
});


const savedSamples = new Collection();
Log('SavedSamples: fetching all samples.');

// load all the samples from storage
savedSamples.fetching = true;
savedSamples.fetch()
  .then(() => {
    Log('SavedSamples: fetching all samples done.');

    savedSamples.fetching = false;
    savedSamples.trigger('fetching:done');
  })
  .catch((err) => {
    Log(err, 'e');

    savedSamples.fetching = false;
    savedSamples.trigger('fetching:error');
  });

export { savedSamples as default, Collection };
