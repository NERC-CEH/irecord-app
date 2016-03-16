import Marionette from '../../../../../vendor/marionette/js/backbone.marionette';
import JST from '../../../../JST';
import PastLocationsView from '../../past_locations_view';


export default Marionette.LayoutView.extend({
  template: JST['common/location/past'],

  regions: {
    locations: '#locations'
  },

  onChildviewLocationSelect: function (view) {
    this.triggerMethod('location:select:past', view.model.toJSON());
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
      model: this.model.get('appModel')
    });

    this.locations.show(pastLocationsView);
  }
});
