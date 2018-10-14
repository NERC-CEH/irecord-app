/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 **************************************************************************** */
import $ from 'jquery';
import GPS from 'helpers/GPS';
import Log from 'helpers/log';
import LocHelp from 'helpers/location';
import appModel from 'app_model';

export function updateSampleLocation(sample, location) {
  return new Promise(resolve => {
    const newLocation = Object.assign({}, location);
    newLocation.source = 'gps';
    newLocation.updateTime = new Date(); // track when gps was acquired
    newLocation.gridref = LocHelp.locationToGrid(newLocation);

    // extend old location to preserve its previous attributes like name or id
    const oldLocation = sample.get('location');
    const fullLocation = $.extend(oldLocation, newLocation);

    if (sample.setGPSLocation) {
      const locationIsUpdatedPromise = sample.setGPSLocation(fullLocation);
      if (locationIsUpdatedPromise) {
        locationIsUpdatedPromise.then(() => resolve(true));
      } else {
        resolve(false);
      }
      return;
    }

    sample.set('location', fullLocation);
    sample.save().then(() => resolve(true));
  });
}

const extension = {
  startGPS(accuracyLimit) {
    Log('SampleModel:GPS: start.');

    // eslint-disable-next-line
    const that = this;
    const options = {
      accuracyLimit,

      onUpdate(location) {
        that.trigger('geolocation', location);
        that.trigger('geolocation:update', location);
      },

      callback(error, location) {
        extension.stopGPS.call(that, { silent: true });

        if (error) {
          that.trigger('geolocation', location);
          that.trigger('geolocation:error', location);
          return;
        }

        updateSampleLocation(that, location)
          .then(locationWasSet => {
            if (locationWasSet) {
              that.trigger('change:location');
              that.trigger('geolocation', location);
              that.trigger('geolocation:success', location);
            }
          })
          .catch(() => {
            // TODO: return err
            that.trigger('geolocation:error', location);
          });
      }
    };

    this.locating = GPS.start(options);
    this.trigger('geolocation');
    this.trigger('geolocation:start');
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
  }
};

export { extension as default };
