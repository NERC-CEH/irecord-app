define([
  'morel',
  'gps',
  'location',
  'app-config',
  'common/occurrence',
  'common/app_model'
], function (Morel, GPS, LocHelp, CONFIG, Occurrence, appModel) {
  $.extend(true, Morel.Sample.keys, CONFIG.morel.sample);

  let Sample = Morel.Sample.extend({
    Occurrence: Occurrence,

    validate: function() {
      let invalids = [];

      //todo: remove this bit once sample DB update is possible
      //check if saved
      if (!this.metadata.saved) {
        return true;
      }

      //location
      let location = this.get('location');
      if (!location || (!location.latitude || !location.longitude)) {
        invalids.push({
          sample: true,
          name: 'location',
          message: 'missing'
        });
      }

      //date
      let date = this.get('date');
      date = new Date(date);
      if (date == 'Invalid Date' || date > new Date()) {
        let message = (new Date(date) > new Date) ? 'future date': 'missing'
        invalids.push({
          sample: true,
          name: 'date',
          message: message
        });
      }

      this.occurrences.each(function (occurrence) {
        let occInvalids  = occurrence.validate();
        invalids.concat(occInvalids);
      });

      return invalids.length ? invalids : null;
    }
  });

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
          that.save();

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
          let accuracy = location.accuracy;

          //cannot be odd
          if (accuracy % 2 != 0) {
            //should not be less than 2
            accuracy = accuracy === 1 ? accuracy + 1 : accuracy - 1;
          }

          output = LocHelp.coord2grid(location, accuracy);
        } else {
          output =  location.latitude.toFixed(4) + ', ' + location.longitude.toFixed(4);
        }
      }
      return output;
    }
  };

  $.extend(true, Morel.Sample.prototype, GPSextension);

  return Sample;
});