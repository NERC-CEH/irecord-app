import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getGridSquareCenter,
  getSquareBounds,
  locationToGrid,
  type Location,
} from '@flumens';
import { useIonViewDidEnter } from '@ionic/react';
import type Sample from 'models/sample';
import mapHelpers from './map';
import './styles.scss';

const DEFAULT_CENTER: LatLngExpression = [53.7326306, -2];

type MapLocation = Partial<Location> & { updateTime?: number };

function getLocation(location: MapLocation, model: Sample): MapLocation {
  if (location.latitude !== undefined) return location;

  if (location.geocoded?.center) {
    return {
      latitude: location.geocoded.center[1],
      longitude: location.geocoded.center[0],
      accuracy: 500,
    };
  }

  return model.parent?.data.location || location;
}

function getCenter(
  location: MapLocation,
  defaultCenter: LatLngExpression
): LatLngExpression {
  if (location.latitude === undefined || location.longitude === undefined)
    return defaultCenter;

  if (location.gridref) {
    const gridCenter = getGridSquareCenter(location.gridref);
    if (gridCenter) return [gridCenter.lat, gridCenter.lng];
  }

  return [location.latitude, location.longitude];
}

const centerMap = (
  map: L.Map,
  location: MapLocation,
  model: Sample,
  defaultCenter: LatLngExpression,
  defaultZoom?: number
) => {
  const markerBounds = location.gridref
    ? getSquareBounds(location.gridref)
    : null;
  if (markerBounds) {
    map.fitBounds(markerBounds);
    return;
  }

  const center = getCenter(getLocation(location, model), defaultCenter);
  map.setView(center, defaultZoom);
};

type Props = {
  model: Sample;
  location: MapLocation;
  childLocations: Location[];
  setLocation: (model: Sample, location: Location) => void;
  onGPSClick?: () => void;
  onLayersClick?: () => void;
  onPastLocationsClick?: (() => void) | false;
};

const Map = ({
  model,
  location,
  childLocations,
  setLocation,
  onGPSClick,
  onLayersClick,
  onPastLocationsClick,
}: Props) => {
  const defaultZoom = undefined;
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    const mapInstance = L.map('map', { zoomControl: false }).setView(
      [51.505, -0.09],
      13
    );

    mapHelpers.init({
      onGPSClick,
      sample: model,
      map: mapInstance,
      onLayersClick,
      onPastLocationsClick: onPastLocationsClick || undefined,
    });

    centerMap(mapInstance, location, model, DEFAULT_CENTER, defaultZoom);
    setMap(mapInstance);

    setTimeout(() => mapInstance.invalidateSize(), 10);
  }, []);

  useEffect(() => mapHelpers.setCurrentLocation(location), [map, location]);

  const refreshMap = () => {
    map?.invalidateSize();
  };
  useIonViewDidEnter(refreshMap, [map]);

  useEffect(() => {
    window.addEventListener('ionKeyboardDidHide', refreshMap);
    return () => window.removeEventListener('ionKeyboardDidHide', refreshMap);
  });

  useEffect(() => {
    if (!map) return;

    centerMap(map, location, model, DEFAULT_CENTER, defaultZoom);
    mapHelpers.updateMapMarker(location);
  }, [
    map,
    location.updateTime,
    location.latitude,
    location.longitude,
    location.geocoded,
  ]);

  useEffect(() => {
    if (!map) return;

    childLocations.forEach(childLocation => {
      mapHelpers
        .generateCircleMarker(childLocation, false, {
          fillColor: '#00bd1a',
          color: 'white',
        })
        .addTo(map);
    });
  }, [map, childLocations]);

  useEffect(() => {
    if (!map) return;
    map.getContainer().classList.toggle('GPStracking', model.isGPSRunning());
  }, [map, model.gps.locating]);

  useEffect(() => {
    if (!map) return undefined;

    const onClick = (event: L.LeafletMouseEvent) => {
      const selectedLocation: Location = {
        latitude: Number(event.latlng.lat.toFixed(5)),
        longitude: Number(event.latlng.lng.toFixed(5)),
        source: 'map',
        accuracy: mapHelpers._mapZoomToMetres(mapHelpers.getMapZoom()),
      };
      selectedLocation.gridref = locationToGrid(selectedLocation);
      setLocation(model, selectedLocation);
    };

    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map]);

  return <div id="map" className="model-location-map" />;
};

export default observer(Map);
