/** ****************************************************************************
 * Location main view map functions.
 *
 `
 |                Map zoom level to accuracy map
 |                +----------------------------+
 |
 |            WGS84   OSGB1936   GRIDREF    GPS ACC.
 |                                ACC.
 |
 |             + 18                4           10m
 |             |                   4           10m
 |             |                   3          100m
 |             | 15   9 +          3          100m
 |             | 14   8 |          3          100m
 |             |        |          2         1000m
 |             | 12   6 |          2         1000m
 |             |        |          2         1000m
 |             | 10   4 |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             |        |          1        10000m
 |             | 6    0 +          1        10000m
 |             + 5                 1        10000m
 +
 *
 **************************************************************************** */

import L from 'leaflet';
import CONFIG from 'config';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import 'leaflet.gridref';
import proj4 from 'proj4';
import 'proj4leaflet';
import LeafletButton from './leaflet_button_ext';
import mapMarker from './marker';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/layers-2x.png';
import 'leaflet/dist/images/layers.png';

const MAX_OS_ZOOM = 9;
const OS_ZOOM_DIFF = 6;

const year = new Date().getFullYear();
const OSAttribution = `<div class="os-wordmark"></div> <input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Contains OS data © Crown copyright and database rights ${year}</div>`;
const MapBoxAttribution =
  '<a href="http://mapbox.com/about/maps" class="mapbox-wordmark" target="_blank">Mapbox</a><input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Leaflet © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong></div>';

// https://labs.os.uk/public/os-data-hub-examples/os-maps-api/zxy-27700-basic-map
const OS_CRS = new L.Proj.CRS(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
  {
    resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
    origin: [-238375.0, 1376256.0],
  }
);

const DEFAULT_LAYER = 'OS';
const DEFAULT_LAYER_ZOOM = 1 + OS_ZOOM_DIFF; // 7 and not 1 because of WGS84 scale
const DEFAULT_CENTER = [53.7326306, -2.6546124];

const GRID_STEP = 100000; // meters

