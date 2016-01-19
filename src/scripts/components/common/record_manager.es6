define([
  'jquery',
  'morel',
  'app-config',
  'common/user_model',
  'helpers/gps',
  'helpers/location'
], function ($, morel, CONFIG, userModel, GPS, locHelp) {
  $.extend(true, morel.Sample.keys, CONFIG.morel.sample);
  $.extend(true, morel.Occurrence.keys, CONFIG.morel.occurrence);

  /**
   *
   * Sample geolocation events:
   * start, update, error, success, stop
   */
  let GPSextension = {

    startGPS: function (accuracyLimit) {
      let that = this;
      let options = {
        accuracyLimit: accuracyLimit,
        onUpdate: function (location) {
          that.trigger('geolocation', location);
          that.trigger('geolocation:update', location);
        },

        callback: function (error, location) {
          GPSextension.stopGPS.call(that, {silent:true});

          if (error) {
            that.trigger('geolocation:error', location);
            return;
          }

          location.gps = true;
          location.updateTime = new Date(); //track when gps was acquired
          that.set('location', location);
          manager.set(that);

          that.trigger('change:location');
          that.trigger('geolocation', location);
          that.trigger('geolocation:success', location);
        }
      };

      this.locating = GPS.start(options);
      that.trigger('geolocation');
      that.trigger('geolocation:start');
    },

    stopGPS: function (options = {}) {
      GPS.stop(this.locating);
      delete this.locating;

      if (!options.silent) {
        this.trigger('geolocation');
        this.trigger('geolocation:stop');
      }
    },

    /**
     * Print pretty location.
     * @returns {string}
     */
    printLocation: function () {
      let output = '';

      let useGridRef = userModel.get('useGridRef');

      let location = this.get('location') || {};
      if (location.latitude && location.longitude){
        if (useGridRef || location.source === 'gridref') {
          output = locHelp.coord2grid(location, location.accuracy);
        } else {
          output =  location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
        }
      }
      return output;
    }
  };

  $.extend(true, morel.Sample.prototype, GPSextension);

  ////add gps options
  //let OldSample = morel.Sample;
  //morel.Sample = morel.Sample.extend({
  //  constructor: function() {
  //    this.gps = GPS;
  //    this.gps.sample = true;
  //
  //    OldSample.apply(this, arguments);
  //  }
  //});

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