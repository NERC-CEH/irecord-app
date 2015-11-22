define(['jquery', 'morel', 'app-config'], function ($, morel, CONFIG) {
  $.extend(true, morel.Sample.keys, CONFIG.morel.sample);
  $.extend(true, morel.Occurrence.keys, CONFIG.morel.occurrence);

  let morelConfiguration = $.extend(CONFIG.morel.manager, {
    Storage: morel.DatabaseStorage
  });

  let manager = new morel.Manager(morelConfiguration);

  return manager;
});