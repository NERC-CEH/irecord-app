/** ****************************************************************************
 * App Model past locations functions.
 **************************************************************************** */
import UUID from 'helpers/UUID';
import Log from 'helpers/log';
import LocHelp from 'helpers/location';

export const MAX_SAVED = 250;

export default {
  async setLocation(origLocation, allowedMaxSaved = MAX_SAVED) {
    Log('AppModel:PastLocations: setting.');
    let locations = [...this.attrs.locations];
    const location = { ...origLocation };
    if (!location.latitude) {
      throw new Error('invalid location');
    }

    const duplicate = locations.find(loc => this._isIdentical(loc, location));
    if (duplicate) {
      return duplicate;
    }

    // update existing
    const existingLocationIndex = locations.findIndex(
      loc => loc.id === location.id
    );
    if (existingLocationIndex >= 0) {
      locations[existingLocationIndex] = {
        ...locations[existingLocationIndex],
        ...location,
      };
      this.attrs.locations.replace(locations);
      await this.save();
      return location;
    }

    // add new one
    location.id = UUID();
    location.date = new Date();

    if (locations.length >= allowedMaxSaved) {
      const removed = this._removeNonFavouriteBackwards(locations);
      if (!removed) {
        return origLocation; // all favourites
      }
    }
    
    locations = [location, ...locations];
   
    this.attrs.locations.replace(locations);
    await this.save();
    return location;
  },

  async removeLocation(locationId) {
    Log('AppModel:PastLocations: removing.');

    const locations = this.get('locations');

    locations.forEach((loc, i) => {
      if (loc.id === locationId) {
        locations.splice(i, 1);
      }
    });
    this.set('locations', locations);
    await this.save();
    this.trigger('change:locations');
  },

  _removeNonFavouriteBackwards(locations) {
    locations.reverse();
    const nonFavLocationIndex = locations.findIndex(loc => !loc.favourite);
    if (nonFavLocationIndex < 0) {
      return false;
    }

    locations.splice(nonFavLocationIndex, 1);
    locations.reverse();
    return true;
  },

  _isIdentical(loc, location) {
    return (
      loc.name === location.name &&
      loc.latitude === location.latitude &&
      loc.longitude === location.longitude &&
      loc.favourite === location.favourite
    );
  },

  printLocation(location) {
    const useGridRef = this.get('useGridRef');

    if (location.latitude) {
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
        let prettyLocation = LocHelp.locationToGrid(location, accuracy);
        if (!prettyLocation) {
          prettyLocation = `${parseFloat(location.latitude).toFixed(
            4
          )}, ${parseFloat(location.longitude).toFixed(4)}`;
        }
        return prettyLocation;
      }
      return `${parseFloat(location.latitude).toFixed(4)}, ${parseFloat(
        location.longitude
      ).toFixed(4)}`;
    }
    return '';
  },
};
