define([
  'jquery',
  'morel',
  'app-config',
  'common/sample'
], function ($, Morel, CONFIG, Sample) {
  let morelConfiguration = $.extend(CONFIG.morel.manager, {
    Storage: Morel.DatabaseStorage,
    Sample: Sample
  });

  //todo: make it more specific
  Morel.Collection.prototype.comparator = function (a, b) {
    return a.get('date') > b.get('date');
  };

  return new Morel.Manager(morelConfiguration);
});