define([
  'marionette',
  'JST'
], function (marionette, JST) {

  return marionette.ItemView.extend({
    template: JST['common/location/grid_ref']
  });
});