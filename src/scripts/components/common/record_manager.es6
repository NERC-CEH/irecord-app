define([
  'jquery',
  'morel',
  'app-config',
  'common/sample',
  'common/user_model'
], function ($, Morel, CONFIG, Sample, userModel) {
  let morelConfiguration = $.extend(CONFIG.morel.manager, {
    Storage: Morel.DatabaseStorage,
    Sample: Sample,
    onSend: function (sample) {
      userModel.appendSampleUser(sample);
    }
  });

  //todo: make it more specific
  Morel.Collection.prototype.comparator = function (a, b) {
    return a.get('date') > b.get('date');
  };
  
  _.extend(Morel.Manager.prototype, {
    removeAllSynced: function (callback) {
      this.getAll(function (err, records) {
        let toRemove = 0;
        let noneSaved = true;
        if (err) {
          return;
        }

        records.each(function (record) {
          if (record.getSyncStatus() === Morel.SYNCED) {
            noneSaved = false;
            toRemove++;
            record.destroy(function () {
              toRemove--;
              if (toRemove === 0) {
                callback && callback();
              }
            });
          }
        });

        if (noneSaved) {
          callback && callback();
        }
      });
    }
  });

  return new Morel.Manager(morelConfiguration);
});