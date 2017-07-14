/** ****************************************************************************
 * Location main view header functions.
 *****************************************************************************/
import $ from 'jquery';
import LocHelp from 'helpers/location';
import Marionette from 'backbone.marionette';
import JST from 'JST';
import Log from 'helpers/log';
import typeaheadSearchFn from 'common/typeahead_search';
import 'typeahead';

const HeaderView = Marionette.View.extend({
  template: JST['common/location/header'],

  events: {
    'change #location-name': 'changeName',
    'typeahead:select #location-name': 'changeName',
    'change #location-gridref': 'changeGridRef',
    'keyup #location-gridref': 'keyupGridRef',
    // 'blur #location-name': 'blurInput',
    // 'blur #location-gridref': 'blurInput',
  },

  initialize() {
    Log('Location:Controller:MainViewHeader: initializing.');

    const appModel = this.model.get('appModel');
    this.listenTo(appModel, 'change:attrLocks', this.updateLocks);
  },

  _onLocationChange(location) {
    this._clearGrTimeout();
    this._refreshGrErrorState(false);
    this._refreshGridRefElement(location);
  },

  /**
   * Attaches suggestions to the location name search.
   */
  onAttach() {
    const appModel = this.model.get('appModel');
    const strs = appModel.get('locations');

    this.$el.find('.typeahead').typeahead(
      {
        hint: false,
        highlight: false,
        minLength: 0,
      },
      {
        limit: 3,
        name: 'names',
        source: typeaheadSearchFn(strs, 3, a => a.name),
      });
  },

  changeName(e) {
    this.triggerMethod('name:change', $(e.target).val());
  },
  //
  // blurInput() {
  //   this._refreshMapHeight();
  // },

  /**
   * after delay, if gridref is valid then apply change
   */
  keyupGridRef(e) {
    switch (e.keyCode) {
      case 13:
      // press Enter
      case 38:
      // Up
      case 40:
        // Down
        break;
      default:
        // Other
        const value = e.target.value.replace(/\s+/g, '').toUpperCase();

        const location = this._getCurrentLocation();
        const latlong = `${location.latitude}, ${location.longitude}`;
        if (value === location.gridref || value === latlong) {
          return; // gridref hasn't changed meaningfully
        }

        // Clear previous timeout
        this._clearGrTimeout();
        // eslint-disable-next-line
        const LATLONG_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g;

        const empty = value === '';
        const validGridRef = LocHelp.isValidGridRef(value);
        const validLatLong = value.match(LATLONG_REGEX);
        if (empty || validGridRef || validLatLong) {
          this._refreshGrErrorState(false);

          const that = this;
          // Set new timeout - don't run if user is typing
          this.grRefreshTimeout = setTimeout(() => {
            // let controller know
            that.triggerMethod('gridref:change', value);
          }, 200);
        } else {
          this._refreshGrErrorState(true);
        }
    }
  },

  /**
   * stop any delayed gridref refresh
   */
  _clearGrTimeout() {
    Log('Location:MainView:Header: executing _clearGrTimeout.');

    if (this.grRefreshTimeout) {
      clearTimeout(this.grRefreshTimeout);
      this.grRefreshTimeout = null;
    }
  },

  changeGridRef(e) {
    Log('Location:MainView:Header: executing changeGridRef.');

    this._clearGrTimeout();
    this.triggerMethod('gridref:change', $(e.target).val());
  },

  _refreshGrErrorState(isError) {
    const grInputEl = document.getElementById('location-gridref');
    if (grInputEl) {
      if (isError) {
        grInputEl.setAttribute('data-gr-error', 'error');
       // this._removeMapMarker();
      } else {
        grInputEl.removeAttribute('data-gr-error');
      }
    }
  },

  _refreshGridRefElement(location) {
    Log('Location:MainView:Header: executing _refreshGridRefElement.');

    // rather than full refresh of the view, directly update the relavant input element
    const $GR = this.$el.find('#location-gridref');
    let value = location.gridref;

    const appModel = this.model.get('appModel');
    if ((!appModel.get('useGridRef') || !value) && location.latitude) {
      value = `${location.latitude}, ${location.longitude}`;
    }

    $GR.val(value);
    $GR.attr('data-source', location.source);
  },

  updateLocks() {
    Log('Location:MainView:Header: updating the locks.');

    const appModel = this.model.get('appModel');
    const sample = this.model.get('sample');
    const location = sample.get('location') || {};

    // location lock
    const $locationLockBtn = this.$el.find('#location-lock-btn');
    const locationLocked = appModel.isAttrLocked('location', location);
    if (locationLocked) {
      $locationLockBtn.addClass('icon-lock-closed');
      $locationLockBtn.removeClass('icon-lock-open');
    } else {
      $locationLockBtn.addClass('icon-lock-open');
      $locationLockBtn.removeClass('icon-lock-closed');
    }

    // location name lock
    const $nameLockBtn = this.$el.find('#name-lock-btn');
    const nameLocked = appModel.isAttrLocked('locationName', location.name);
    if (nameLocked) {
      $nameLockBtn.addClass('icon-lock-closed');
      $nameLockBtn.removeClass('icon-lock-open');
    } else {
      $nameLockBtn.addClass('icon-lock-open');
      $nameLockBtn.removeClass('icon-lock-closed');
    }
  },

  _getCurrentLocation() {
    return this.model.get('sample').get('location') || {};
  },


  serializeData() {
    Log('Location:Controller:MainViewHeader: serializing.');

    const appModel = this.model.get('appModel');
    const location = this._getCurrentLocation();
    let value = location.gridref;


    // avoid testing location.longitude as this can validly be zero within the UK
    if ((!appModel.get('useGridRef') || !value) && location.latitude) {
      value = `${location.latitude}, ${location.longitude}`;
    }

    const locationLocked = appModel.isAttrLocked('location', location);
    const nameLocked = appModel.isAttrLocked('locationName', location.name);

    const disableLocationLock = location.source === 'gps';
    return {
      hideName: this.options.hideName,
      hideLocks: this.options.hideLocks,
      disableLocationLock,
      locationName: location.name,
      value,
      locationLocked,
      nameLocked,
    };
  },
});

export default HeaderView;
