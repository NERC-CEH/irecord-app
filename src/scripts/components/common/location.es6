/******************************************************************************
 * Some location transformation logic.
 *****************************************************************************/
define([], function () {
  var Module = {
    coord2grid: function (location, locationGranularity) {
      var p = new LatLon(location.latitude, location.longitude, LatLon.datum.WGS84);
      var grid = OsGridRef.latLonToOsGrid(p);

      return grid.toString(locationGranularity);
    },

    grid2coord: function (gridref) {
      gridref = OsGridRef.parse(gridref);
      gridref = normalizeGridRef(gridref);

      if (!isNaN(gridref.easting) && !isNaN(gridref.northing)) {
        return OsGridRef.osGridToLatLon(gridref, LatLon.datum.WGS84);
      }

      function normalizeGridRef(gridref) {
        // normalise to 1m grid, rounding up to centre of grid square:
        var e = gridref.easting;
        var n = gridref.northing;

        switch (gridref.easting.toString().length) {
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
    }
  };

  return Module;
});
