/** ****************************************************************************
 * Some location transformation logic.
 *****************************************************************************/
import { LatLonEllipsoidal as LatLon, OsGridRef } from 'geodesy';
import Log from './log';
import GridRefUtils from './gridrefutils';

const helpers = {
  gridref_accuracy: {
    tetrad: 4, // 2km
    monad: 6, // 1km
    '100m': 8, // 100m
  },

  /**
   *
   * @param {type} location
   * @returns {string}
   */
  locationToGrid(location) {
    const normalisedPrecision = GridRefUtils.GridRefParser.get_normalized_precision(location.accuracy * 2); // accuracy is radius
    const nationaGridCoords = GridRefUtils.latlng_to_grid_coords(location.latitude, location.longitude);
    return nationaGridCoords.to_gridref(normalisedPrecision);
  },

  /**
   *
   * @param {object} location
   * @returns {Array} latlng pairs (SW, SE, NE, NW)
   */
  getSquareBounds(location) {
    if (location.latitude) {
      const gridRefString = helpers.locationToGrid(location);
      const parsedRef = GridRefUtils.GridRefParser.factory(gridRefString);

      if (parsedRef) {
        const nationalGridRefSW = parsedRef.osRef;
        return [
          nationalGridRefSW.to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x + parsedRef.length, nationalGridRefSW.y)).to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x + parsedRef.length, nationalGridRefSW.y + parsedRef.length)).to_latLng(),
          (new parsedRef.NationalRef(nationalGridRefSW.x, nationalGridRefSW.y + parsedRef.length)).to_latLng()
        ];
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {GridRefUtils.OSRef|null} SW corner of grid square
   */
  parseGrid(gridrefString) {
    const parser = GridRefUtils.GridRefParser.factory(gridrefString);
    return parser ? parser.osRef : null;
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {unresolved}
   */
  gridrefStringToLatLng(gridrefString) {
    try {
      const parsedRef = GridRefUtils.GridRefParser.factory(gridrefString);

      if (parsedRef) {
        return parsedRef.osRef.to_latLng();
      } else {
        return null;
      }
    } catch(e) {
      Log(e.message);
    }

    return null;
  },

  /**
   * 1 gridref digits. (10000m)  -> < 4 map zoom lvl
   * 2 gridref digits. (1000m)   -> 7
   * 3 gridref digits. (100m)    -> 10
   * 4 gridref digits. (10m)     -> 12
   * 5 gridref digits. (1m)      ->
   *
   * @return {int} radius in metres
   */
  mapZoomToMetreRadius(zoom) {
    let scale;
    if (zoom <= 4) {
      scale = 0;
    } else if (zoom <= 5) {
      Log('tetrad map scale');
      return 1000; // tetrad (radius is 1000m)
    } else if (zoom <= 7) {
      scale = 1;
    } else if (zoom <= 10) {
      scale = 2;
    } else if (zoom <= 12) {
      scale = 3;
    } else {
      scale = 4;
    }

    scale = 5000 / Math.pow(10, scale); // meters

    Log('map scale (radius): ' + scale);

    return scale < 1 ? 1 : scale;
  },

  /**
   *
   * @param {type} location
   * @returns {Boolean}
   */
  isInGB(location) {
    if (location.latitude && location.longiture) {
      const nationaGridCoords = GridRefUtils.latlng_to_grid_coords(location.latitude, location.longitude);
      return nationaGridCoords && nationaGridCoords.country === 'GB';
    }
    return false;
  },
};

export default helpers;
