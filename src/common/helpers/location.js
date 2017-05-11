/** ****************************************************************************
 * Some location transformation logic.
 *****************************************************************************/
import { LatLonEllipsoidal as LatLon, OsGridRef } from 'geodesy';

const helpers = {
  gridref_accuracy: {
    tetrad: 4, // 2km
    monad: 6, // 1km
    '100m': 8, // 100m
  },

  coord2grid(location) {
    const locationGranularity = helpers._getGRgranularity(location);

    const p = new LatLon(location.latitude, location.longitude, LatLon.datum.WGS84);
    const grid = OsGridRef.latLonToOsGrid(p);

    return grid.toString(locationGranularity).replace(/\s/g, '');
  },

  parseGrid(gridrefString) {
    function normalizeGridRef(incorrectGridref) {
      // normalise to 1m grid, rounding up to centre of grid square:
      let e = incorrectGridref.easting;
      let n = incorrectGridref.northing;

      switch (incorrectGridref.easting.toString().length) {
        case 1: e += '50000'; n += '50000'; break;
        case 2: e += '5000'; n += '5000'; break;
        case 3: e += '500'; n += '500'; break;
        case 4: e += '50'; n += '50'; break;
        case 5: e += '5'; n += '5'; break;
        case 6: break; // 10-digit refs are already 1m
        default: return new OsGridRef(NaN, NaN);
      }
      return new OsGridRef(e, n);
    }

    let gridref = OsGridRef.parse(gridrefString);
    gridref = normalizeGridRef(gridref);

    return gridref;
  },

  grid2coord(gridrefString) {
    const gridref = helpers.parseGrid(gridrefString);
    if (!isNaN(gridref.easting) && !isNaN(gridref.northing)) {
      return OsGridRef.osGridToLatLon(gridref, LatLon.datum.WGS84);
    }

    return null;
  },

  /**
   * 1 gridref digits. (10000m)  -> < 4 map zoom lvl
   * 2 gridref digits. (1000m)   -> 7
   * 3 gridref digits. (100m)    -> 10
   * 4 gridref digits. (10m)     -> 12
   * 5 gridref digits. (1m)      ->
   */
  mapZoom2meters(accuracy) {
    let updated = accuracy;
    if (updated <= 4) {
      updated = 0;
    } else if (updated <= 7) {
      updated = 1;
    } else if (updated <= 10) {
      updated = 2;
    } else if (updated <= 12) {
      updated = 3;
    } else {
      updated = 4;
    }

    updated = 5000 / Math.pow(10, updated); // meters
    return updated < 1 ? 1 : updated;
  },

  /**
   * 1 gridref digits. (10000m)
   * 2 gridref digits. (1000m)
   * 3 gridref digits. (100m)
   * 4 gridref digits. (10m)
   * 5 gridref digits. (1m)
   */
  _getGRgranularity(location) {
    let locationGranularity;
    let accuracy = location.accuracy;

    // don't need to recalculate if exists
    if (location.source === 'gridref') {
      return accuracy;
    }

    // normalize to meters
    if (location.source === 'map') {
      accuracy = helpers.mapZoom2meters(accuracy);
    }

    // calculate granularity
    const digits = Math.log(accuracy) / Math.LN10;
    locationGranularity = 10 - (digits * 2); // MAX GR ACC -
    locationGranularity = Number((locationGranularity).toFixed(0)); // round the float

    // normalize granularity
    // cannot be odd
    if (locationGranularity % 2 !== 0) {
      // should not be less than 2
      locationGranularity =
        locationGranularity === 1 ? locationGranularity + 1 : locationGranularity - 1;
    }

    if (locationGranularity > 10) {
      // no more than 10 digits
      locationGranularity = 10;
    } else if (locationGranularity < 2) {
      // no less than 2
      locationGranularity = 2;
    }
    return locationGranularity;
  },

  isInUK(location) {
    if (!location.latitude || !location.longitude) return null;

    let gridref = location.gridref;
    if (!gridref) {
      gridref = helpers.coord2grid(location);
    }

    if (gridref) return true;

    return false;
  },
};

export default helpers;
