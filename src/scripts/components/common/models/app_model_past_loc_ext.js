/** ****************************************************************************
 * App Model past locations functions.
 *****************************************************************************/
import _ from 'lodash';
import UUID from '../../../helpers/UUID';
import LocHelp from '../../../helpers/location';

export default {
  /**
   * Saves device location.
   *
   * @param location
   */
  setLocation(origLocation = {}) {
    const location = _.cloneDeep(origLocation);
    const locations = this.get('locations');

    if (!location.latitude || !location.longitude) {
      return null;
    }

    // update existing
    const existingLocationIndex = this._locationIndex(location);
    if (existingLocationIndex >= 0) {
      locations.splice(existingLocationIndex, 0, location);
      this.trigger('change:locations');
      this.save();

      return null;
    }

    // add new one
    location.id = UUID();
    locations.splice(0, 0, location);

    this.set('locations', locations);
    this.trigger('change:locations');
    this.save();
    return location.id;
  },

  removeLocation(location = {}) {
    const that = this;
    const locations = this.get('locations');

    locations.forEach((loc, i) => {
      if (loc.id === location.id) {
        locations.splice(i, 1);
      }
    });
    that.set('locations', locations);
    that.trigger('change:locations');
    that.save();
  },

  _locationIndex(location = {}) {
    const locations = this.get('locations');
    let index = -1;
    locations.forEach((loc, i) => {
      if (loc.id === location.id) {
        index = i;
      }
    });
    return index;
  },

  /**
   * Returns device location as Grid Reference.
   *
   * @param geoloc
   * @returns {*}
   */
  getLocationSref(location) {
    const LOCATION_GRANULARITY = 2; // Precision of returned grid reference (6 digits = metres).

    const loc = location || this.get('locations')[0];
    if (!location) {
      return null;
    }

    // get translated location
    const gref = LocHelp.coord2grid(loc, LOCATION_GRANULARITY);

    // remove the spaces
    return gref.replace(/ /g, '');
  },

  printLocation(location) {
    const useGridRef = this.get('useGridRef');

    if (location.latitude && location.longitude) {
      if (useGridRef || location.source === 'gridref') {
        let accuracy = location.accuracy;

        // cannot be odd
        if (accuracy % 2 !== 0) {
          // should not be less than 2
          accuracy = accuracy === 1 ? accuracy + 1 : accuracy - 1;
        } else if (accuracy === 0) {
          accuracy = 2;
        }

        // check if location is within UK
        let prettyLocation = LocHelp.coord2grid(location, accuracy);
        if (!prettyLocation) {
          prettyLocation = `${parseFloat(location.latitude).toFixed(4)}, ${
            parseFloat(location.longitude).toFixed(4)}`;
        }
        return prettyLocation;
      }
      return `${parseFloat(location.latitude).toFixed(4)}, ${
        parseFloat(location.longitude).toFixed(4)}`;
    }
    return '';
  },
};
