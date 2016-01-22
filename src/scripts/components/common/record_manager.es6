define([
  'jquery',
  'morel',
  'gps',
  'location',
  'app-config',
  'common/app_model'
], function ($, Morel, GPS, LocHelp, CONFIG, appModel) {
  $.extend(true, Morel.Sample.keys, CONFIG.morel.sample);
  $.extend(true, Morel.Occurrence.keys, CONFIG.morel.occurrence);

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

      let useGridRef = appModel.get('useGridRef');

      let location = this.get('location') || {};
      if (location.latitude && location.longitude){
        if (useGridRef || location.source === 'gridref') {
          output = LocHelp.coord2grid(location, location.accuracy);
        } else {
          output =  location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
        }
      }
      return output;
    }
  };

  $.extend(true, Morel.Sample.prototype, GPSextension);

  ////add gps options
  //let OldSample = Morel.Sample;
  //Morel.Sample = Morel.Sample.extend({
  //  constructor: function() {
  //    this.gps = GPS;
  //    this.gps.sample = true;
  //
  //    OldSample.apply(this, arguments);
  //  }
  //});

  let morelConfiguration = $.extend(CONFIG.morel.manager, {
    Storage: Morel.DatabaseStorage
  });

  //todo: make it more specific
  Morel.Collection.prototype.comparator = function (a, b) {
    return a.get('date') > b.get('date');
  };

  let manager = new Morel.Manager(morelConfiguration);

  return manager;
});