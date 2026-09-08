import { observable } from 'mobx';
import {
  updateModelLocation,
  type Location,
  type LocationModelLike,
} from '@flumens';
import GPS from 'helpers/GPS';

const DEFAULT_ACCURACY_LIMIT = 50; // meters

type ExtensionThis = LocationModelLike & {
  gps: { locating: null | string };
  stopGPS: () => void;
};

type Extension = {
  gps: { locating: null | string };
  startGPS: (accuracyLimit?: number) => Promise<void>;
  stopGPS: () => void;
  isGPSRunning: () => boolean;
};

const extension = (): Extension & ThisType<ExtensionThis> => ({
  gps: observable({ locating: null }),

  async startGPS(accuracyLimit = DEFAULT_ACCURACY_LIMIT) {
    if (this.gps.locating) return;
    const that = this;
    const options = {
      accuracyLimit,

      onUpdate() {},

      callback(error: Error | null, location?: Location) {
        if (error) {
          that.stopGPS();
          return;
        }
        if (!location) return;
        if ((location.accuracy ?? Infinity) <= options.accuracyLimit) {
          that.stopGPS();
        }

        updateModelLocation(that, location);
      },
    };

    this.gps.locating = await GPS.start(options);
  },

  stopGPS() {
    if (!this.gps.locating) return;

    GPS.stop(this.gps.locating);
    this.gps.locating = null;
  },

  isGPSRunning() {
    return !!this.gps.locating;
  },
});

export default extension;
