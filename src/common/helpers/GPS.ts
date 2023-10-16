import { Geolocation, Position } from '@capacitor/geolocation';
import { HandledError } from '@flumens';
import { isPlatform } from '@ionic/core';

type Options = {
  callback: any;
  onUpdate?: any;
  accuracyLimit?: any;
};

const GPS_ACCURACY_LIMIT = 100; // meters

const API = {
  running: false,

  async start({
    callback,
    onUpdate,
    accuracyLimit = GPS_ACCURACY_LIMIT,
  }: Options) {
    // geolocation config
    const GPSoptions = {
      enableHighAccuracy: true,
    };

    if (isPlatform('hybrid')) {
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const newPermissions = await Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation'],
        });

        if (newPermissions.location !== 'granted') {
          throw new HandledError('Location permission was denied');
        }
      }
    }

    const onPosition = (position: Position | null, err: Error) => {
      if (err) {
        callback && callback(err);
        return;
      }

      if (!position) return;

      const location = {
        latitude: Number(position.coords.latitude.toFixed(8)),
        longitude: Number(position.coords.longitude.toFixed(8)),
        accuracy: Number(position.coords.accuracy.toFixed(0)),
        altitude: position.coords.altitude
          ? Number(position.coords.altitude.toFixed(0))
          : null,
        altitudeAccuracy: position.coords.altitudeAccuracy
          ? Number(position.coords.altitudeAccuracy.toFixed(0))
          : null,
      };

      if (location.accuracy <= accuracyLimit) {
        callback && callback(null, location);
      } else {
        onUpdate && onUpdate(location);
      }
    };

    return Geolocation.watchPosition(GPSoptions, onPosition);
  },

  stop(id: string) {
    Geolocation.clearWatch({ id });
  },
};

export const GPS_DISABLED_ERROR_MESSAGE = 'Location services are not enabled';

export async function hasGPSPermissions() {
  try {
    const permission = await Geolocation.checkPermissions();
    return permission?.location !== 'denied';
  } catch (err: any) {
    if (err?.message === GPS_DISABLED_ERROR_MESSAGE) return false;
  }

  return false;
}

export default API;
