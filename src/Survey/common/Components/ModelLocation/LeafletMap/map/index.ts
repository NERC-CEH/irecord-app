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
import { layersOutline, locateOutline, starOutline } from 'ionicons/icons';
import L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import config from 'common/config';
import LeafletButton from './leaflet_button_ext';
import mapMarker from './marker';

const MAX_OS_ZOOM = 9;
const OS_ZOOM_DIFF = 6;

const DEFAULT_LAYER_ZOOM = 1 + OS_ZOOM_DIFF; // 7 and not 1 because of WGS84 scale

const year = new Date().getFullYear();
const OSAttribution = `<div class="os-wordmark"></div> <input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Contains OS data © Crown copyright and database rights ${year}</div>`;

// https://labs.os.uk/public/os-data-hub-examples/os-maps-api/zxy-27700-basic-map
const OS_CRS = new (L as any).Proj.CRS(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
  {
    resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
    origin: [-238375.0, 1376256.0],
  }
);

const transformCoords = function (arr: any) {
  return proj4('EPSG:27700', 'EPSG:4326', arr).reverse();
};

// eslint-disable-next-line
let API: any = {
  DEFAULT_LAYER: 'OS',

  init({ onGPSClick, sample, map, onLayersClick, onPastLocationsClick }: any) {
    const bounds = [
      transformCoords([-238375.0, 0.0]),
      transformCoords([900000.0, 1376256.0]),
    ];

    const OS = L.tileLayer(
      'https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key={accessToken}',
      {
        attribution: OSAttribution,
        accessToken: config.map.osApiKey,
        maxZoom: MAX_OS_ZOOM,
      } as any
    );

    OS.options.bounds = bounds;

    OS.on('tileerror', (tile: any) => {
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

    this.map = map;
    this.$container = map.getContainer();

    // default layer
    this.currentLayer = this.DEFAULT_LAYER;
    this.map.options.crs = OS_CRS;

    // show default layer
    OS.addTo(this.map);
    this.$container.dataset.layer = this.currentLayer; // fix the lines between the tiles

    // GPS
    onPastLocationsClick && this.addPastLocations(onPastLocationsClick);
    onGPSClick && this.addGPS(onGPSClick);
    this.addLayers(onLayersClick);

    // Marker
    this.addMapMarker(sample, true);

    this.map.attributionControl.setPrefix('');
  },

  _getCurrentLocation() {
    return this._currentLocation || {};
  },

  setCurrentLocation(location: any) {
    this._currentLocation = location;
  },

  addPastLocations(onClick: any) {
    const button = new LeafletButton({
      position: 'topright',
      body: `<ion-icon src="${starOutline}" /> `,
      onClick,
      maxWidth: 30, // number
    } as any);

    this.map.addControl(button);
  },

  addGPS(onClick: any) {
    const button = new LeafletButton({
      position: 'topright',
      className: 'gps-btn',
      body: `<div class="spinner-container"><ion-spinner /></div> <ion-icon src="${locateOutline}" /> `,
      onClick,
      maxWidth: 30, // number
    } as any);

    this.map.addControl(button);
  },

  addLayers(onClick: any) {
    const button = new LeafletButton({
      position: 'topright',
      body: `<ion-icon src="${layersOutline}" /> `,
      onClick,
      maxWidth: 30, // number
    } as any);

    this.map.addControl(button);
  },

  /**
   * Normalises the map zoom level between different projections.
   * @param layer
   * @returns {*}
   */
  getMapZoom(zoom: any) {
    const normalZoom = zoom || this.map.getZoom();

    return normalZoom + OS_ZOOM_DIFF;
  },

  /**
   * Transform location accuracy to WGS84 map zoom level.
   * @param metres
   * @private
   */
  _metresToMapZoom(metres: any) {
    if (!metres) return DEFAULT_LAYER_ZOOM;
    if (metres >= 5000) return 9;
    if (metres >= 1000) return 12; // tetrad
    if (metres >= 500) return 13;
    if (metres >= 50) return 16;

    return 18;
  },

  /**
   * Transform WGS84 map zoom to radius in meters.
   * @param zoom
   * @returns {*}
   * @private
   */
  _mapZoomToMetres(zoom: any) {
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
