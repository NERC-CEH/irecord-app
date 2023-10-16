/** ****************************************************************************
 * App Model past locations functions.
 **************************************************************************** */
import { isValidLocation, locationToGrid, Location, hashCode } from '@flumens';

export const MAX_SAVED = 250;

type FullLocation = Location & {
  name?: string;
  id?: number;
  favourite?: boolean;
};

const extension: any = {
  async setLocation(origLocation: FullLocation, allowedMaxSaved = MAX_SAVED) {
    let locations: FullLocation[] = [...this.attrs.locations];
    const location = JSON.parse(JSON.stringify(origLocation));

    if (!isValidLocation(location)) throw new Error('invalid location');

    if (!location.name) return;

    const hash = this._getLocationHash(location);
    const byId = ({ id }: FullLocation) => id === hash;
    const existingLocation = locations.find(byId);
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

  async removeLocation(locationId: number) {
    const { locations } = this.attrs;

    this.attrs.locations = locations.filter(
      (loc: FullLocation) => loc.id !== locationId
    );
    await this.save();
  },

  _removeNonFavouriteBackwards(locations: FullLocation[]) {
    locations.reverse();
    const nonFavLocationIndex = locations.findIndex(
      (loc: FullLocation) => !loc.favourite
    );
    if (nonFavLocationIndex < 0) {
      return false;
    }

    locations.splice(nonFavLocationIndex, 1);
    locations.reverse();
    return true;
  },

  _getLocationHash({ latitude, longitude, gridref }: FullLocation) {
    const str = gridref || JSON.stringify({ latitude, longitude });
    return hashCode(str);
  },

  printLocation(location: FullLocation) {
    if (!isValidLocation(location)) return '';

    if (location.gridref) {
      let { accuracy } = location;

      // cannot be odd
      if (Number.isFinite(accuracy) && accuracy! % 2 !== 0) {
        // should not be less than 2
        accuracy = accuracy === 1 ? accuracy + 1 : accuracy! - 1;
      } else if (accuracy === 0) {
        accuracy = 2;
      }

      // check if location is within UK
      let prettyLocation = locationToGrid(location);
      if (!prettyLocation) {
        prettyLocation = `${parseFloat(location.latitude as any).toFixed(
          4
        )}, ${parseFloat(location.longitude as any).toFixed(4)}`;
      }

      return prettyLocation;
    }

    return `${parseFloat(location.latitude as any).toFixed(4)}, ${parseFloat(
      location.longitude as any
    ).toFixed(4)}`;
  },
};

export default extension;
