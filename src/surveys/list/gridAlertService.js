import $ from 'jquery';
import GPS from 'helpers/GPS';
import Log from 'helpers/log';
import bigu from 'bigu';
import appModel from 'app_model';

const service = {
  start(callback) {
    if (this.locating) {
      Log('GridAtlasService:GPS: already locating.');
      return;
    }

    Log('GridAtlasService:GPS: start.');

    // eslint-disable-next-line
    const that = this;
    const options = {
      accuracyLimit: 100, // meters

      callback(error, loc) {
        if (error) {
          Log(error, 'e');
          service.stop();
          return;
        }

        const gridref = service._getSquare(loc);
        const location = $.extend({ gridref }, loc);

        // check if square has changes
        if (that.gridref !== gridref) {
          that.gridref = gridref;
          callback(location);
        }
      },
    };

    this.locating = GPS.start(options);
  },

  stop() {
    Log('GridAtlasService: stop.');

    GPS.stop(this.locating);
    delete this.gridref;
    delete this.locating;
  },

  isGPSRunning() {
    return this.locating || this.locating === 0;
  },

  _getSquare(location) {
    const gridCoords = bigu.latlng_to_grid_coords(
      location.latitude,
      location.longitude
    );

    if (!gridCoords) {
      return null;
    }

    const gridSquareUnit = appModel.get('gridSquareUnit');
    if (gridSquareUnit === 'monad') {
      return gridCoords.to_gridref(1000);
    }

    return gridCoords.to_gridref(2000);
  },
};

export default service;
