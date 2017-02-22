import Indicia from 'indicia';
import store from './store';
import Sample from 'sample';
import userModel from 'user_model';

const Collection = Indicia.Collection.extend({
  store,
  model: Sample,

  removeAllSynced(callback) {
    let toRemove = 0;
    let noneUsed = true;

    this.models.each((sample) => {
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        noneUsed = false;
        toRemove++;
        sample.destroy()
          .then(() => {
            toRemove--;
            if (toRemove === 0) {
              callback && callback();
            }
          });
      }
    });

    if (noneUsed) {
      callback && callback();
    }
  },

  setAllToSend(callback) {
    const that = this;
    let noneUsed = true;
    let saving = 0;

    this.models.each((sample) => {
      noneUsed = false;
      saving++;
      const promise = sample.setToSend();
      if (!promise) {
        return saving--;
      }
      promise
        .then(() => {
          saving--;
          if (saving === 0) {
            callback && callback();
            if (userModel.hasLogIn()) {
              that.save(null, { remote: true });
            }
          }
        })
        .catch((error) => {
          callback && callback(error);
        });
    });

    if (noneUsed || saving === 0) {
      callback && callback();
    }
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
  .catch(() => {
    savedSamples.fetching = false;
    savedSamples.trigger('fetching:error');
  });

export { savedSamples as default, Collection };
