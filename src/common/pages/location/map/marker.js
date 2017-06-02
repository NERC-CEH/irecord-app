import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import L from 'leaflet';
import { OsGridRef } from 'geodesy';
import './leaflet_singleclick_ext';

const marker = {
  addMapMarker() {
    this.map.on('singleclick', this._onMapClick, this);
    this.updateMapMarker(this._getCurrentLocation());
  },

  /**
   * Adds or updates existing map marker.
   * @param currentLocation
   */
  updateMapMarker(location) {
    if (!location.latitude) return;
    Log('Common:Location:Map view: updating map marker.');

    // prepare marker coordinates
    const markerCoords = [location.latitude, location.longitude];

    // add the marker
    const latLng = L.latLng(markerCoords);

    if (!location.gridref) {
      if (this.marker instanceof L.CircleMarker) {
        this.marker.setLocation(location);
      } else {
        // remove previous marker
        this._removeMapMarker();

        // point circle
        this.marker = L.circleMarker(latLng, {
          color: 'red',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7,
        });
        this.marker.setLocation = this._setCircleLocation;
      }
    } else {
      const appModel = this.model.get('appModel');
      if (!appModel.get('useGridRef')) {
        if (this.marker instanceof L.CircleMarker) {
          this.marker.setLocation(location);
        } else {
          // remove previous marker
          this._removeMapMarker();

          // Point -  user prefers lat long
          this.marker = L.circleMarker(latLng, {
            color: 'red',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
          });
          this.marker.setLocation = this._setCircleLocation;
        }
      } else if (this.marker instanceof L.Polygon) {
        this.marker.setLocation(location);
      } else {
        // remove previous marker
        this._removeMapMarker();

        const dimensions = LocHelp.getSquareBounds(location) ||
          [[0, 0], [0, 0]];

        // create an orange rectangle
        this.marker = L.polygon(dimensions, {
          color: 'red',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.2,
        });
        this.marker.setLocation = this._setSquareLocation.bind(this);
      }
    }

    if (markerCoords.length) {
      this.marker.addTo(this.map);
      this.markerAdded = true;
    }
  },

  _onMapClick(e) {
    const location = {
      latitude: parseFloat(e.latlng.lat.toFixed(5)),
      longitude: parseFloat(e.latlng.lng.toFixed(5)),
      source: 'map',
    };

    const zoom = this.getMapZoom();
    location.accuracy = this._mapZoomToMetres(zoom);
    location.gridref = LocHelp.locationToGrid(location);

    // trigger won't work to bubble up
    this.triggerMethod('location:select:map', location);
  },

  _setCircleLocation(loc) {
    let newMarkerCoords = [];
    if (loc.latitude) {
      newMarkerCoords = [loc.latitude, loc.longitude];
    }
    const newLatLng = L.latLng(newMarkerCoords);
    return this.setLatLng(newLatLng);
  },

  /**
   * updates marker square position, given Location
   *
   * @param {type} location
   * @returns {undefined}
   */
  _setSquareLocation(location) {
    // update location
    this.marker.setLatLngs(LocHelp.getSquareBounds(location));
  },

  _removeMapMarker() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  },
};

export default marker;
