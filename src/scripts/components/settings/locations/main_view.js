import Marionette from '../../../../vendor/marionette/js/backbone.marionette';
import PastLocationsView from '../../common/past_locations_view';
import JST from '../../../JST';

export default Marionette.LayoutView.extend({
  template: JST['settings/locations/main'],

  regions: {
    locations: '#locations'
  },

  onChildviewLocationDelete: function (view) {
    this.triggerMethod('location:delete', view.model);
  },

  onChildviewLocationEdit: function (view) {
    this.triggerMethod('location:edit', view.model);
  },

  onShow: function () {
    let that = this;
    let pastLocationsView = new PastLocationsView({
      model: this.model
    });

    this.locations.show(pastLocationsView);
  }
});
