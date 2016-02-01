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

  return new Morel.Manager(morelConfiguration);
});