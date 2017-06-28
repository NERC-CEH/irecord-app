/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 *****************************************************************************/
import $ from 'jquery';
import GPS from 'helpers/GPS';
import Log from 'helpers/log';
import LocHelp from 'helpers/location';
import appModel from 'app_model';

const extension = {
  startGPS(accuracyLimit) {
    Log('SampleModel:GPS: start.');

    const that = this;
    const options = {
      accuracyLimit,
      onUpdate(location) {
        that.trigger('geolocation', location);
        that.trigger('geolocation:update', location);
      },

      callback(error, loc) {
        let location = loc;
        extension.stopGPS.call(that, { silent: true });

        if (error) {
          that.trigger('geolocation', location);
          that.trigger('geolocation:error', location);
          return;
        }

        location.source = 'gps';
        location.updateTime = new Date(); // track when gps was acquired
        location.gridref = LocHelp.locationToGrid(location);

        // extend old location to preserve its previous attributes like name or id
        const oldLocation = that.get('location');
        location = $.extend(oldLocation, location);

        if (that.setGPSLocation) {
          if (that.setGPSLocation(location)) {
            that.trigger('change:location');
            that.trigger('geolocation', location);
            that.trigger('geolocation:success', location);
          }
          return;
        }

        that.trigger('change:location');
        that.trigger('geolocation', location);
        that.trigger('geolocation:success', location);
      },
    };

    this.locating = GPS.start(options);
    that.trigger('geolocation');
    that.trigger('geolocation:start');
  },

  stopGPS(options = {}) {
    Log('SampleModel:GPS: stop.');

    GPS.stop(this.locating);
    delete this.locating;

    if (!options.silent) {
      this.trigger('geolocation');
      this.trigger('geolocation:stop');
    }
  },

  isGPSRunning() {
    return this.locating || this.locating === 0;
  },

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.get('location') || {};
    return appModel.printLocation(location);
  },
};

export { extension as default };

