import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { MapRef, ViewState } from 'react-map-gl';
import {
  isValidLocation,
  mapMetresToZoom,
  MapContainer,
  mapFlyToLocation,
  Location,
} from '@flumens';
import config from 'common/config';
import PastLocationsControl from './PastLocationsControl';

const getInitialView = (
  location: Location,
  parentLocation: Location
): Partial<ViewState> => {
  if (isValidLocation(location))
    return {
      zoom: mapMetresToZoom(location.accuracy) || 15,
      latitude: location.latitude,
      longitude: location.longitude,
    };

  if (isValidLocation(parentLocation))
    return {
      zoom: mapMetresToZoom(parentLocation.accuracy) || 13,
      latitude: parentLocation.latitude,
      longitude: parentLocation.longitude,
    };

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
  location: any;
  parentLocation: any;
  childLocations: any[];
  isDisabled: any;
  isLocating: any;
  onMapClick: any;
  onGPSClick: any;
  currentStyle: 'satellite' | 'os';
  onLayersClick: any;
  onPastLocationsClick: any;
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
    mapFlyToLocation(
      mapRef,
      isValidLocation(location) ? location : parentLocation || location // for location.geocoded
    );
  };
  useEffect(flyToLocation, [
    mapRef,
    location?.latitude,
    location?.longitude,
    location?.geocoded,
  ]);

  const style: any = {
    satellite: {
      maxZoom: 19,
      mapStyle: 'mapbox://styles/mapbox/satellite-streets-v11',
      maxBounds: null,
    },

    os: {
      maxZoom: 17,
      customAttribution:
        '&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
      mapStyle: `https://api.os.uk/maps/vector/v1/vts/resources/styles?key=${config.map.osApiKey}`,
      maxBounds: [
        [-8.834, 49.562], // Southwest
        [1.9, 60.934], // Northeast
      ] as any,
    },
  };

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

      <MapContainer.Marker
        parentGridref={parentLocation?.gridref}
        {...location}
      />

      {childLocationMarkers}
    </MapContainer>
  );
};

export default observer(MapboxContainer);
