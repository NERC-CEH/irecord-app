import { useMapFlyToCurrentLocation, MapContainer } from '@flumens';
import GPS from 'helpers/GPS';

const GPSWithSimplerCallback = {
  start: async (onPosition: any) => GPS.start({ callback: onPosition }),
  stop: (processId: any) => GPS.stop(processId),
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
