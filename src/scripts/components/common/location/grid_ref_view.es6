define([
  'marionette'
], function (marionette) {

  return marionette.ItemView.extend({
    template: JST['common/location/grid_ref']
  });
});