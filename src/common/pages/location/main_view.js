/** ****************************************************************************
 * Location main view.
 *****************************************************************************/
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import Log from 'helpers/log';
import CONFIG from 'config';
import 'typeahead';
import HeaderView from './main_view_header';
import mapFunctions from './map/main';
import './styles.scss';

const LocationView = Marionette.View.extend({
  id: 'location-container',
  template: JST['common/location/main'],

  regions: {
    header: {
      el: '#map-header',
      replaceElement: true,
    },
  },

  triggers: {
    'click #location-lock-btn': 'lock:click:location',
    'click #name-lock-btn': 'lock:click:name',
    'click a[data-rel="back"]': 'navigateBack',
  },

  childViewEvents: {
    'gridref:change': function (val) {
      this.triggerMethod('location:gridref:change', val);
    },
    'name:change': function (val) {
      this.triggerMethod('location:name:change', val);
    },
    'input:blur': function () {
      this._refreshMapHeight();
    },
  },

  initialize() {
    Log('Location:Controller:MainView: initializing.');
    const sample = this.model.get('sample');

    // this.listenTo(sample,
    // 'geolocation:start geolocation:stop geolocation:error', this.render);
    this.listenTo(sample, 'geolocation:start', this.geolocationStart);
    this.listenTo(sample, 'geolocation:stop', this.geolocationStop);
    this.listenTo(sample, 'geolocation:error', this.geolocationError);
    this.listenTo(sample, 'geolocation:update', this.geolocationUpdate);
    this.listenTo(sample, 'geolocation:success', this.geolocationSuccess);
    this.listenTo(sample, 'change:location', this.onLocationChange);
  },

  onAttach() {
    Log('Location:Controller:MainView: attaching.');
    this.initMap();
  },

  onRender() {
    const appModel = this.model.get('appModel');
    const sample = this.model.get('sample');

    const headerView = new HeaderView({
      model: new Backbone.Model({ appModel, sample }),
    });
    this.showChildView('header', headerView);
  },

  serializeData() {
    Log('Location:Controller:MainView: serializing.');
    const location = this._getCurrentLocation();

    return {
      locationSource: location.source,
      accuracy: location.accuracy,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracyLimit: CONFIG.gps_accuracy_limit, // TODO: get from GPS
    };
  },

  onLocationChange() {
    Log('Location:MainView: executing onLocationChange.');

    const location = this._getCurrentLocation();

    this.updateMapMarker(location);

    this._repositionMap(location.source === 'map');

    const $gpsBtn = this.$el.find('.gps-btn');
    if ($gpsBtn) {
      $gpsBtn.attr('data-source', location.source);

      if (location.source !== 'gps') {
        this._set_gps_progress_feedback('');
      }
    }
  },

  _getCurrentLocation() {
    return this.model.get('sample').get('location') || {};
  },
});

export default LocationView.extend(mapFunctions);
