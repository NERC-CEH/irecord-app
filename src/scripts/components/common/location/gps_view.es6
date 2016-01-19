define([
  'marionette',
  'JST'
], function (marionette, JST) {

  return marionette.ItemView.extend({
    initialize: function () {
      let that = this;
      let recordModel = this.model.get('record');

      this.template = function () {
        if (recordModel.locating) {
          return JST['common/location/gps_running'](arguments[0]);
        };

        let location = recordModel.get('location');
        //only gps and todays records
        if (location && location.gps &&
          (location.updateTime.toDateString() === new Date().toDateString())) {
          return JST['common/location/gps_success'](arguments[0]);
        } else {
          return JST['common/location/gps'](arguments[0]);
        }
      };

      this.listenTo(recordModel, 'geolocation:start geolocation:stop geolocation:error', this.render);
      this.listenTo(recordModel, 'geolocation:update', this.geolocationUpdate);
      this.listenTo(recordModel, 'geolocation:success', this.geolocationSuccess);
    },

    triggers: {
      'click #gps-button': 'gps:click'
    },

    geolocationUpdate: function (location) {
      this.locationUpdate = location;
      this.render();
    },

    geolocationSuccess: function (location) {
      this.locationSuccess = location;
      this.render();
    },

    serializeData: function () {
      let recordModel = this.model.get('record');
      let location = this.locationUpdate || recordModel.get('location');

      if (location) {
        return {
          accuracy: location.accuracy,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyLimit: 100 //TODO: get from GPS
        };
      }
    }
  });
});