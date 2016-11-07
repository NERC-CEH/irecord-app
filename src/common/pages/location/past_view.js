/** ****************************************************************************
 * Location Past view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import PastLocationsView from '../../views/past_locations_view';

export default Marionette.View.extend({
  template: JST['common/location/past'],

  regions: {
    locations: '#locations',
  },

  onChildviewLocationSelect(view) {
    // remove location id and favourite - make it a new location
    const location = view.model.toJSON();
    delete location.id;
    delete location.favourite;
    this.triggerMethod('location:select:past', location);
  },

  onChildviewLocationDelete(view) {
    this.triggerMethod('location:delete', view.model);
  },

  onChildviewLocationEdit(view) {
    this.triggerMethod('location:edit', view.model);
  },

  onAttach() {
    const pastLocationsView = new PastLocationsView({
      model: this.model.get('appModel'),
    });

    this.getRegion('locations').show(pastLocationsView);
  },
});
