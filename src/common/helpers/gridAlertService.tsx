import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { locationToGrid } from '@flumens';
import { isPlatform } from '@ionic/core';
import appModel from 'models/app';
import GPS from 'helpers/GPS';

const getSquare = (location: Location) =>
  locationToGrid({
    ...location,
    accuracy: appModel.attrs.gridSquareUnit === 'monad' ? 500 : 1000, // tetrad otherwise
  });

type Location = any;

const showGridChangeAlert = (alert: any, newLocation: Location) => {
  if (!newLocation.gridref) {
    console.warn('No gridref in grid alert');
    return;
  }

  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Medium });

  const { gridSquareUnit, useGridNotifications } = appModel.attrs;

  const userSwitchNotificationsOff = !useGridNotifications;
  if (userSwitchNotificationsOff) return;

  alert({
    header: `Your ${gridSquareUnit} changed to:`,
    cssClass: 'grid-square-alert',
    message: <h1>{newLocation.gridref}</h1>,
    buttons: [{ text: 'OK' }],
  });
};

let runnerId = '';
const clientIds: string[] = [];

let lastGridref = '';

const service = {
  async start(clientId: string, alert: any) {
    if (!alert) throw new Error('Grid notifications alert object is missing.');

    if (clientIds.includes(clientId)) {
      console.warn('GridAlertService: client already locating.');
      return;
    }

    const otherClientLocating = clientIds.length;
    clientIds.push(clientId);

    if (otherClientLocating) return;

    console.log('GridAlertService: start.');

    // eslint-disable-next-line
    const options = {
      accuracyLimit: 100, // meters

      callback(error: Error, loc: Location) {
        if (error) {
          console.error(error);
          service.stop();
          return;
        }

        const currentGridref = getSquare(loc);
        const location = { ...{ gridref: currentGridref }, ...loc };

        // no change, only first time set up
        if (!lastGridref) {
          lastGridref = currentGridref;
          return;
        }

        // check if square has changes
        if (lastGridref !== currentGridref) {
          lastGridref = currentGridref;
          showGridChangeAlert(alert, location);
        }
      },
    };

    runnerId = await GPS.start(options);
  },

  stop(clientId?: string) {
    if (!clientIds.length) return;

    if (!clientId) {
      clientIds.splice(0, clientIds.length);
    } else {
      const clientIndex = clientIds?.indexOf(clientId);
      if (clientIndex > -1) clientIds.splice(clientIndex!, 1);
    }

    if (clientIds.length) return;

    console.log('GridAlertService: stop.');

    GPS.stop(runnerId);
    runnerId = '';
    lastGridref = '';
  },
};

export default service;
