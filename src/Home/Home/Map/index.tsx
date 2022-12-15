import { FC, useState, useEffect } from 'react';
import userModel from 'models/user';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { Trans as T } from 'react-i18next';
import Leaflet, { LatLngBounds, LatLngTuple, Map as LeafletMap } from 'leaflet';
import 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@flumens/ionic/dist/components/ModelLocationMap/Map/map/leaflet-mapbox-gl';
import { useToast, device } from '@flumens';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';
import { MapContainer } from 'react-leaflet';
import { isPlatform, IonSpinner } from '@ionic/react';
import CONFIG from 'common/config';
import MapControls from './MapControls';
import SquareMarker from './Components/SquareMarker';
import RecordMarker from './Components/RecordMarker';
import RecordProfiles from './Components/RecordProfiles';
import { fetchRecords, fetchSquares } from './recordsService';
import { Square, Record } from './esResponse.d';
import './styles.scss';

const DEFAULT_ZOOM = 5;
const DEFAULT_CENTER: LatLngTuple = [53.7326306, -2.6546124]; // UK center
const MapBoxAttribution =
  '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>';

const URL =
  'https://api.mapbox.com/styles/v1/cehapps/cipqvo0c0000jcknge1z28ejp/tiles/256/{z}/{x}/{y}?access_token={accessToken}';

/**
 * Returns square size in meters.
 */
const getSquareSize = (zoomLevel: number) => {
  if (zoomLevel < 10) return 10000;
  if (zoomLevel < 12) return 2000;

  return 1000;
};

const getTotalSquares = (squares: Square[]) => {
  const addSquares = (acc: number, square: Square): number =>
    acc + square.doc_count;

  // protection division from 0, defaulting to 1
  return squares?.reduce(addSquares, 0) || 1;
};

// https://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return (
      !!window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

const Map: FC = () => {
  const [map, setMap]: any = useState<LeafletMap>();
  const [isFetchingRecords, setFetchingRecords] = useState<any>(null);
  const toast = useToast();

  const [totalSquares, setTotalSquares] = useState<number>(1);
  const [squares, setSquares] = useState<Square[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

  const [showRecordsInfo, setShowRecordsInfo] = useState<Record[]>([]);
  const closeRecordInfo = () => setShowRecordsInfo([]);

  const userIsLoggedIn = userModel.isLoggedIn();

  const disableTapForIOS = !isPlatform('ios'); // TODO: https://github.com/Leaflet/Leaflet/issues/7255

  const assignRef = (mapRef: Leaflet.Map) => {
    const suppportsWebGL = hasWebGL();
    if (suppportsWebGL) {
      (Leaflet as any)
        .mapboxGL({
          accessToken: CONFIG.map.mapboxApiKey,
          style: 'mapbox://styles/mapbox/satellite-streets-v11',
          // eslint-disable-next-line
          // @ts-ignore
          attribution: MapBoxAttribution,
        })
        .addTo(mapRef);
    } else {
      Leaflet.tileLayer(URL, {
        attribution: MapBoxAttribution,
        accessToken: CONFIG.map.mapboxApiKey,
      }).addTo(mapRef);
    }

    setMap(mapRef);
  };

  const updateRecords = async () => {
    if (!map || !userIsLoggedIn || !device.isOnline) return;

    const bounds: LatLngBounds = map.getBounds().pad(0.5); // padding +50%

    const zoomLevel = map.getZoom();
    const northWest = bounds.getNorthWest();
    const southEast = bounds.getSouthEast();

    if (northWest.lat === southEast.lat) return; // first time the bounds can be flat

    const shouldFetchRecords = zoomLevel >= 14;
    if (shouldFetchRecords) {
      setFetchingRecords(true);
      const fetchedRecords = await fetchRecords(northWest, southEast).catch(
        toast.error
      );
      // Previous request was cancelled
      if (!fetchedRecords) return;
      setRecords(fetchedRecords);
      setSquares([]);
      setFetchingRecords(false);
      return;
    }

    const squareSize = getSquareSize(zoomLevel);

    setFetchingRecords(true);
    const fetchedSquares = await fetchSquares(
      northWest,
      southEast,
      squareSize
    ).catch(toast.error);
    // Previous request was cancelled
    if (!fetchedSquares) return;
    setRecords([]);

    setTotalSquares(getTotalSquares(fetchedSquares));
    setSquares(fetchedSquares);
    setFetchingRecords(false);
  };

  const attachMoveListener = (): any => {
    if (!map) return;

    map.on('moveend', updateRecords);

    // eslint-disable-next-line
    return () => map.off('moveend');
  };
  useEffect(attachMoveListener, [map]);

  const updateRecordsFirstTime = () => {
    updateRecords();
  };
  useEffect(updateRecordsFirstTime, [map]);

  const getRecordMarker = (record: Record) => (
    <RecordMarker
      key={record.id}
      record={record}
      onClick={setShowRecordsInfo}
    />
  );
  const getSquareMarker = (square: Square) => {
    const opacity = Number((square.doc_count / totalSquares).toFixed(2));

    // max 80%, min 20%
    const normalizedOpacity = Math.min(Math.max(opacity, 0.2), 0.8);

    return (
      <SquareMarker
        key={square.key}
        square={square}
        fillOpacity={normalizedOpacity}
      />
    );
  };

  return (
    <>
      <MapContainer
        id="map-user"
        whenCreated={assignRef}
        tap={disableTapForIOS}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        center={DEFAULT_CENTER}
        minZoom={5}
        maxZoom={18}
      >
        {!userIsLoggedIn && (
          <div className="login-message">
            <T>
              You need to login to your{' '}
              <Link to="/user/login">iRecord account</Link> to be able to view
              the records.
            </T>
          </div>
        )}

        <MarkerClusterGroup
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={false}
          onClick={(e: any) => {
            const clusterRecords = e.layer
              .getAllChildMarkers()
              .map((m: any) => m.options.record);
            setShowRecordsInfo(clusterRecords);
          }}
        >
          {records.map(getRecordMarker)}
        </MarkerClusterGroup>

        {squares.map(getSquareMarker)}

        <MapControls />

        {isFetchingRecords && <IonSpinner />}
      </MapContainer>

      {!!showRecordsInfo?.length && (
        <RecordProfiles records={showRecordsInfo} onClose={closeRecordInfo} />
      )}
    </>
  );
};

export default observer(Map);
