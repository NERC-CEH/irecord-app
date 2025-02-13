import { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Trans as T, useTranslation } from 'react-i18next';
import { MapRef, LngLatBounds } from 'react-map-gl/mapbox';
import { Link } from 'react-router-dom';
import {
  useToast,
  device,
  MapContainer,
  ElasticOccurrence,
  mapMetresToZoom,
} from '@flumens';
import { IonSpinner } from '@ionic/react';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import { groups as informalGroups } from 'common/data/informalGroups';
import userModel from 'models/user';
import MapFilters, { dateRanges, monthAgo } from './Filters';
import RecordProfiles from './RecordProfiles';
import { fetchRecords, fetchSquares, Square } from './recordsService';
import './styles.scss';

/**
 * Returns square size in meters.
 */
const getSquareSize = (zoomLevel: number) => {
  if (zoomLevel < 8) return 10000;
  if (zoomLevel < 10) return 2000;

  return 1000;
};

const getTotalSquares = (squares: Square[]) => {
  const addSquares = (acc: number, square: Square): number =>
    acc + square.doc_count;

  // protection division from 0, defaulting to 1
  return squares?.reduce(addSquares, 0) || 1;
};

const Map = () => {
  const { t } = useTranslation();
  const [mapRef, setMapRef] = useState<{ current?: MapRef }>({});
  const measuredRef = useCallback(
    (node: any) => node && setMapRef({ current: node }),
    []
  );

  const [isFetchingRecords, setFetchingRecords] = useState<any>(null);
  const toast = useToast();

  const [totalSquares, setTotalSquares] = useState<number>(1);
  const [squares, setSquares] = useState<Square[]>([]);
  const [records, setRecords] = useState<ElasticOccurrence[]>([]);

  const [startDate, setStartDate] = useState(monthAgo);
  const onStartDateSelect = (value: any) => setStartDate(value);

  const [speciesGroup, setSpeciesGroup] = useState('');
  const onSpeciesGroupSelect = (value: any) => setSpeciesGroup(value);
  const speciesGroupOptions = [
    { label: t('All species'), value: '' },

    ...Object.keys(informalGroups)
      .sort((a: string, b: string) =>
        t((informalGroups as any)[a]).localeCompare(
          t((informalGroups as any)[b])
        )
      )
      .map((id: string) => ({ value: id, label: (informalGroups as any)[id] })),
  ];

  const userIsLoggedIn = userModel.isLoggedIn();

  const updateRecords = async () => {
    if (
      !mapRef.current ||
      !userIsLoggedIn ||
      !userModel.attrs.verified ||
      !device.isOnline
    )
      return;

    const bounds: LngLatBounds = mapRef.current.getBounds()!; // TODO: .pad(0.5); // padding +50%

    const zoomLevel = mapRef.current.getZoom();
    const northWest = bounds.getNorthWest();
    const southEast = bounds.getSouthEast();

    if (northWest.lat === southEast.lat) return; // first time the bounds can be flat

    const shouldFetchRecords = zoomLevel >= 13;
    if (shouldFetchRecords) {
      setFetchingRecords(true);
      const fetchedRecords = await fetchRecords({
        northWest,
        southEast,
        startDate,
        speciesGroup,
      }).catch(toast.error);
      // Previous request was cancelled
      if (!fetchedRecords) return;
      setRecords(fetchedRecords);
      setSquares([]);
      setFetchingRecords(false);
      return;
    }

    const squareSize = getSquareSize(zoomLevel);

    setFetchingRecords(true);
    const fetchedSquares = await fetchSquares({
      northWest,
      southEast,
      squareSize,
      startDate,
      speciesGroup,
    }).catch(toast.error);

    // Previous request was cancelled
    if (!fetchedSquares) return;
    setRecords([]);

    setTotalSquares(getTotalSquares(fetchedSquares));
    setSquares(fetchedSquares);
    setFetchingRecords(false);
  };

  const updateMapCentre = () => updateRecords();

  useEffect(() => {
    updateRecords();
  }, [speciesGroup, startDate]);

  const [showRecordsInfo, setShowRecordsInfo] = useState<ElasticOccurrence[]>(
    []
  );
  const closeRecordInfo = () => setShowRecordsInfo([]);

  const updateRecordsFirstTime = () => {
    updateRecords();
  };
  useEffect(updateRecordsFirstTime, [mapRef]);

  const getRecordMarker = (record: ElasticOccurrence) => {
    const [latitude, longitude] = record.location.point
      .split(',')
      .map(parseFloat);

    let fillColor = '#fcb500';
    const status = record.identification.verification_status;
    if (status === 'V') {
      fillColor = '#00bd1a';
    } else if (status === 'R') {
      fillColor = '#f04141';
    }

    return (
      <MapContainer.Marker.Circle
        key={record.id}
        id={record.id}
        longitude={longitude}
        latitude={latitude}
        paint={{
          'circle-radius': 10,
          'circle-stroke-color': 'white',
          'circle-color': fillColor,
          'circle-opacity': 1,
        }}
        onClick={() => setShowRecordsInfo([record])}
      />
    );
  };
  const recordMarkers = records.map(getRecordMarker);

  const getSquareMarker = (square: Square) => {
    const opacity = Number((square.doc_count ** 1.8 / totalSquares).toFixed(2)); // pow of 1.8 to increase the difference between different square opacities

    const normalizedOpacity = Math.min(Math.max(opacity, 0.4), 0.7); // max 70%, min 40%

    const [longitude, latitude] = square.key.split(' ').map(parseFloat);

    const radius = square.size! / 2;
    const padding = 1.1; // extra padding between squares
    const metersToPixels =
      radius / padding / 0.075 / Math.cos((latitude * Math.PI) / 180);

    const zoomIn = () => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: mapMetresToZoom(square.size / 2) || mapRef.current.getZoom(),
        duration: 500,
      });
    };

    return (
      <MapContainer.Marker.Circle
        key={square.key}
        id={square.key}
        longitude={longitude}
        latitude={latitude}
        onClick={zoomIn}
        paint={{
          'circle-stroke-color': '#003265',
          'circle-stroke-width': 1,
          'circle-color': '#007dfa',
          'circle-opacity': normalizedOpacity,
          'circle-radius': [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            0,
            0,
            20,
            metersToPixels,
          ],
        }}
      />
    );
  };

  const squareMarkers = squares.map(getSquareMarker);

  let initialViewState;

  const transformRequest = (url: string) =>
    url.startsWith('https://api.os.uk') ? { url: `${url}&srs=3857` } : { url };

  return (
    <MapContainer
      id="user-records"
      ref={measuredRef}
      accessToken={config.map.mapboxApiKey}
      maxZoom={17}
      customAttribution='&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
      mapStyle={`https://api.os.uk/maps/vector/v1/vts/resources/styles?key=${config.map.osApiKey}`}
      maxBounds={
        [
          [-8.834, 49.562], // Southwest
          [1.9, 60.934], // Northeast
        ] as any
      }
      maxPitch={0}
      initialViewState={initialViewState}
      onMoveEnd={updateMapCentre}
      transformRequest={transformRequest}
    >
      <MapContainer.Control>
        <MapFilters>
          <div className="filters-column">
            <div className="filters-row">
              <MapFilters.Select
                options={dateRanges}
                onChange={onStartDateSelect}
                value={startDate}
              />
            </div>
          </div>
          <div className="filters-column">
            <div className="filters-row">
              <MapFilters.Select
                options={speciesGroupOptions}
                onChange={onSpeciesGroupSelect}
                value={speciesGroup}
              />
            </div>
          </div>
        </MapFilters>
      </MapContainer.Control>

      {!userIsLoggedIn && (
        <div className="login-message">
          <T>
            You need to <Link to="/user/login">login</Link> to your account to
            be able to view the records.
          </T>
        </div>
      )}

      <GeolocateButton />

      {squareMarkers}

      {recordMarkers}

      <MapContainer.Control>
        {isFetchingRecords ? <IonSpinner /> : <div />}
      </MapContainer.Control>

      {!!showRecordsInfo?.length && (
        <RecordProfiles records={showRecordsInfo} onClose={closeRecordInfo} />
      )}
    </MapContainer>
  );
};

export default observer(Map);
