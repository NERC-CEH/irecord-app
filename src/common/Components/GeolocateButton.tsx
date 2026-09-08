import {
  useMapFlyToCurrentLocation,
  MapContainer,
  type Location,
} from '@flumens';
import GPS from 'helpers/GPS';

const GPSWithSimplerCallback = {
  start: async (
    onPosition: (error: Error | null, location: Location) => void
  ) =>
    GPS.start({
      callback: (error, location) => onPosition(error, location as Location),
    }),
  stop: (processId: string | number) => GPS.stop(String(processId)),
};

const GeolocateButton = () => {
  const { isLocating, centerMapToCurrentLocation } = useMapFlyToCurrentLocation(
    GPSWithSimplerCallback
  );

  return (
    <MapContainer.Control.Geolocate
      isLocating={isLocating}
      onClick={centerMapToCurrentLocation}
    />
  );
};

export default GeolocateButton;
