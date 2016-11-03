/** ****************************************************************************
 * Location GridRef view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from 'JST';
import LocHelp from '../../../../helpers/location';
import StringHelp from '../../../../helpers/string';
import Validate from '../../../../helpers/validate';
import Typeahead from 'typeahead';
import locationNameFinder from './location_name_search';

export default Marionette.ItemView.extend({
  template: JST['common/location/grid_ref'],

  events: {
    'click #grid-ref-set-btn': 'setGridRef',
  },

  initialize(options) {
    this.listenTo(options.vent, 'gridref:form:data:invalid', this.onFormDataInvalid);
  },

  onShow() {
    this.addLocationNameSearch();
  },

  addLocationNameSearch() {
    this.$el.find('.typeahead').typeahead({
      hint: false,
      highlight: false,
      minLength: 0,
    },
      {
        limit: 3,
        name: 'names',
        source: locationNameFinder(3),
      });
  },

  setGridRef() {
    const val = StringHelp.escape(this.$el.find('#location-gridref').val());
    const name = StringHelp.escape(this.$el.find('#location-name').val());

    const data = {
      gridref: val,
      name,
    };
    // trigger won't work to bubble up
    this.triggerMethod('location:select:gridref', data);
  },

  onFormDataInvalid(errors) {
    const $view = this.$el;
    Validate.updateViewFormErrors($view, errors, '#location-');
  },

  serializeData() {
    const location = this.model.get('recordModel').get('location') || {};
    let gridref;

    if (location.latitude && location.longitude) {
      gridref = LocHelp.coord2grid(location);
    }

    return {
      gridref,
      name: location.name,
    };
  },
});
