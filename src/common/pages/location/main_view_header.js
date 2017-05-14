/** ****************************************************************************
 * Location main view header functions.
 *****************************************************************************/
import $ from 'jquery';
import LocHelp from 'helpers/location';
import Log from 'helpers/log';
import typeaheadSearchFn from 'common/typeahead_search';

const API = {
  changeName(e) {
    this.triggerMethod('location:name:change', $(e.target).val());
  },

  blurInput() {
    this._refreshMapHeight();
  },

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
        const LATLONG_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g;

        if (
          value === '' ||
          LocHelp.gridrefStringToLatLng(value) ||
          value.match(LATLONG_REGEX)
        ) {
          // value syntax ok (or blank)

          this._refreshGrErrorState(false);

          const that = this;
          // Set new timeout - don't run if user is typing
          this.grRefreshTimeout = setTimeout(() => {
            // let controller know
            that.trigger('location:gridref:change', value);
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
    Log('Location:Controller:Header: executing _clearGrTimeout.');

    if (this.grRefreshTimeout) {
      clearTimeout(this.grRefreshTimeout);
      this.grRefreshTimeout = null;
    }
  },

  changeGridRef(e) {
    Log('Location:Controller:Header: executing changeGridRef.');

    this._clearGrTimeout();
    this.triggerMethod('location:gridref:change', $(e.target).val());
  },

  addLocationNameSearch() {
    const appModel = this.model.get('appModel');
    const strs = appModel.get('locations');

    this.$el.find('.typeahead').typeahead({
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


  _refreshGrErrorState(isError) {
    const grInputEl = document.getElementById('location-gridref');
    if (grInputEl) {
      if (isError) {
        grInputEl.setAttribute('data-gr-error', 'error');
        this._removeMapMarker();
      } else {
        grInputEl.removeAttribute('data-gr-error');
      }
    }
  },

  locationChange() {
    Log('Location:Controller:Header: executing locationChange.');

    this._clearGrTimeout();
    const location = this._getCurrentLocation();

    this._refreshGrErrorState(false);

    this.updateMapMarker(location);

    this.map.setView(this._getCenter(), this._getZoomLevel());
    this._refreshGridRefElement(location);
  },

  _refreshGridRefElement(location) {
    Log('Location:Controller:Header: executing _refreshGridRefElement.');

    // rather than full refresh of the view, directly update the relavant input element
    const $GR = this.$el.find('#location-gridref');
    let value = location.gridref;
    if (!location.gridref) {
      value = `${location.latitude}, ${location.longitude}`;
    }
    $GR.val(value);
    $GR.attr('data-source', location.source);

    const $gpsBtn = this.$el.find('.gps-btn');
    if ($gpsBtn) {
      $gpsBtn.attr('data-source', location.source);

      if (location.source !== 'gps') {
        this._set_gps_progress_feedback('');
      }
    }
  },

  updateLocks() {
    Log('Location:Controller:Header: updating the locks.');

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
};

export default API;
