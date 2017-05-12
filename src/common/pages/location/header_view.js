import HeaderView from '../../views/header_view';

// header view
const LocationHeader = HeaderView.extend({
  id: 'location-header',

  /*
   From Marionette docs:
   it is suggested that you avoid re-rendering the entire View unless
   absolutely necessary. Instead, if you are binding the View's template
   to a model and need to update portions of the View, you should listen
   to the model's "change" events and only update the necessary DOM elements.
   */
  modelEvents: {
    'change:location': 'updateTitle',
  },

  updateTitle() {
    const title = this.model.printLocation();
    const $title = this.$el.find('h1');

    $title.html(title || 'Location');
  },

  serializeData() {
    return {
      title: this.model.printLocation() || 'Location',
    };
  },
});

export default LocationHeader;
