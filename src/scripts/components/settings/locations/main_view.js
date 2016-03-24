/** ****************************************************************************
 * Settings Locations main view.
 *****************************************************************************/
import Marionette from 'marionette';
import PastLocationsView from '../../common/past_locations_view';
import JST from '../../../JST';

export default Marionette.LayoutView.extend({
  template: JST['settings/locations/main'],

  regions: {
    locations: '#locations',
  },

  onChildviewLocationDelete(view) {
    this.triggerMethod('location:delete', view.model);
  },

  onChildviewLocationEdit(view) {
    this.triggerMethod('location:edit', view.model);
  },

  onShow() {
    const pastLocationsView = new PastLocationsView({
      model: this.model,
    });

    this.locations.show(pastLocationsView);
  },
});
