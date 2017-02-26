import Indicia from 'indicia';
import Log from 'helpers/log';
import userModel from 'user_model';
import Sample from 'sample';
import store from './store';

const Collection = Indicia.Collection.extend({
  store,
  model: Sample,

  removeAllSynced() {
    const toWait = [];
    this.models.each((sample) => {
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        toWait.push(sample.destroy());
      }
    });

    return Promise.all(toWait);
  },

  setAllToSend() {
    const toWait = [];
    this.models.each((sample) => {
      const validPromise = sample.setToSend();
      if (!validPromise) {
        return;
      }
      toWait.push(validPromise);
    });
    return Promise.all(toWait);
  },
});


const savedSamples = new Collection();
// load all the samples from storage
savedSamples.fetching = true;
savedSamples.fetch()
  .then(() => {
    savedSamples.fetching = false;
    savedSamples.trigger('fetching:done');
  })
  .catch((err) => {
    Log(err, 'e');

    savedSamples.fetching = false;
    savedSamples.trigger('fetching:error');
  });

export { savedSamples as default, Collection };
