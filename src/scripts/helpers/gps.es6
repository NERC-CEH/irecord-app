define([
  'jquery',
  'helpers/error',
  'morel'
], function ($, Error, morel) {

  let API = {
    GPS_ACCURACY_LIMIT: 100, //meters
    TIMEOUT: 120000,

    running: false,

    start: function (options = {}) {
      // Early return if geolocation not supported.
      if (!navigator.geolocation) {
        var error = new Error('Geolocation is not supported.');
        callback && callback(error);
        return;
      }

      let onUpdate = options.onUpdate;
      let callback = options.callback;
      let accuracyLimit = options.accuracyLimit || API.GPS_ACCURACY_LIMIT;

      //geolocation config
      let GPSoptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: API.TIMEOUT
      };

      var onSuccess = function (position) {
        var location = {
          'latitude': position.coords.latitude,
          'longitude': position.coords.longitude,
          'accuracy': position.coords.accuracy
        };

        if (location.accuracy <= accuracyLimit) {
          callback && callback(null, location);
        } else {
          onUpdate && onUpdate(location);
        }
      };

      //Callback if geolocation fails
      var onError = function (err) {
        var error = new Error(err.message);
        callback && callback(error);
      };

      let watchID = navigator.geolocation.watchPosition(onSuccess, onError, GPSoptions);
      return watchID
    },

    stop: function (id) {
      navigator.geolocation.clearWatch(id);
    }
  };

  return API;
});