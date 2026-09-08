import L from 'leaflet';
import { getSquareBounds, type Location } from '@flumens';
import type Sample from 'models/sample';

class ComplexMarker {
  constructor(
    public square: L.Polygon,
    public circle: L.Circle
  ) {}
}

type Marker = ComplexMarker | L.Circle | L.CircleMarker | L.Polygon;

export type MarkerExtension = {
  marker: Marker | null;
  addMapMarker: (sample: Sample) => void;
  updateMapMarker: (location: Partial<Location>) => void;
  addParentMarker: (sample: Sample) => void;
  _setNonGBMarker: (location: Location) => void;
  _setGBMarker: (location: Location) => void;
  generateRectangleMarker: (
    location: Partial<Location>,
    options?: L.PathOptions
  ) => L.Polygon;
  generateCircleMarker: (
    location: Location,
    isComplexMarker?: boolean,
    paint?: L.PathOptions
  ) => L.Circle | L.CircleMarker;
  _getCircleRadius: (location: Location) => number;
  _removeMapMarker: () => void;
};

type MarkerThis = MarkerExtension & {
  map: L.Map;
  _getCurrentLocation: () => Partial<Location>;
};

const marker: MarkerExtension & ThisType<MarkerThis> = {
  marker: null,

  addMapMarker(sample) {
    this.updateMapMarker(this._getCurrentLocation());
    this.addParentMarker(sample);
  },

  updateMapMarker(location) {
    this._removeMapMarker();
    if (location.latitude === undefined || location.longitude === undefined)
      return;

    if (!location.gridref) {
      this._setNonGBMarker(location as Location);
      return;
    }

    this._setGBMarker(location as Location);
  },

  addParentMarker(sample) {
    const location = sample.parent?.data.location;
    if (location?.latitude === undefined) return;

    this.generateRectangleMarker(location, {
      color: 'blue',
      fillOpacity: 0.01,
    }).addTo(this.map);
  },

  _setNonGBMarker(location) {
    this.marker = this.generateCircleMarker(location);
    this.marker.addTo(this.map);
  },

  _setGBMarker(location) {
    if (location.source === 'gps') {
      this.marker = new ComplexMarker(
        this.generateRectangleMarker(location),
        this.generateCircleMarker(location, true) as L.Circle
      );
      this.marker.square.addTo(this.map);
      this.marker.circle.addTo(this.map);
      return;
    }

    this.marker = this.generateRectangleMarker(location);
    this.marker.addTo(this.map);
  },

  generateRectangleMarker(location, options = {}) {
    const dimensions = (location.gridref &&
      getSquareBounds(location.gridref)) || [
      [0, 0],
      [0, 0],
    ];

    return L.polygon(dimensions, {
      color: options.color || 'red',
      weight: 2,
      opacity: 1,
      fillOpacity: options.fillOpacity || 0.2,
    });
  },

  generateCircleMarker(location, isComplexMarker, paint) {
    const latLng = L.latLng([location.latitude, location.longitude]);
    const options = {
      color: 'red',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
      ...paint,
    };

    return isComplexMarker
      ? L.circle(latLng, {
          radius: this._getCircleRadius(location),
          ...options,
        })
      : L.circleMarker(latLng, options);
  },

  _getCircleRadius(location) {
    return location.source === 'gps' ? location.accuracy || 10 : 10;
  },

  _removeMapMarker() {
    if (!this.marker) return;

    if (this.marker instanceof ComplexMarker) {
      this.map.removeLayer(this.marker.circle);
      this.map.removeLayer(this.marker.square);
      return;
    }

    this.map.removeLayer(this.marker);
    this.marker = null;
  },
};

export default marker;
