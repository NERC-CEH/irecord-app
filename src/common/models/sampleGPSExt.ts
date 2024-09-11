import { observable } from 'mobx';
import { updateModelLocation } from '@flumens';
import GPS from 'helpers/GPS';

export type LatLng = [number, number];

export type Location = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

const DEFAULT_ACCURACY_LIMIT = 50; // meters

type Extension = {
  gps: { locating: null | string };
  startGPS: any;
  stopGPS: any;
  isGPSRunning: any;
  attrs?: any;
  save?: any;
};

const extension = (): Extension => ({
  gps: observable({ locating: null }),

  async startGPS(accuracyLimit = DEFAULT_ACCURACY_LIMIT) {
    if (this.gps.locating) return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const options = {
      accuracyLimit,

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onUpdate() {},

      callback(error: Error, location: Location) {
        if (error) {
          that.stopGPS();
          return;
        }
        if (location.accuracy <= options.accuracyLimit) {
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

export { extension as default };
