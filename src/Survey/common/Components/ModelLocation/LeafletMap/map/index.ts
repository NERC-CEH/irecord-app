import { layersOutline, locateOutline, starOutline } from 'ionicons/icons';
import L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import type { Location } from '@flumens';
import config from 'common/config';
import type Sample from 'models/sample';
import LeafletButton from './leaflet_button_ext';
import mapMarker, { type MarkerExtension } from './marker';

const MAX_OS_ZOOM = 9;
const OS_ZOOM_DIFF = 6;
const DEFAULT_LAYER_ZOOM = 1 + OS_ZOOM_DIFF;

const year = new Date().getFullYear();
const OSAttribution = `<div class="os-wordmark"></div> <input type="checkbox" id="toggle-info"> <label for="toggle-info"><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDIyLjY4NiA0MjIuNjg2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0MjIuNjg2IDQyMi42ODY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIxMS4zNDMsNDIyLjY4NkM5NC44MDQsNDIyLjY4NiwwLDMyNy44ODIsMCwyMTEuMzQzQzAsOTQuODEyLDk0LjgxMiwwLDIxMS4zNDMsMA0KCQkJczIxMS4zNDMsOTQuODEyLDIxMS4zNDMsMjExLjM0M0M0MjIuNjg2LDMyNy44ODIsMzI3Ljg4Miw0MjIuNjg2LDIxMS4zNDMsNDIyLjY4NnogTTIxMS4zNDMsMTYuMjU3DQoJCQljLTEwNy41NzQsMC0xOTUuMDg2LDg3LjUyLTE5NS4wODYsMTk1LjA4NnM4Ny41MiwxOTUuMDg2LDE5NS4wODYsMTk1LjA4NnMxOTUuMDg2LTg3LjUyLDE5NS4wODYtMTk1LjA4Ng0KCQkJUzMxOC45MDgsMTYuMjU3LDIxMS4zNDMsMTYuMjU3eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBzdHlsZT0iZmlsbDojMDEwMDAyOyIgZD0iTTIzMS45LDEwNC42NDdjMC4zNjYsMTEuMzIzLTcuOTM0LDIwLjM3LTIxLjEzNCwyMC4zN2MtMTEuNjg5LDAtMTkuOTk2LTkuMDU1LTE5Ljk5Ni0yMC4zNw0KCQkJCWMwLTExLjY4OSw4LjY4MS0yMC43NDQsMjAuNzQ0LTIwLjc0NEMyMjMuOTc1LDgzLjkwMywyMzEuOSw5Mi45NTgsMjMxLjksMTA0LjY0N3ogTTE5NC45MzEsMzM4LjUzMVYxNTUuOTU1aDMzLjE4OXYxODIuNTc2DQoJCQkJQzIyOC4xMiwzMzguNTMxLDE5NC45MzEsMzM4LjUzMSwxOTQuOTMxLDMzOC41MzF6Ii8+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==" /></label> <div>Contains OS data © Crown copyright and database rights ${year}</div>`;

type ProjLeaflet = typeof L & {
  Proj: {
    CRS: new (
      code: string,
      projection: string,
      options: { resolutions: number[]; origin: [number, number] }
    ) => L.CRS;
  };
};

const OS_CRS = new (L as ProjLeaflet).Proj.CRS(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
  {
    resolutions: [896, 448, 224, 112, 56, 28, 14, 7, 3.5, 1.75],
    origin: [-238375, 1376256],
  }
);

const transformCoords = (coordinates: [number, number]) =>
  proj4('EPSG:27700', 'EPSG:4326', coordinates).reverse() as [number, number];

type InitOptions = {
  onGPSClick?: (event: Event) => void;
  sample: Sample;
  map: L.Map;
  onLayersClick?: (event: Event) => void;
  onPastLocationsClick?: (event: Event) => void;
};

