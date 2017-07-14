/** ****************************************************************************
 * Settings Locations main view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';
import PastLocationsView from './past_locations_view';

export default Marionette.View.extend({
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

  onChildviewLocationSelect(view) {
    const location = view.model.toJSON();
    delete location.id;
    delete location.favourite;
    delete location.date;
    this.triggerMethod('location:select', location);
  },

  onAttach() {
    const pastLocationsView = new PastLocationsView({
      model: this.model,
    });

    this.getRegion('locations').show(pastLocationsView);
  },
});