// eslint-disable-next-line
let API = {
  init(
    onGPSClick,
    onPastLocationsClick,
    appModel,
    sample,
    onClick,
    containerEl,
    _getCurrentLocation
  ) {
    Log('Location:MainView:Map: initializing.');
    this.$container = containerEl;
    this._getCurrentLocation = _getCurrentLocation;

    this.map = null;
    this.layers = this.getLayers();

    this.currentLayerControlSelected = false;
    this.currentLayer = null;

    this._refreshMapHeight();

    this.map = L.map(this.$container);

    // default layer
    this.currentLayer = this._getCurrentLayer();
    if (this.currentLayer === 'OS') {
      this.map.options.crs = OS_CRS;
    }

    // position view
    this._repositionMap();

    // show default layer
    this.layers[this.currentLayer].addTo(this.map);
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles

    this.map.on('baselayerchange', this._updateCoordSystem, this);
    this.map.on('zoomend', this.onMapZoom, this);

    // Controls
    this.addControls();
    this.map.attributionControl.setPrefix(''); // remove 'leaflet' prefix

    // GPS
    onGPSClick && this.addGPS(onGPSClick);

    // Past locations
    onPastLocationsClick && this.addPastLocations(sample, onPastLocationsClick);

    // Marker
    this.addMapMarker(sample, onClick, appModel);

    // Graticule
    this.addGraticule(appModel);
  },

  invalidateSize() {
    this.map.invalidateSize();
  },

  getLayers() {
    const layers = {};
    layers.Satellite = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution: MapBoxAttribution,
        id: CONFIG.map.mapbox_satellite_id,
        accessToken: CONFIG.map.mapbox_api_key,
        tileSize: 256, // specify as, OS layer overwites this with 200 otherwise,
      }
    );

    layers.OSM = L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution: MapBoxAttribution,
        id: CONFIG.map.mapbox_osm_id,
        accessToken: CONFIG.map.mapbox_api_key,
        tileSize: 256, // specify as, OS layer overwites this with 200 otherwise
      }
    );

    function transformCoords(arr) {
      return proj4('EPSG:27700', 'EPSG:4326', arr).reverse();
    }

    const bounds = [
      transformCoords([-238375.0, 0.0]),
      transformCoords([900000.0, 1376256.0]),
    ];

    layers.OS = L.tileLayer(
      'https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key={accessToken}',
      {
        attribution: OSAttribution,
        accessToken: CONFIG.map.os_api_key,
        maxZoom: MAX_OS_ZOOM,
      }
    );

    layers.OS.options.bounds = bounds;

    layers.OS.on('tileerror', tile => {
      let index = 0;
      const result = tile.tile.src.match(/missingTileString=(\d+)/i);
      if (result) {
        index = parseInt(result[1], 10);
        index++;

        // don't do it more than few times
        if (index < 4) {
          // eslint-disable-next-line
          tile.tile.src = tile.tile.src.replace(
            /missingTileString=(\d+)/i,
            `&missingTileString=${index}`
          );
        }
      } else if (index === 0) {
        // eslint-disable-next-line
        tile.tile.src = tile.tile.src + '&missingTileString=' + index;
      }
    });

    return layers;
  },

  addControls() {
    Log('Location:MainView:Map: adding layer controls.');

    this.controls = L.control.layers(
      {
        'Ordnance Survey': this.layers.OS,
        'Open Street Map': this.layers.OSM,
        Satellite: this.layers.Satellite,
      },
      {}
    );
    this.map.addControl(this.controls);
  },

  addGPS(onGPSClick) {
    Log('Location:MainView:Map: adding gps button.');

    const button = new LeafletButton({
      position: 'topright',
      className: 'gps-btn',
      title: 'seek gps fix',
      body:
        '<div class="spinner-container"><ion-spinner /></div> <ion-icon src="/images/ios-pin.svg" /> ',
      onClick: onGPSClick,
      maxWidth: 30, // number
    });

    this.map.addControl(button);
  },

  addPastLocations(sample, onPastLocationsClick) {
    Log('Location:MainView:Map: adding past locations button.');

    const button = new LeafletButton({
      position: 'topright',
      className: 'past-btn',
      title: 'navigate to past locations',
      body: '<ion-icon src="/images/ios-star.svg" />',
      onClick: onPastLocationsClick,
      maxWidth: 30, // number
    });

    this.map.addControl(button);
    if (sample.isGPSRunning()) {
      // this._set_gps_progress_feedback('pending');
    } else {
      // this._set_gps_progress_feedback('');
    }
  },

  addGraticule(appModel) {
    Log('Location:MainView:Map: adding graticule.');

    const { useGridRef } = appModel.attrs;
    const { useGridMap } = appModel.attrs;
    if (!useGridRef || !useGridMap) {
      return;
    }

    // eslint-disable-next-line
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
      const zoom = that.getMapZoom();
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
   * Normalises the map zoom level between different projections.
   * @param layer
   * @returns {*}
   */
  getMapZoom(zoom) {
    let normalZoom = zoom || this.map.getZoom();

    if (this.currentLayer === 'OS') {
      normalZoom += OS_ZOOM_DIFF;
    }

    return normalZoom;
  },

  onMapZoom() {
    const zoom = this.getMapZoom();
    Log(`Location:MainView:Map: executing onMapZoom: ${zoom}`);

    const validOSZoom = API._isValidOSZoom(zoom);

    if (this.currentLayer === 'OS' && !validOSZoom) {
      // change to WGS84
      Log('Location:MainView:Map: changing to OS layer');
      this.map.removeLayer(this.layers.OS);
      this.map.addLayer(this.layers.Satellite);
    } else {
      const isSatellite = this.currentLayer === 'Satellite';
      if (isSatellite && validOSZoom) {
        // only change base layer if user is on OS and did not specificly
        // select OSM/Satellite
        const inGB = LocHelp.isInGB(this._getCurrentLocation());
        if (!this.currentLayerControlSelected && inGB) {
          Log('Location:MainView:Map: changing to Sattelite layer');
          this.map.removeLayer(this.layers.Satellite);
          this.map.addLayer(this.layers.OS);
        }
      }
    }
  },

  _repositionMap(dontZoom) {
    const location = this._getCurrentLocation();
    let zoom;
    if (!dontZoom) {
      zoom = this._metresToMapZoom(location.accuracy);
      if (this.currentLayer === 'OS') {
        zoom = this._deNormalizeOSzoom(zoom);
      }
    } else {
      zoom = this.map.getZoom();
    }
    this.map.setView(this._getCenter(location), zoom);
  },

  _getCurrentLayer() {
    let layer = DEFAULT_LAYER;
    const location = this._getCurrentLocation();
    const zoom = this._metresToMapZoom(location.accuracy);
    let inGB = LocHelp.isInGB(location);

    if (!location.latitude) {
      // if no location default to true
      inGB = true;
    }

    const validOSzoom = this._isValidOSZoom(zoom);

    if (!validOSzoom) {
      layer = 'Satellite';
    } else if (!inGB) {
      this.currentLayerControlSelected = true;
      layer = 'Satellite';
    }

    return layer;
  },

  /**
   * Set full remaining height.
   */
  _refreshMapHeight() {},

  _updateCoordSystem(e) {
    Log('Location:MainView:Map: updating coord system.');

    let nextLayer = e.name;

    this.currentLayerControlSelected = this.controls._handlingClick;

    const center = this.map.getCenter();
    let zoom = this.getMapZoom();
    this.map.options.crs = L.CRS.EPSG3857;

    // a change from WGS84 -> OS
    if (nextLayer === 'Ordnance Survey') {
      zoom = API._deNormalizeOSzoom(zoom);
      this.map.options.crs = OS_CRS;
      nextLayer = 'OS';
    }

    this.currentLayer = nextLayer;

    this.map.setView(center, zoom, { reset: true });
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles
  },

  _getCenter(location = {}) {
    let center = DEFAULT_CENTER;
    if (location.latitude) {
      center = [location.latitude, location.longitude];
    }
    return center;
  },

  /**
   * Checks if the WGS84 map zoom level fits within OSGB map zoom max/min.
   * @param zoom
   * @returns {boolean}
   */
  _isValidOSZoom(zoom) {
    const deNormalizedZoom = zoom - OS_ZOOM_DIFF;
    return deNormalizedZoom >= 0 && deNormalizedZoom <= MAX_OS_ZOOM - 1;
  },

  /**
   * Turns WGS84 map zoom into OSGB zoom.
   * @param zoom
   * @returns {number}
   */
  _deNormalizeOSzoom(zoom) {
    const deNormalizedZoom = zoom - OS_ZOOM_DIFF;
    if (deNormalizedZoom > MAX_OS_ZOOM - 1) {
      return MAX_OS_ZOOM - 1;
    }
    if (deNormalizedZoom < 0) {
      return 0;
    }

    return deNormalizedZoom;
  },

  /**
   * Transform location accuracy to WGS84 map zoom level.
   * @param metres
   * @private
   */
  _metresToMapZoom(metres) {
    if (!metres) {
      return DEFAULT_LAYER_ZOOM;
    }

    if (metres >= 5000) {
      return 9;
    }
    if (metres >= 1000) {
      return 12; // tetrad
    }
    if (metres >= 500) {
      return 13;
    }
    if (metres >= 50) {
      return 16;
    }

    return 18;
  },

  /**
   * Transform WGS84 map zoom to radius in meters.
   * @param zoom
   * @returns {*}
   * @private
   */
  _mapZoomToMetres(zoom) {
    let scale;
    if (zoom <= 10) {
      scale = 0;
    } else if (zoom <= 12) {
      return 1000; // tetrad (radius is 1000m)
    } else if (zoom <= 13) {
      scale = 1;
    } else if (zoom <= 16) {
      scale = 2;
    } else {
      scale = 3;
    }

    scale = 5000 / 10 ** scale; // meters
    return scale < 1 ? 1 : scale;
  },
};

API = { ...API, ...mapMarker };

export default API;
