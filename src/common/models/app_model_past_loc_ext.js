/** ****************************************************************************
 * App Model past locations functions.
 *****************************************************************************/
import _ from 'lodash';
import UUID from 'helpers/UUID';
import Log from 'helpers/log';
import LocHelp from 'helpers/location';

const MAX_SAVED = 100;

export default {
  /**
   * Saves device location.
   *
   * @param location
   */
  setLocation(origLocation = {}) {
    Log('AppModel:PastLocations: setting.');
    const location = _.cloneDeep(origLocation);
    const locations = this.get('locations');

    if (!location.latitude || !location.longitude) {
      return null;
    }

    // update existing
    const existingLocationIndex = this._locationIndex(location);
    if (existingLocationIndex >= 0) {
      locations.splice(existingLocationIndex, 1, location);
      this.trigger('change:locations');
      this.save();

      return location;
    }

    // check if not duplicating existing location without id
    let duplication = false;
    locations.forEach((loc) => {
      if (this._isIdentical(loc, location)) {
        duplication = true;
      }
    });
    if (duplication) {
      return null;
    }

    // add new one
    location.id = UUID();
    locations.splice(0, 0, location);

    // check if not exceeded limits
    if (locations.length > MAX_SAVED) locations.pop(); // remove old one

    this.set('locations', locations);
    this.trigger('change:locations');
    this.save();

    return location;
  },

  removeLocation(location = {}) {
    Log('AppModel:PastLocations: removing.');

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

    return location;
  },

  _isIdentical(loc, location) {
    return loc.name === location.name &&
      loc.latitude === location.latitude &&
      loc.longitude === location.longitude;
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
