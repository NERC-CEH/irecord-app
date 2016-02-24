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
    },

    /**
     * Set the record for submission and send it.
     */
    setToSend: function (callback) {
      this.metadata.saved = true;

      let invalids = this.validate();
      if (invalids) {
        this.metadata.saved = false;

        callback && callback(invalids);
        return;
      }

      //save record
      this.save(callback)
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

          location.source = 'gps';
          location.updateTime = new Date(); //track when gps was acquired
          location.gridref = LocHelp.coord2grid(location, location.accuracy);
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
      let location = this.get('location') || {};

      return appModel.printLocation(location);
    }
  };

  $.extend(true, Morel.Sample.prototype, GPSextension);

  return Sample;
});