type MapAPI = MarkerExtension & {
  defaultLayer: string;
  map: L.Map;
  $container: HTMLElement;
  currentLayer: string;
  _currentLocation: Partial<Location>;
  init: (options: InitOptions) => void;
  _getCurrentLocation: () => Partial<Location>;
  setCurrentLocation: (location: Partial<Location>) => void;
  addPastLocations: (onClick: (event: Event) => void) => void;
  addGPS: (onClick: (event: Event) => void) => void;
  addLayers: (onClick?: (event: Event) => void) => void;
  getMapZoom: (zoom?: number) => number;
  _metresToMapZoom: (metres?: number) => number;
  _mapZoomToMetres: (zoom: number) => number;
};

const API: MapAPI & ThisType<MapAPI> = {
  ...mapMarker,
  defaultLayer: 'OS',
  map: undefined as never,
  $container: undefined as never,
  currentLayer: '',
  _currentLocation: {},

  init({ onGPSClick, sample, map, onLayersClick, onPastLocationsClick }) {
    const bounds: L.LatLngBoundsExpression = [
      transformCoords([-238375, 0]),
      transformCoords([900000, 1376256]),
    ];

    const OS = L.tileLayer(
      'https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key={accessToken}',
      {
        attribution: OSAttribution,
        accessToken: config.map.osApiKey,
        maxZoom: MAX_OS_ZOOM,
      } as L.TileLayerOptions & { accessToken: string }
    );
    OS.options.bounds = L.latLngBounds(bounds);

    OS.on('tileerror', event => {
      const { tile } = event;
      const result = tile.src.match(/missingTileString=(\d+)/i);
      if (result) {
        const index = parseInt(result[1], 10) + 1;
        if (index < 4) {
          tile.src = tile.src.replace(
            /missingTileString=(\d+)/i,
            `&missingTileString=${index}`
          );
        }
      } else {
        tile.src += '&missingTileString=0';
      }
    });

    this.map = map;
    this.$container = map.getContainer();
    this.currentLayer = this.defaultLayer;
    this.map.options.crs = OS_CRS;

    OS.addTo(this.map);
    this.$container.dataset.layer = this.currentLayer;

    if (onPastLocationsClick) this.addPastLocations(onPastLocationsClick);
    if (onGPSClick) this.addGPS(onGPSClick);
    this.addLayers(onLayersClick);

    this.addMapMarker(sample);
    this.map.attributionControl.setPrefix('');
  },

  _getCurrentLocation() {
    return this._currentLocation;
  },

  setCurrentLocation(location) {
    this._currentLocation = location;
  },

  addPastLocations(onClick) {
    this.map.addControl(
      new LeafletButton({
        position: 'topright',
        body: `<ion-icon src="${starOutline}" /> `,
        onClick,
        maxWidth: 30,
      })
    );
  },

  addGPS(onClick) {
    this.map.addControl(
      new LeafletButton({
        position: 'topright',
        className: 'gps-btn',
        body: `<div class="spinner-container"><ion-spinner /></div> <ion-icon src="${locateOutline}" /> `,
        onClick,
        maxWidth: 30,
      })
    );
  },

  addLayers(onClick) {
    this.map.addControl(
      new LeafletButton({
        position: 'topright',
        body: `<ion-icon src="${layersOutline}" /> `,
        onClick,
        maxWidth: 30,
      })
    );
  },

  getMapZoom(zoom) {
    return (zoom || this.map.getZoom()) + OS_ZOOM_DIFF;
  },

  _metresToMapZoom(metres) {
    if (!metres) return DEFAULT_LAYER_ZOOM;
    if (metres >= 5000) return 9;
    if (metres >= 1000) return 12;
    if (metres >= 500) return 13;
    if (metres >= 50) return 16;
    return 18;
  },

  _mapZoomToMetres(zoom) {
    let scale;
    if (zoom <= 10) scale = 0;
    else if (zoom <= 12) return 1000;
    else if (zoom <= 13) scale = 1;
    else if (zoom <= 16) scale = 2;
    else scale = 3;

    const metres = 5000 / 10 ** scale;
    return metres < 1 ? 1 : metres;
  },
};

export default API;
