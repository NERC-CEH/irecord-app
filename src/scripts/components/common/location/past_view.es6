define([
  'marionette'
], function (marionette) {

  return marionette.ItemView.extend({
    template: JST['common/location/past']
  });
});