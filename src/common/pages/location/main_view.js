/** ****************************************************************************
 * Location main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import CONFIG from 'config';
import 'typeahead'; //typeahead.js
import headerFunctions from './main_view_header';
import mapFunctions from './map/main';
import './styles.scss';

const LocationView = Marionette.View.extend({
  id: 'location-container',
  template: JST['common/location/main'],

  triggers: {
    'click #location-lock-btn': 'lock:click:location',
    'click #name-lock-btn': 'lock:click:name',
    'click a[data-rel="back"]': 'navigateBack',
  },

  events: {
    'change #location-name': 'changeName',
    'typeahead:select #location-name': 'changeName',
    'change #location-gridref': 'changeGridRef',
    'keyup #location-gridref': 'keyupGridRef',
    'blur #location-name': 'blurInput',
    'blur #location-gridref': 'blurInput',
  },

  initialize() {
    Log('Location:Controller:MainView: initializing.');

    this.map = null;
    this.layers = this._getLayers();

    this.currentLayerControlSelected = false;
    this.currentLayer = null;
    this.markerAdded = false;

    const sample = this.model.get('sample');

    // this.listenTo(sample,
    // 'geolocation:start geolocation:stop geolocation:error', this.render);
    this.listenTo(sample, 'geolocation:start', this.geolocationStart);
    this.listenTo(sample, 'geolocation:stop', this.geolocationStop);
    this.listenTo(sample, 'geolocation:error', this.geolocationError);
    this.listenTo(sample, 'geolocation:update', this.geolocationUpdate);
    this.listenTo(sample, 'geolocation:success', this.geolocationSuccess);
    this.listenTo(sample, 'change:location', this.locationChange);

    const appModel = this.model.get('appModel');
    this.listenTo(appModel, 'change:attrLocks', this.updateLocks);
  },

  onAttach() {
    Log('Location:Controller:MainView: attaching.');

    this._refreshMapHeight();
    this.initMap();
    this.addLocationNameSearch();
  },

  serializeData() {
    Log('Location:Controller:MainView: serializing.');

    const appModel = this.model.get('appModel');
    const location = this._getCurrentLocation();
    const locationName = this.model.get('sample').get('locationName');
    let gridref;

    // avoid testing location.longitude as this can validly be zero within the UK
    if (location.source !== 'gridref' && location.latitude) {
      gridref = LocHelp.locationToGrid(location);
    } else {
      gridref = location.gridref;
    }

    const locationLocked = appModel.isAttrLocked('location', location);
    const nameLocked = appModel.isAttrLocked('locationName', locationName);

    return {
      locationName,
      gridref,
      locationSource: location.source,
      accuracy: location.accuracy,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracyLimit: CONFIG.gps_accuracy_limit, // TODO: get from GPS
      locationLocked,
      nameLocked,
    };
  },

  _getCurrentLocation() {
    return this.model.get('sample').get('location') || {};
  },
});

const LocationViewHeader = LocationView.extend(headerFunctions);
export default LocationViewHeader.extend(mapFunctions);
