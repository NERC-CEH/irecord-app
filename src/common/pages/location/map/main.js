/** ****************************************************************************
 * Location main view map functions.
 *
 +
 |                Map zoom level to accuracy map
 |                +----------------------------+
 |
 |            WGS84   OSGB1936   GRIDREF    GPS ACC.
 |                                ACC.
 |
 |             + 18                4           10m
 |             |                   4           10m
 |             |                   4           10m
 |             | 15   9 +          4           10m
 |             | 14   8 |          4           10m
 |             |        |          3          100m
 |             | 12   6 |          3          100m
 |             |        |          2         1000m
 |             | 10   4 |          2         1000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             | 6    0 +          1        10000m
 |             + 5                 1        10000m
 +
 *
 *****************************************************************************/

import $ from 'jquery';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/layers-2x.png';
import 'leaflet/dist/images/layers.png';
import L from 'leaflet';
import CONFIG from 'config';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import OSLeaflet from 'os-leaflet';
import GridRef from 'leaflet.gridref';
import { OsGridRef } from 'geodesy';
import LeafletButton from './leaflet_button_ext';
import mapMarker from './marker';
import gpsFunctions from './gps';

const DEFAULT_LAYER = 'OS';
const DEFAULT_CENTER = [53.7326306, -2.6546124];
const MAX_OS_ZOOM = L.OSOpenSpace.RESOLUTIONS.length - 1;
const OS_ZOOM_DIFF = 6;
const OS_CRS = L.OSOpenSpace.getCRS(); // OS maps use different projection

const GRID_STEP = 100000; // meters

