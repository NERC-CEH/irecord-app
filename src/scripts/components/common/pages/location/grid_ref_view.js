import Marionette from 'marionette';
import JST from '../../../../JST';
import locHelp from '../../../../helpers/location';
import validate from '../../../../helpers/validate';

export default Marionette.ItemView.extend({
  template: JST['common/location/grid_ref'],

  events: {
    'click #grid-ref-set-btn': 'setGridRef',
  },

  initialize(options) {
    this.listenTo(options.vent, 'gridref:form:data:invalid', this.onFormDataInvalid);
  },

  setGridRef() {
    const val = this.$el.find('#location-gridref').val().escape();
    const name = this.$el.find('#location-name').val().escape();

    const data = {
      gridref: val,
      name,
    };
    // trigger won't work to bubble up
    this.triggerMethod('location:select:gridref', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    validate.updateViewFormErrors($view, errors, '#location-');
  },

  serializeData() {
    const location = this.model.get('recordModel').get('location') || {};
    let gridref;

    if (location.latitude && location.longitude) {
      gridref = locHelp.coord2grid(location, location.accuracy);
    }

    return {
      gridref,
      name: location.name,
    };
  },
});
