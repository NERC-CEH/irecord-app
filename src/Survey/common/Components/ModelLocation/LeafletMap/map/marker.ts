import L from 'leaflet';
import { getSquareBounds } from '@flumens';

class ComplexMarker {
  map: any;

  square: any;

  circle: any;

  constructor(square: any, circle: any) {
    this.square = square;
    this.circle = circle;
  }

  setLocation(location: any) {
    this.square.setLocation(location);
    this.circle.setLocation(location);
  }
}

const marker: any = {
  addMapMarker(sample: any) {
    this.updateMapMarker(this._getCurrentLocation(), true);
    this.addParentMarker(sample);
  },

  /**
   * Adds or updates existing map marker.
   * @param currentLocation
   */
  updateMapMarker(location: any) {
    // remove previous marker
    this._removeMapMarker();

    if (!location.latitude) return;

    if (!location.gridref) {
      // outside GB
      this._setNonGBMarker(location);
      return;
    }

    this._setGBMarker(location, true);
  },

  addParentMarker(sample: any) {
    if (sample.parent) {
      const location = sample.parent.data.location || {};
      if (location.latitude) {
        const parentMarker = this.generateRectangleMarker(location, {
          color: 'blue',
          fillOpacity: 0.01,
        });
        parentMarker.addTo(this.map);
      }
    }
  },

  _setNonGBMarker(location: any) {
    // point circle
    this.marker = this.generateCircleMarker(location);
    this.marker.addTo(this.map);
  },

  _setGBMarker(location: any) {
    // GPS sourced marker is both square and circle
    if (location.source === 'gps') {
      this.marker = new ComplexMarker(
        this.generateRectangleMarker(location),
        this.generateCircleMarker(location, true)
      );
      this.marker.square.addTo(this.map);
      this.marker.circle.addTo(this.map);
      return;
    }

    // create an orange rectangle
    this.marker = this.generateRectangleMarker(location);
    this.marker.addTo(this.map);
  },

  /**
   * Generates a polygon.
   * @param location
   * @returns {*}
   */
  generateRectangleMarker(location: any, options: any = {}) {
    const dimensions = getSquareBounds(location?.gridref) || [
      [0, 0],
      [0, 0],
    ];

    const newMarker = L.polygon(dimensions, {
      color: options.color || 'red',
      weight: 2,
      opacity: 1,
      fillOpacity: options.fillOpacity || 0.2,
    });

    return newMarker;
  },

  /**
   * Generates a circleMarker or circle if part of complexMarker.
   * @param location
   * @param isComplexMarker
   * @returns {*}
   */
  generateCircleMarker(location: any, isComplexMarker: any, paint: any) {
    const latLng = L.latLng([location.latitude, location.longitude]);

    const options = {
      color: 'red',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
      ...paint,
    };

    let newMarker;
    if (isComplexMarker) {
      const radius = marker._getCircleRadius(location);
      newMarker = L.circle(latLng, radius, options);
    } else {
      newMarker = L.circleMarker(latLng, options);
    }

    return newMarker;
  },

  /**
   * Returns a circle radius in meters from the location accuracy.
   * @param location
   * @returns {number}
   * @private
   */
  _getCircleRadius(location: any) {
    let radius = 10;
    if (location.source === 'gps') {
      radius = location.accuracy;
    }

    return radius;
  },

  /**
   * Removes the marker from the map.
   * @private
   */
  _removeMapMarker() {
    if (this.marker) {
      if (this.marker instanceof ComplexMarker) {
        this.map.removeLayer(this.marker.circle);
        this.map.removeLayer(this.marker.square);
        return;
      }

      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  },
};

export default marker;
