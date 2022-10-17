import { Geolocation, Position } from '@capacitor/geolocation';

type Options = {
  callback: any;
  onUpdate?: any;
  accuracyLimit?: any;
};

const GPS_ACCURACY_LIMIT = 100; // meters

const API = {
  running: false,

  start({ callback, onUpdate, accuracyLimit = GPS_ACCURACY_LIMIT }: Options) {
    // geolocation config
    const GPSoptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 60000,
    };

    const onPosition = (position: Position | null, err: Error) => {
      if (err) {
        callback && callback(new Error(err.message));
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

export default API;
