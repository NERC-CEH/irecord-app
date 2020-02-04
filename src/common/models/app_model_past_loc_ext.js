/** ****************************************************************************
 * App Model past locations functions.
 **************************************************************************** */
import Log from 'helpers/log';
import LocHelp from 'helpers/location';
import { hashCode } from 'helpers/UUID';

export const MAX_SAVED = 250;

export default {
  async setLocation(origLocation, allowedMaxSaved = MAX_SAVED) {
    Log('AppModel:PastLocations: setting.');
    let locations = [...this.attrs.locations];
    const location = JSON.parse(JSON.stringify(origLocation));

    if (!location.latitude) {
      throw new Error('invalid location');
    }

    if (!location.name) {
      return;
    }

    const hash = this._getLocationHash(location);

    const existingLocation = locations.find(({ id }) => id === hash);
    if (existingLocation) {
      existingLocation.name = location.name;
      existingLocation.favourite = location.favourite;
      await this.save();
      return;
    }

    // add new one
    location.id = hash;
    location.date = new Date();

    if (locations.length >= allowedMaxSaved) {
      const removed = this._removeNonFavouriteBackwards(locations);
      if (!removed) {
        return; // all favourites
      }
    }

    locations = [location, ...locations];

    this.attrs.locations = locations;
    await this.save();
  },

  async removeLocation(locationId) {
    Log('AppModel:PastLocations: removing.');

    const { locations } = this.attrs;

    this.attrs.locations = locations.filter(loc => loc.id !== locationId);
    await this.save();
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

  _getLocationHash({ latitude, longitude, gridref }) {
    const str = gridref || JSON.stringify({ latitude, longitude });
    return hashCode(str);
  },

  printLocation(location) {
    const { useGridRef } = this.attrs;

    if (location.latitude) {
      if (useGridRef || location.source === 'gridref') {
        let { accuracy } = location;

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