const API = {
  initMap() {
    Log('Location:MainView:Map: initializing.');

    this.map = L.map(this.$container);

    // default layer
    this.currentLayer = this._getCurrentLayer();
    if (this.currentLayer === 'OS') this.map.options.crs = OS_CRS;

    // position view
    this.map.setView(this._getCenter(), this._getZoomLevel());

    // show default layer
    this.layers[this.currentLayer].addTo(this.map);
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles

    this.map.on('baselayerchange', this._updateCoordSystem, this);
    this.map.on('zoomend', this.onMapZoom, this);

    // Controls
    this.addControls();

    // GPS
    this.addGPS();

    // Past locations
    this.addPastLocations();

    // Marker
    this.addMapMarker();

    // Graticule
    this.addGraticule();
  },

  /**
   * set full remaining height
   *
   */
  _refreshMapHeight() {
    Log('Location:MainView:Map: refreshing map height.');
    // const mapHeight = $(document).height() - 47 - 47 - 44;// - 47 - 38.5;
    this.$container = this.$el.find('#map')[0];
    // $(this.$container).height(mapHeight);
    $(this.$container).style = 'height: 100vh;';
  },

  _getLayers() {
    const layers = {};
    layers.Satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: CONFIG.map.mapbox_satellite_id,
      accessToken: CONFIG.map.mapbox_api_key,
      tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
      minZoom: 5,
    });

    layers.OSM = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: CONFIG.map.mapbox_osm_id,
      accessToken: CONFIG.map.mapbox_api_key,
      tileSize: 256, // specify as, OS layer overwites this with 200 otherwise
      minZoom: 5,
    });

    const start = OsGridRef.osGridToLatLon(OsGridRef(0, 0));
    const end = OsGridRef.osGridToLatLon(OsGridRef(7 * GRID_STEP, 13 * GRID_STEP));
    const bounds = L.latLngBounds([start.lat, start.lon], [end.lat, end.lon]);

    layers.OS = L.tileLayer.OSOpenSpace(CONFIG.map.os_api_key);

    layers.OS.options.bounds = bounds;

    layers.OS.on('tileerror', (tile) => {
      let index = 0;
      const result = tile.tile.src.match(/missingTileString=(\d+)/i);
      if (result) {
        index = parseInt(result[1], 10);
        index++;

        // don't do it more than few times
        if (index < 4) {
          tile.tile.src = tile.tile.src.replace(/missingTileString=(\d+)/i, '&missingTileString=' + index);
        }
      } else {
        if (index === 0) {
          tile.tile.src = tile.tile.src + '&missingTileString=' + index;
        }
      }
    });
    return layers;
  },

  _getCurrentLayer() {
    let layer = DEFAULT_LAYER;
    const zoom = this._getZoomLevel();
    const currentLocation = this._getCurrentLocation();
    const inGB = LocHelp.isInGB(currentLocation);
    if (zoom > MAX_OS_ZOOM - 1) {
      layer = 'Satellite';
    } else if (inGB === false) {
      this.currentLayerControlSelected = true;
      layer = 'Satellite';
    }

    return layer;
  },

  _getCenter() {
    const currentLocation = this._getCurrentLocation();
    let center = DEFAULT_CENTER;
    if (currentLocation.latitude) {
      center = [currentLocation.latitude, currentLocation.longitude];
    }
    return center;
  },

  addControls() {
    Log('Location:MainView:Map: adding layer controls.');

    this.controls = L.control.layers({
      OS: this.layers.OS,
      OSM: this.layers.OSM,
      Satellite: this.layers.Satellite,
    }, {});
    this.map.addControl(this.controls);
  },

  addPastLocations() {
    Log('Location:MainView:Map: adding past locations button.');

    const that = this;
    const button = new LeafletButton({
      position: 'topright',
      className: 'past-btn',
      title: 'navigate to past locations',
      body: '<span class="icon icon-clock"></span>',
      onClick() {
        that.trigger('past:click');
      },
      maxWidth: 30,  // number
    });


    this.map.addControl(button);
    const sample = this.model.get('sample');
    if (sample.isGPSRunning()) {
      this._set_gps_progress_feedback('pending');
    } else {
      this._set_gps_progress_feedback('');
    }
  },

  addGraticule() {
    Log('Location:MainView:Map: adding graticule.');

    const appModel = this.model.get('appModel');
    const useGridRef = appModel.get('useGridRef');
    const useGridMap = appModel.get('useGridMap');
    if (!useGridRef || !useGridMap) return;

    const that = this;

    function getColor() {
      let color;
      switch (that.currentLayer) {
        case 'OS':
          color = '#08b7e8';
          break;
        case 'OSM':
          color = 'gray';
          break;
        default:
          color = 'white';
      }
      return color;
    }

    const gridRef = new L.GridRef({ color: getColor() });

    gridRef.update = () => {
      const zoom = that.getNormalZoom();
      // calculate granularity
      const color = getColor();
      const bounds = that.map.getBounds();
      const granularity = gridRef._getGranularity(zoom);
      const step = GRID_STEP / granularity;

      const polylinePoints = gridRef._calcGraticule(step, bounds);
      gridRef.setStyle({ color });
      gridRef.setLatLngs(polylinePoints);
    };
    gridRef.addTo(this.map);
  },

  /**
   * Derives map zoom level from the current location accuracy.
   */
  _getZoomLevel() {
    Log('Location:MainView:Map: getting zoom level.');
    let mapZoomLevel = 1;

    const currentLocation = this._getCurrentLocation();
    // check if sample has location
    if (!currentLocation.latitude) {
      return mapZoomLevel;
    }

    // transform location accuracy to map zoom level
    if (currentLocation.accuracy) {
      if (currentLocation.accuracy > 1000) {
        mapZoomLevel = 4;
      } else if (currentLocation.accuracy > 100) {
        mapZoomLevel = 8;
      } else if (currentLocation.accuracy > 10) {
        mapZoomLevel = 16;
      } else {
        mapZoomLevel = 18;
      }
    } else {
      mapZoomLevel = 1;
    }

    return mapZoomLevel;
  },

  _updateCoordSystem(e) {
    Log('Location:MainView:Map: updating coord system.');

    this.currentLayerControlSelected = this.controls._handlingClick;

    const center = this.map.getCenter();
    const zoom = this.getNormalZoom(e.name);
    this.map.options.crs = e.name === 'OS' ? OS_CRS : L.CRS.EPSG3857;

    this.currentLayer = e.name;
    this.map.setView(center, zoom, { reset: true });
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles
  },

  /**
   * Normalises the map zoom level between different projections.
   * @param layer
   * @returns {*}
   */
  getNormalZoom(layer, inGB) {
    let zoom = this.map.getZoom();

    if (layer === 'OS') {
      zoom -= OS_ZOOM_DIFF;
      if (zoom > MAX_OS_ZOOM - 1) {
        zoom = MAX_OS_ZOOM - 1;
      }
    } else if (this.currentLayer === 'OS') {
      zoom += OS_ZOOM_DIFF;
    } else if (!inGB) {
      // out of UK adjust the zoom because the next displayed map should be not OS
      zoom += OS_ZOOM_DIFF;
    } else if (inGB && (zoom - OS_ZOOM_DIFF) < MAX_OS_ZOOM) {
      // need to downgrade to OS maps so that there is no OS -> OSM -> OS transitions
      zoom -= OS_ZOOM_DIFF; // adjust the diff
    }

    return zoom;
  },

  onMapZoom() {
    Log('Location:MainView:Map: executing onMapZoom.');

    const zoom = this.map.getZoom();
    const inGB = LocHelp.isInGB(this._getCurrentLocation());

    // -2 and not -1 because we ignore the last OS zoom level
    if (zoom > MAX_OS_ZOOM - 1 && this.currentLayer === 'OS') {
      this.map.removeLayer(this.layers.OS);
      this.map.addLayer(this.layers.Satellite);
    } else {
      const somethingMagical = (zoom - OS_ZOOM_DIFF) <= MAX_OS_ZOOM - 1; //todo
      const isSatellite = this.currentLayer === 'Satellite';
      if (somethingMagical && isSatellite) {
        // only change base layer if user is on OS and did not specificly
        // select OSM/Satellite
        if (!this.currentLayerControlSelected && inGB !== false) {
          this.map.removeLayer(this.layers.Satellite);
          this.map.addLayer(this.layers.OS);
        }
      }
    }
  },


  /**
   * 1 gridref digits. (10000m)  -> < 4 map zoom lvl
   * 2 gridref digits. (1000m)   -> 7
   * 3 gridref digits. (100m)    -> 10
   * 4 gridref digits. (10m)     -> 12
   * 5 gridref digits. (1m)      ->
   *
   * @return {int} radius in metres
   */
  mapZoomToMetreRadius(zoom) {
    let scale;
    if (zoom <= 4) {
      scale = 0;
    } else if (zoom <= 5) {
      Log('tetrad map scale');
      return 1000; // tetrad (radius is 1000m)
    } else if (zoom <= 7) {
      scale = 1;
    } else if (zoom <= 10) {
      scale = 2;
    } else if (zoom <= 12) {
      scale = 3;
    } else {
      scale = 4;
    }

    scale = 5000 / Math.pow(10, scale); // meters
    return scale < 1 ? 1 : scale;
  },
};

$.extend(API, mapMarker);
$.extend(API, gpsFunctions);

export default API;
