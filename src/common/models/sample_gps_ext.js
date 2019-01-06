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
import bigu from 'bigu';
import { observable } from 'mobx';

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
  gpsExtensionInit() {
    this.gps = observable({ locating: null });
    this._setGPSlocationSetter();
  },

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
      },
    };

    this.gps.locating = GPS.start(options);
    this.trigger('geolocation');
    this.trigger('geolocation:start');
  },

  stopGPS(options = {}) {
    Log('SampleModel:GPS: stop.');

    GPS.stop(this.gps.locating);
    this.gps.locating = null;

    if (!options.silent) {
      this.trigger('geolocation');
      this.trigger('geolocation:stop');
    }
  },

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === 0);
  },

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.get('location') || {};
    return appModel.printLocation(location);
  },

  _setGPSlocationSetter() {
    if (!this.metadata.complex_survey) {
      return;
    }

    // modify GPS service
    this.setGPSLocation = location => {
      // child samples
      if (this.parent) {
        this.set('location', location);
        return this.save();
      }

      const gridSquareUnit = this.metadata.gridSquareUnit;
      const gridCoords = bigu.latlng_to_grid_coords(
        location.latitude,
        location.longitude
      );

      if (!gridCoords) {
        return null;
      }

      location.source = 'gridref'; // eslint-disable-line
      if (gridSquareUnit === 'monad') {
        // monad
        location.accuracy = 500; // eslint-disable-line

        gridCoords.x += (-gridCoords.x % 1000) + 500;
        gridCoords.y += (-gridCoords.y % 1000) + 500;
        location.gridref = gridCoords.to_gridref(1000); // eslint-disable-line
      } else {
        // tetrad
        location.accuracy = 1000; // eslint-disable-line

        gridCoords.x += (-gridCoords.x % 2000) + 1000;
        gridCoords.y += (-gridCoords.y % 2000) + 1000;
        location.gridref = gridCoords.to_gridref(2000); // eslint-disable-line
        location.accuracy = 1000; // eslint-disable-line
      }

      this.set('location', location);
      return this.save();
    };
  },
};

export { extension as default };
