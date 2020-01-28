import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import L from 'leaflet';
import './leaflet_singleclick_ext';

class ComplexMarker {
  constructor(square, circle) {
    this.square = square;
    this.circle = circle;
  }

  setLocation(location) {
    this.square.setLocation(location);
    this.circle.setLocation(location);
  }
}

const marker = {
  addMapMarker(sample, onClick, appModel) {
    this.map.on('singleclick', (e) => this._onMapClick(e, onClick), this);
    this.updateMapMarker(this._getCurrentLocation(), appModel);
    this.addParentMarker(sample);
  },

  /**
   * Adds or updates existing map marker.
   * @param currentLocation
   */
  updateMapMarker(location, appModel) {
    if (!location.latitude) {
      return;
    }

    Log('Common:Location:Map view: updating map marker.');

    // remove previous marker
    this._removeMapMarker();

    if (!location.gridref) {
      // outside GB
      this._setNonGBMarker(location);
      return;
    }

    this._setGBMarker(location, appModel);
  },

  addParentMarker(sample) {
    if (sample.parent) {
      const location = sample.parent.attrs.location || {};
      if (location.latitude) {
        const parentMarker = this.generateRectangleMarker(location, {
          color: 'blue',
          fillOpacity: 0.01,
        });
        parentMarker.addTo(this.map);
      }
    }
  },

  _setNonGBMarker(location) {
    // point circle
    this.marker = this.generateCircleMarker(location);
    this.marker.addTo(this.map);
  },

  _setGBMarker(location, appModel) {
    // check if user wants no Grid Reference
    if (!appModel.attrs.useGridRef) {
      this._setNonGBMarker(location);
      return;
    }

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
  generateRectangleMarker(location, options = {}) {
    const dimensions = LocHelp.getSquareBounds(location) || [[0, 0], [0, 0]];

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
  generateCircleMarker(location, isComplexMarker) {
    const latLng = L.latLng([location.latitude, location.longitude]);

    const options = {
      color: 'red',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7,
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
  _getCircleRadius(location) {
    let radius = 10;
    if (location.source === 'gps') {
      radius = location.accuracy;
    }

    return radius;
  },

  _onMapClick(e, onClick) {
    const location = {
      latitude: parseFloat(e.latlng.lat.toFixed(5)),
      longitude: parseFloat(e.latlng.lng.toFixed(5)),
      source: 'map',
    };

    const zoom = this.getMapZoom();
    location.accuracy = this._mapZoomToMetres(zoom);
    location.gridref = LocHelp.locationToGrid(location);

    // trigger won't work to bubble up
    onClick(location)
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
