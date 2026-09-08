import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import type { LngLatBoundsLike } from 'mapbox-gl';
import type { MapMouseEvent, MapRef, ViewState } from 'react-map-gl/mapbox';
import {
  mapMetresToZoom,
  MapContainer,
  mapFlyToLocation,
  type Location,
  useCallbackMapRefresh,
} from '@flumens';
import { useIonViewWillEnter } from '@ionic/react';
import config from 'common/config';
import { hasCoordinates } from 'common/helpers/location';
import PastLocationsControl from './PastLocationsControl';

const OS_MAX_BOUNDS: LngLatBoundsLike = [
  [-8.834, 49.562], // Southwest
  [1.9, 60.934], // Northeast
];

const style = {
  satellite: {
    mapStyle: 'mapbox://styles/mapbox/satellite-streets-v11',
  },
  os: {
    customAttribution:
      '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
    mapStyle: `https://api.os.uk/maps/vector/v1/vts/resources/styles?key=${config.map.osApiKey}`,
  },
};

const getInitialView = (
  location: Partial<Location>,
  parentLocation?: Partial<Location>
): Partial<ViewState> => {
  if (hasCoordinates(location))
    return {
      zoom: mapMetresToZoom(location.accuracy) || 15,
      latitude: location.latitude,
      longitude: location.longitude,
    };

  if (hasCoordinates(parentLocation)) {
    const parent = parentLocation;
    return {
      zoom: mapMetresToZoom(parent.accuracy) || 13,
      latitude: parent.latitude,
      longitude: parent.longitude,
    };
  }

  if (location.geocoded) {
    return {
      zoom: 10,
      longitude: location.geocoded.center[0],
      latitude: location.geocoded.center[1],
    };
  }

  return {};
};

type Props = {
  location: Partial<Location>;
  parentLocation?: Partial<Location>;
  childLocations: Location[];
  isDisabled: boolean;
  isLocating: boolean;
  onMapClick: (event: MapMouseEvent) => void;
  onGPSClick: () => void;
  currentStyle: 'satellite' | 'os';
  onLayersClick: () => void;
  onPastLocationsClick?: (() => void) | false;
};

const MapboxContainer = ({
  location,
  parentLocation,
  childLocations,
  isDisabled,
  onMapClick,
  currentStyle,
  onGPSClick,
  onLayersClick,
  onPastLocationsClick,
  isLocating,
}: Props) => {
  const [mapRef, setMapRef] = useState<MapRef>();
  const flyToLocation = () => {
    const target = hasCoordinates(location)
      ? location
      : parentLocation || location; // location may only have geocoded coordinates
    mapFlyToLocation(mapRef, target as Location);
  };
  useEffect(flyToLocation, [
    mapRef,
    location?.latitude,
    location?.longitude,
    location?.geocoded,
  ]);

  // set maxBounds imperatively to avoid react-map-gl's _updateSettings infinite loop
  // when maxBounds changes between styles
  useEffect(() => {
    const map = mapRef?.getMap();
    map?.setMaxBounds(currentStyle === 'os' ? OS_MAX_BOUNDS : null!);
  }, [mapRef, currentStyle]);

  const transformRequest = (url: string) =>
    url.startsWith('https://api.os.uk') ? { url: `${url}&srs=3857` } : { url };

  const childLocationMarkers = childLocations.map((loc: Location) => (
    <MapContainer.Marker.Circle
      id={`${loc.latitude}${loc.longitude}`}
      key={`${loc.latitude}${loc.longitude}`}
      {...loc}
      paint={{ 'circle-color': '#00bd1a', 'circle-stroke-color': 'white' }}
    />
  ));

  useCallbackMapRefresh(useIonViewWillEnter, mapRef);

  return (
    <MapContainer
      onReady={setMapRef}
      onClick={onMapClick}
      accessToken={config.map.mapboxApiKey}
      maxPitch={0}
      initialViewState={getInitialView(location, parentLocation)}
      transformRequest={transformRequest}
      {...style[currentStyle]}
    >
      {!isDisabled && onPastLocationsClick && (
        <PastLocationsControl onClick={onPastLocationsClick} />
      )}

      <MapContainer.Control.Geolocate
        isLocating={isLocating}
        onClick={onGPSClick}
      />

      <MapContainer.Control.Layers onClick={onLayersClick} />

      <MapContainer.OSGBGrid />

      {hasCoordinates(location) && (
        <MapContainer.Marker
          parentGridref={parentLocation?.gridref || undefined}
          {...location}
        />
      )}

      {childLocationMarkers}
    </MapContainer>
  );
};

export default observer(MapboxContainer);
