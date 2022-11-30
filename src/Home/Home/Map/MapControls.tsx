import { FC, useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { IonIcon, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import { useToast } from '@flumens';
import GPS from 'helpers/GPS';
import L from 'leaflet';
import MapControl from 'Components/MapControl';

const DEFAULT_LOCATED_ZOOM = 18;

type Props = {
  map: L.Map;
};

type Location = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
};

const MapInfo: FC<Props> = ({ map }) => {
  const toast = useToast();
  const [locating, setLocating] = useState<any>(null);
  const [location, setLocation] = useState<Location | null>(null);

  const stopGPS = async () => {
    if (!locating) return;

    await GPS.stop(locating);
    setLocating(null);
  };

  useIonViewDidEnter(() => {
    const refreshMap = () => map.invalidateSize();
    map.whenReady(refreshMap);
  });

  useIonViewWillLeave(() => {
    if (locating) stopGPS();
  });

  useEffect(() => {
    if (!location) return;

    stopGPS();

    map.setView(
      new L.LatLng(location.latitude, location.longitude),
      DEFAULT_LOCATED_ZOOM
    );
  }, [location, setLocation]);

  const onGeolocate = async () => {
    if (locating) {
      stopGPS();
      return;
    }

    const callback = (error: any, loc: Location) => {
      if (error) throw error;

      setLocation(loc);
    };

    const locatingJobId = await GPS.start({ callback }).catch(toast.error);

    setLocating(locatingJobId);
  };

  return (
    <MapControl position="topleft" className="user-map-gps-button">
      <button
        className={`geolocate-btn ${locating ? 'spin' : ''}`}
        onClick={onGeolocate}
      >
        <IonIcon icon={locateOutline} mode="md" size="large" />
      </button>
    </MapControl>
  );
};

function withMap(Component: any) {
  return function WrappedComponent(props: any) {
    const map = useMap();
    return <Component {...props} map={map} />;
  };
}

export default withMap(MapInfo);
