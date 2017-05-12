import GridRefUtils from 'helpers/gridrefutils';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import L from 'leaflet';
import { OsGridRef } from 'geodesy';
import './leaflet_singleclick_ext';

const OS_ZOOM_DIFF = 6;
const MAX_OS_ZOOM = L.OSOpenSpace.RESOLUTIONS.length - 1;

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
    if (!location.latitude || !location.longitude) return;
    Log('Common:Location:Map view: updating map marker.');

    //const inGB = LocHelp.isInGB(location);

    // prepare marker coordinates
    const markerCoords = [location.latitude, location.longitude];

    // add the marker
    const latLng = L.latLng(markerCoords);
    
    //if (inGB === false) {
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

        //const dimensions = this._getSquareDimensions(latLng, location) ||
        //  [[0, 0], [0, 0]];
      
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
      latitude: parseFloat(e.latlng.lat.toFixed(7)),
      longitude: parseFloat(e.latlng.lng.toFixed(7)),
      accuracy: 1, // placeholder absolute accuracy, needed for inGB
      source: 'map',
    };

    const inGB = LocHelp.isInGB(location);

    // normalize the accuracy across different layer types
    let mapZoom = this.map.getZoom();
    let normalisedZoom = mapZoom;

    if (this.currentLayer !== 'OS') {
      normalisedZoom -= OS_ZOOM_DIFF; // adjust the diff
      normalisedZoom = normalisedZoom < 0 ? 0 : normalisedZoom; // normalize

      // need to downgrade to OS maps so that there is no OS -> OSM -> OS transitions
      if (inGB && (mapZoom - OS_ZOOM_DIFF) < MAX_OS_ZOOM) {
        mapZoom -= OS_ZOOM_DIFF; // adjust the diff
      }
    } else if (!inGB) {
      // out of UK adjust the zoom because the next displayed map should be not OS
      normalisedZoom += OS_ZOOM_DIFF;
      mapZoom += OS_ZOOM_DIFF; // adjust the diff
    }

    location.accuracy = LocHelp.mapZoomToMetreRadius(normalisedZoom);
    location.mapZoom = mapZoom;
    
    location.gridref = LocHelp.locationToGrid(location);

    // trigger won't work to bubble up
    this.triggerMethod('location:select:map', location);
    this.updateMapMarker(location);

    // // zoom to marker
    // const newZoom = this.map.getZoom() + 3;
    // this.map.setView([location.latitude, location.longitude], newZoom, { reset: true });
    // this.onMapZoom();
  },

  /**
   * @todo revise this to use new gridref library
   * @deprecated
   * 
   * @param {type} latLng
   * @param {type} location
   * @returns {Array} array of latlng objects SW, SE, NE, NW
   */
  //_getSquareDimensions(latLng, location) {
  //  if (latLng) {
      // get granularity
      //const locationGranularity = LocHelp._getGRgranularity(location) / 2;

      // calc radius
      //const radius = 100000 / Math.pow(10, locationGranularity) / 2;

      // get center in eastings and northings
      //const grid = LocHelp.parseGrid(location.gridref);

      // calculate corners
      //const southWest = new OsGridRef(grid.easting - radius, grid.northing - radius);
      //const southEast = new OsGridRef(grid.easting + radius, grid.northing - radius);
      //const northEast = new OsGridRef(grid.easting + radius, grid.northing + radius);
      //const northWest = new OsGridRef(grid.easting - radius, grid.northing + radius);

   //   const dimensions = [
   //     OsGridRef.osGridToLatLon(southWest),
   //     OsGridRef.osGridToLatLon(southEast),
   //    OsGridRef.osGridToLatLon(northEast),
   //     OsGridRef.osGridToLatLon(northWest),
   //   ];
   //   return dimensions;
   // } else {
   //   return null;
   // }
  //},

  _setCircleLocation(loc) {
    let newMarkerCoords = [];
    if (loc.latitude && loc.longitude) {
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
    // normalize GR square center
    //const grid = LocHelp.locationToGrid(location);
    //const normalizedLocation = LocHelp.gridrefStringToLatLng(grid);
    
    //parsedRef = GridRefUtils.GridRefParser.factory();

    // get bounds
    //let newMarkerCoords = [];
    //if (normalizedLocation.lat && normalizedLocation.lon) {
    //  newMarkerCoords = [normalizedLocation.lat, normalizedLocation.lon];
    //}
    //const newLatLng = L.latLng(newMarkerCoords);
    //const newDimensions = this._getSquareDimensions(newLatLng, location);

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
