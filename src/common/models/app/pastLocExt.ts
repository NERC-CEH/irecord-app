/** ****************************************************************************
 * App Model past locations functions.
 **************************************************************************** */
import { isValidLocation, Location, hashCode } from '@flumens';

export const MAX_SAVED = 250;

export type FullLocation = Location & {
  name?: string;
  id?: number;
  favourite?: boolean;
  date?: Date | string;
};

type ExtensionThis = {
  data: { locations: FullLocation[] };
  save: () => Promise<void>;
  setLocation: (
    location: FullLocation,
    allowedMaxSaved?: number
  ) => Promise<void>;
  removeLocation: (locationId: number) => Promise<void>;
  _removeNonFavouriteBackwards: (locations: FullLocation[]) => boolean;
  _getLocationHash: (location: FullLocation) => number;
};

const extension: ThisType<ExtensionThis> & {
  setLocation: ExtensionThis['setLocation'];
  removeLocation: ExtensionThis['removeLocation'];
  _removeNonFavouriteBackwards: ExtensionThis['_removeNonFavouriteBackwards'];
  _getLocationHash: ExtensionThis['_getLocationHash'];
} = {
  async setLocation(origLocation: FullLocation, allowedMaxSaved = MAX_SAVED) {
    let locations: FullLocation[] = [...this.data.locations];
    const location = structuredClone(origLocation);
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

    this.data.locations = locations;
    await this.save();
  },

  async removeLocation(locationId: number) {
    const { locations } = this.data;

    this.data.locations = locations.filter(
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
};

export default extension;
