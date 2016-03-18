/** ****************************************************************************
 * Some location transformation logic.
 *****************************************************************************/
import LatLon from '../../vendor/latlon/js/latlon-ellipsoidal';
import OsGridRef from '../../vendor/latlon/js/osgridref';

export default {
  coord2grid(location, locGran) {
    let locationGranularity = locGran;

    // adjust grid ref accuracy from gps accuracy
    if (location.source === 'gps') {
      /**
       * 1 gridref digits. (10000m)
       * 2 gridref digits. (1000m)
       * 3 gridref digits. (100m)
       * 4 gridref digits. (10m)
       * 5 gridref digits. (1m)
       */
      const digits = Math.log(location.accuracy) / Math.LN10;
      locationGranularity = 10 - digits * 2;
      locationGranularity = Number((locationGranularity).toFixed(0)); // round the float
    }

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

    const p = new LatLon(location.latitude, location.longitude, LatLon.datum.WGS84);
    const grid = OsGridRef.latLonToOsGrid(p);

    return grid.toString(locationGranularity).replace(/\s/g, '');
  },

  grid2coord(gridrefString) {
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

    if (!isNaN(gridref.easting) && !isNaN(gridref.northing)) {
      return OsGridRef.osGridToLatLon(gridref, LatLon.datum.WGS84);
    }

    return null;
  },

  mapZoom2meters(locationAccuracy) {
    let accuracy = locationAccuracy;
    // cannot be odd
    if (accuracy % 2 !== 0) {
      // should not be less than 2
      accuracy = accuracy === 1 ? accuracy + 1 : accuracy - 1;
    } else if (accuracy === 0) {
      accuracy = 2;
    }
    accuracy = 5000 / Math.pow(10, accuracy / 2); // meters
    return accuracy;
  },
};

