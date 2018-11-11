/** ****************************************************************************
 * Taxon header view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import template from './templates/header.tpl';

export default Marionette.View.extend({
  tagName: 'nav',
  template,

  events: {
    'click a[data-rel="back"]': 'navigateBack',
    'click #filter-btn': 'toggleFilters'
  },

  modelEvents: {
    'change:filter': 'render'
  },

  toggleFilters(e) {
    this.trigger('filter', e);
  },

  navigateBack() {
    window.history.back();
  },

  serializeData() {
    const filters = this.model.get('taxonGroupFilters');
    const filterOn = filters.length;

    return { filterOn, disableFilters: this.options.disableFilters };
  }
});
