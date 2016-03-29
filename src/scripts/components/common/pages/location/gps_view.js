/** ****************************************************************************
 * Location GPS view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'marionette';
import JST from '../../../../JST';

export default Marionette.ItemView.extend({
  initialize() {
    this.locationUpdate = null; // to store GPS updates

    const recordModel = this.model.get('recordModel');

    this.template = function template() {
      if (recordModel.isGPSRunning()) {
        return JST['common/location/gps_running'](arguments[0]);
      }

      const location = recordModel.get('location') || {};
      // only gps and todays records
      if (location.source === 'gps' &&
        (new Date(location.updateTime).toDateString() === new Date().toDateString())) {
        return JST['common/location/gps_success'](arguments[0]);
      }
      return JST['common/location/gps'](arguments[0]);
    };

    this.listenTo(recordModel, 'geolocation:start geolocation:stop geolocation:error', this.render);
    this.listenTo(recordModel, 'geolocation:update', this.geolocationUpdate);
    this.listenTo(recordModel, 'geolocation:success', this.geolocationSuccess);
  },

  triggers: {
    'click #gps-button': 'gps:click',
  },

  events: {
    'change #location-name': 'changeName',
  },

  changeName(e) {
    this.triggerMethod('location:name:change', $(e.target).val());
  },

  /**
   * Update the temporary location fix
   * @param location
   */
  geolocationUpdate(location) {
    this.locationUpdate = location;
    this.render();
  },

  geolocationSuccess(location) {
    this.locationUpdate = location;
    this.render();
  },

  serializeData() {
    const recordModel = this.model.get('recordModel');
    let location = this.locationUpdate;
    const prevLocation = recordModel.get('location') || {};

    // if not fixed the location but has previous one that is updating
    if (!location && prevLocation.source === 'gps') {
      location = prevLocation;
    }

    if (location) {
      return {
        name: prevLocation.name,
        accuracy: location.accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracyLimit: 100, // TODO: get from GPS
      };
    }
    return {
      name: prevLocation.name,
    };
  },
});
