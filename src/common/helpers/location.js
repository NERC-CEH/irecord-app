/** ****************************************************************************
 * Some location transformation logic.
 **************************************************************************** */
import bigu from 'bigu';
import Log from './log';

const helpers = {
  // grid ref character length
  gridref_accuracy: {
    tetrad: {
      label: 'Tetrad (2km square)',
      length: 5
    },
    monad: {
      label: 'Monad (1km square)',
      length: 6
    }
    // '100m': 8, // 100m
  },

  /**
   *
   * @param {type} location
   * @returns {string}
   */
  locationToGrid(location) {
    const gridCoords = bigu.latlng_to_grid_coords(
      location.latitude,
      location.longitude
    );

    if (!gridCoords) {
      return null;
    }

    const normAcc = bigu.GridRefParser.get_normalized_precision(
      location.accuracy * 2 // accuracy is radius
    );

    // Disabled because users 'want' higher precision rather correctness
    // if (location.source === 'gps') {
    //   return helpers.normalizeGridRefAcc(gridCoords, location, normAcc);
    // }

    return gridCoords.to_gridref(normAcc);
  },

  // /**
  //  * Returns a normalized grid square that takes into account the accuracy
  //  * of the location.
  //  +
  //  |        OK                Not OK
  //  |
  //  |   +------------+    +------------+
  //  |   |            |    |            |
  //  |   |   +------+ |    |            |
  //  |   |   |      | |    |            |
  //  |   |   |  XX  | |    |       +------+
  //  |   |   |      | |    |       |    | |
  //  |   |   +------+ |    |       |  XX| |
  //  |   +------------+    +------------+ |
  //  |                             +------+
  //  * @param gridCoords
  //  * @param location
  //  * @param normAcc
  //  * @returns {*}
  //  */
  // normalizeGridRefAcc(gridCoords, location, normAcc) {
  //   // NOTE: is buggy! returns null with GPS.update({gridRef:'TQ12B', accuracy:20, xCorrect:1})
  //
  //   // the location verges on the 10K square border and the accuracy
  //   // is poor enough then don't return any valid gridref
  //   if (normAcc >= 10000) {
  //     return null;
  //   }
  //
  //   if (helpers._doesExceedGridRef(gridCoords, location, normAcc)) {
  //     return helpers.normalizeGridRefAcc(gridCoords, location, normAcc * 10);
  //   }
  //
  //   return gridCoords.to_gridref(normAcc);
  // },

  /**
   * Checks if the location fits in the calculated grid reference square.
   * @private
   */
  _doesExceedGridRef(gridCoords, location, normAcc) {
    const accuracy = location.accuracy;

    const x = gridCoords.x;
    const y = gridCoords.y;

    if (x % normAcc - accuracy < 0) {
      return true;
    }

    if (x % normAcc + accuracy > normAcc) {
      return true;
    }

    if (y % normAcc - accuracy < 0) {
      return true;
    }

    if (y % normAcc + accuracy > normAcc) {
      return true;
    }

    return false;
  },

  /**
   *
   * @param {object} location
   * @returns {Array} latlng pairs (SW, SE, NE, NW)
   */
  getSquareBounds(location) {
    if (location.latitude) {
      const gridRefString = helpers.locationToGrid(location);
      const parsedRef = bigu.GridRefParser.factory(gridRefString);

      if (parsedRef) {
        const nationalGridRefSW = parsedRef.osRef;
        const a = new parsedRef.NationalRef(
          nationalGridRefSW.x + parsedRef.length,
          nationalGridRefSW.y
        ); // eslint-disable-line
        const b = new parsedRef.NationalRef(
          nationalGridRefSW.x + parsedRef.length,
          nationalGridRefSW.y + parsedRef.length
        ); // eslint-disable-line
        const c = new parsedRef.NationalRef(
          nationalGridRefSW.x,
          nationalGridRefSW.y + parsedRef.length
        ); // eslint-disable-line
        return [
          nationalGridRefSW.to_latLng(),
          a.to_latLng(),
          b.to_latLng(),
          c.to_latLng()
        ];
      }

      return null;
    }

    return null;
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {bigu.OSRef|null} SW corner of grid square
   */
  parseGrid(gridrefString) {
    let gridRef;
    const parser = bigu.GridRefParser.factory(gridrefString);

    if (parser) {
      // center gridref
      parser.osRef.x += parser.length / 2;
      parser.osRef.y += parser.length / 2;

      gridRef = parser.osRef;
    }

    return gridRef;
  },

  /**
   *
   * @param {string} gridrefString
   * @returns {unresolved}
   */
  gridrefStringToLatLng(gridrefString) {
    try {
      const parsedRef = bigu.GridRefParser.factory(gridrefString);
      if (parsedRef) {
        return parsedRef.osRef.to_latLng();
      }

      return null;
    } catch (e) {
      Log(e.message);
    }

    return null;
  },

  /**
   * Checks if the grid reference is valid and in GB land
   * @param gridrefString
   */
  isValidGridRef(gridrefString) {
    try {
      const parsedRef = bigu.GridRefParser.factory(gridrefString);
      if (parsedRef && bigu.MappingUtils.is_gb_hectad(parsedRef.hectad)) {
        return true;
      }

      return false;
    } catch (e) {
      Log(e.message);
    }

    return false;
  },

  /**
   *
   * @param {type} location
   * @returns {Boolean}
   */
  isInGB(location) {
    if (location.latitude) {
      const nationaGridCoords = bigu.latlng_to_grid_coords(
        location.latitude,
        location.longitude
      );
      if (!nationaGridCoords) {
        return false;
      }
      return nationaGridCoords.country === 'GB';
    }
    return false;
  },

  /**
   * Checks if location gridref size matches the provided one.
   * @param location
   * @param gridRefSize
   * @returns {boolean}
   */
  checkGridType(location, gridRefSize) {
    if (!gridRefSize) {
      return false;
    }

    const gridref = location.gridref || '';
    let length = helpers.gridref_accuracy[gridRefSize].length;

    if (/^.\d/.test(gridref)) {
      // Irish is 1 char less than others
      length -= 1;
    }

    return gridref.length === length;
  }
};

export default helpers;
