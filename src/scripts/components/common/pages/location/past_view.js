import Marionette from 'marionette';
import JST from '../../../../JST';
import PastLocationsView from '../../past_locations_view';


export default Marionette.LayoutView.extend({
  template: JST['common/location/past'],

  regions: {
    locations: '#locations',
  },

  onChildviewLocationSelect(view) {
    this.triggerMethod('location:select:past', view.model.toJSON());
  },

  onChildviewLocationDelete(view) {
    this.triggerMethod('location:delete', view.model);
  },

  onChildviewLocationEdit(view) {
    this.triggerMethod('location:edit', view.model);
  },

  onShow() {
    const pastLocationsView = new PastLocationsView({
      model: this.model.get('appModel'),
    });

    this.locations.show(pastLocationsView);
  },
});
