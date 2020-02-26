/** ****************************************************************************
 * Indicia Sample geolocation functions.
 *
 * Sample geolocation events:
 * start, update, error, success, stop
 **************************************************************************** */
import GPS from 'helpers/GPS';
import Log from 'helpers/log';
import LocHelp from 'helpers/location';
import appModel from 'app_model';
import bigu from 'bigu';
import { observable } from 'mobx';

export function updateSampleLocation(sample, location) {
  return new Promise(resolve => {
    const newLocation = { ...location };
    newLocation.source = 'gps';
    newLocation.updateTime = new Date(); // track when gps was acquired
    newLocation.gridref = LocHelp.locationToGrid(newLocation);

    // extend old location to preserve its previous attributes like name or id
    const oldLocation = sample.attrs.location;
    const fullLocation = { ...oldLocation, ...newLocation };

    if (sample.setGPSLocation) {
      const locationIsUpdatedPromise = sample.setGPSLocation(fullLocation);
      if (locationIsUpdatedPromise) {
        locationIsUpdatedPromise.then(() => resolve(true));
      } else {
        resolve(false);
      }
      return;
    }

    sample.attrs.location = fullLocation;
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

    if (this.gps.locating) {
      return;
    }

    // eslint-disable-next-line
    const options = {
      accuracyLimit,

      callback: (error, location) => {
        this.stopGPS({ silent: true });

        if (error) {
          return;
        }

        updateSampleLocation(this, location).catch(() => {
          // TODO: return err
        });
      },
    };

    this.gps.locating = GPS.start(options);
  },

  stopGPS() {
    Log('SampleModel:GPS: stop.');

    GPS.stop(this.gps.locating);
    this.gps.locating = null;
  },

  isGPSRunning() {
    return !!(this.gps.locating || this.gps.locating === 0);
  },

  /**
   * Print pretty location.
   * @returns {string}
   */
  printLocation() {
    const location = this.attrs.location || {};
    return appModel.printLocation(location);
  },

  _setGPSlocationSetter() {
    const isNotPlantSurvey = this.metadata.complex_survey !== 'plant';
    if (isNotPlantSurvey) {
      return;
    }

    // modify GPS service
    this.setGPSLocation = location => {
      // child samples
      if (this.parent) {
        this.attrs.location = location;
        return this.save();
      }

      const { gridSquareUnit } = this.metadata;
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

      this.attrs.location = location;
      return this.save();
    };
  },
};

export { extension as default };
