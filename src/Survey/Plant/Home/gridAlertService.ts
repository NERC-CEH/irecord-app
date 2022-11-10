import GPS from 'helpers/GPS';
import { locationToGrid } from '@flumens';
import appModel from 'models/app';

const getSquare = (location: Location) =>
  locationToGrid({
    ...location,
    accuracy: appModel.attrs.gridSquareUnit === 'monad' ? 500 : 1000, // tetrad otherwise
  });

type Location = any;

const service: any = {
  locating: null,
  gridref: '',

  async start(callback: any) {
    console.log('GridAlertService: start.');

    if (this.locating) {
      console.warn('GridAlertService:GPS: already locating.');
      return;
    }

    // eslint-disable-next-line
    const options = {
      accuracyLimit: 100, // meters

      callback(error: Error, loc: Location) {
        if (error) {
          console.error(error);
          service.stop();
          return;
        }

        const gridref = getSquare(loc);
        const location = { ...{ gridref }, ...loc };

        // no change, only first time set up
        if (!service.gridref) {
          service.gridref = gridref;
          return;
        }

        // check if square has changes
        if (service.gridref !== gridref) {
          service.gridref = gridref;
          callback(location);
        }
      },
    };

    service.locating = await GPS.start(options);
  },

  stop() {
    console.log('GridAlertService: stop.');

    GPS.stop(service.locating);
    service.locating = null;
    service.gridref = '';
  },

  isRunning() {
    return service.locating || service.locating === 0;
  },
};

export default service;
