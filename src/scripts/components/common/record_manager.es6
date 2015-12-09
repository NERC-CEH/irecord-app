define(['jquery', 'morel', 'app-config'], function ($, morel, CONFIG) {
  $.extend(true, morel.Sample.keys, CONFIG.morel.sample);
  $.extend(true, morel.Occurrence.keys, CONFIG.morel.occurrence);

  let morelConfiguration = $.extend(CONFIG.morel.manager, {
    Storage: morel.DatabaseStorage
  });

  //todo: make it more specific
  morel.Collection.prototype.comparator = function (a, b) {
    return a.get('date') > b.get('date');
  };

  let manager = new morel.Manager(morelConfiguration);

  return manager;
});