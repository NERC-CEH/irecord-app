import Log from 'helpers/log';
import LeafletButton from './leaflet_button_ext';

const API = {
  addGPS() {
    Log('Location:MainView:Map: adding gps button.');

    const that = this;
    const location = this._getCurrentLocation();

    const button = new LeafletButton({
      position: 'topright',
      className: 'gps-btn',
      title: 'seek gps fix',
      body: `<span class="icon icon-location"
                data-source="${location.source}"></span>`,
      onClick() {
        that.trigger('gps:click');
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

  geolocationStart() {
    this._set_gps_progress_feedback('pending');
  },

  /**
   * Update the temporary location fix
   * @param location
   */
  geolocationUpdate(location) {
    this.locationUpdate = location;
    this._set_gps_progress_feedback('pending');
  },

  geolocationSuccess(location) {
    this.locationUpdate = location;
    this._set_gps_progress_feedback('fixed');
  },

  geolocationStop() {
    this._set_gps_progress_feedback('');
  },

  geolocationError() {
    this._set_gps_progress_feedback('failed');
  },

  _set_gps_progress_feedback(state) {
    Log('Location:MainView:Map: updating gps button state.');
    const $gpsButton = this.$el.find('.gps-btn');
    // change state
    $gpsButton.attr('data-gps-progress', state);


    // change icon
    const $gpsButtonSpan = $gpsButton.find('span');
    if (state === 'pending') {
      $gpsButtonSpan.addClass('icon-plus icon-spin');
      $gpsButtonSpan.removeClass('icon-location');
    } else {
      $gpsButtonSpan.removeClass('icon-plus icon-spin');
      $gpsButtonSpan.addClass('icon-location');
    }
  },
};

export default API;
