import Morel from 'morel';
import store from './store';
import Sample from './models/sample';

const Collection = Morel.Collection.extend({
  store,
  model: Sample,

  removeAllSynced(callback) {
    let toRemove = 0;
    let noneUsed = true;

    this.models.each((record) => {
      if (record.getSyncStatus() === Morel.SYNCED) {
        noneUsed = false;
        toRemove++;
        record.destroy()
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

    this.models.each((record) => {
      noneUsed = false;
      saving++;
      const promise = record.setToSend();
      if (!promise) {
        return saving--;
      }
      promise
        .then(() => {
          saving--;
          if (saving === 0) {
            callback && callback();
            that.save(null, { remote: true });
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


const savedRecords = new Collection();
// load all the records from storage
savedRecords.fetching = true;
savedRecords.fetch()
  .then(() => {
    savedRecords.fetching = false;
    savedRecords.trigger('fetching:done');
  })
  .catch(() => {
    savedRecords.fetching = false;
    savedRecords.trigger('fetching:error');
  });

export { savedRecords as default, Collection };
