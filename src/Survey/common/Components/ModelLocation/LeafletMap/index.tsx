import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getGridSquareCenter, getSquareBounds, locationToGrid } from '@flumens';
import { useIonViewDidEnter } from '@ionic/react';
import mapHelpers from './map';
import './styles.scss';

const DEFAULT_CENTER: LatLngExpression = [53.7326306, -2];

function getLocation(location: any, model: any) {
  const hasNoLocation = !location.latitude;

  const hasGeolocation = location.geocoded && location.geocoded.center;
  const useGeocodedLocation = hasNoLocation && hasGeolocation;
  if (useGeocodedLocation) {
    return {
      latitude: location.geocoded.center[1],
      longitude: location.geocoded.center[0],
      accuracy: 500,
    };
  }

  const useParentLocation = hasNoLocation && model.parent;
  if (useParentLocation) {
    return model.parent.data.location || {};
  }

  return location;
}

function getCenter(
  location: any,
  defaultCenter: LatLngExpression
): LatLngExpression {
  if (!location || !location.latitude) return defaultCenter;

  if (location.gridref) {
    const gridCenter = getGridSquareCenter(location.gridref);
    if (gridCenter?.lat && gridCenter?.lng) {
      return [gridCenter?.lat, gridCenter?.lng];
    }
  }

  return [location.latitude, location.longitude];
}

const centerMap = (
  map: any,
  location: any,
  model: any,
  defaultCenter: LatLngExpression,
  defaultZoom?: number
) => {
  const markerBounds = getSquareBounds(location?.gridref);
  if (markerBounds) {
    map.fitBounds(markerBounds);
  } else {
    const normalizedLocation = getLocation(location, model);
    const center = getCenter(normalizedLocation, defaultCenter);
    const zoom = defaultZoom; // || getZoom(normalizedLocation);
    map.setView(center, zoom);
  }
};

interface Props {
  model: any;
  location: any;
  childLocations: any[];
  setLocation: any;
  onGPSClick?: any;
  onLayersClick?: any;
  onPastLocationsClick?: any;
}

const Map = ({
  model,
  location,
  childLocations,
  setLocation,
  onGPSClick = null,
  onLayersClick = null,
  onPastLocationsClick = null,
}: Props) => {
  const defaultZoom = undefined;
  const [map, setMap] = useState<any>(null);

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
      onPastLocationsClick,
    });

    centerMap(mapInstance, location, model, DEFAULT_CENTER, defaultZoom);
    setMap(mapInstance);

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 10);
  }, []);

  const updateLocation = () => mapHelpers.setCurrentLocation(location);
  useEffect(updateLocation, [map, location.latitude, location.longitude]);

  const refreshMap = () => map && map.invalidateSize();
  useIonViewDidEnter(refreshMap, [map]);

  const refreshMapOnResize = () => {
    window.addEventListener('ionKeyboardDidHide', refreshMap);
    return () => {
      window.removeEventListener('ionKeyboardDidHide', refreshMap);
    };
  };
  useEffect(refreshMapOnResize);

  const centerMapAndMarker = () => {
    if (!map) return;

    centerMap(map, location, model, DEFAULT_CENTER, defaultZoom);
    mapHelpers.updateMapMarker(location, true);
  };
  useEffect(centerMapAndMarker, [
    map,
    location.updateTime,
    location.latitude,
    location.longitude,
    location.geocoded,
  ]);

  const addChildMarkers = () => {
    if (!map) return;

    const addChildMarker = (loc: Location) => {
      const marker = mapHelpers.generateCircleMarker(loc, false, {
        fillColor: '#00bd1a',
        color: 'white',
      });
      marker.addTo(map);
    };
    childLocations.map(addChildMarker);
  };
  useEffect(addChildMarkers, [map, childLocations]);

  const updateGPSState = () => {
    if (!map) return;
    map.getContainer().classList.toggle('GPStracking', model.isGPSRunning());
  };
  useEffect(updateGPSState, [map, model.gps.locating]);

  const onMapClick = () => {
    const onClick = (e: any) => {
      const selectedLocation: any = {
        latitude: parseFloat(e.latlng.lat.toFixed(5)),
        longitude: parseFloat(e.latlng.lng.toFixed(5)),
        source: 'map',
      };
      const zoom = mapHelpers.getMapZoom();
      selectedLocation.accuracy = mapHelpers._mapZoomToMetres(zoom);
      selectedLocation.gridref = locationToGrid(selectedLocation);

      setLocation(model, selectedLocation);
    };

    // using debouncedclick to fix map dragging/zooming and triggering a click
    const onClickHandler: any = { click: onClick };

    map?.on(onClickHandler);

    return () => map?.off(onClickHandler);
  };
  useEffect(onMapClick, [map]);

  return <div id="map" className="model-location-map" />;
};

export default observer(Map);
