/** ****************************************************************************
 * Taxon header view.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import JST from 'JST';

export default Marionette.View.extend({
  tagName: 'nav',
  template: JST['common/taxon/header'],

  events: {
    'click a[data-rel="back"]': 'navigateBack',
    'click #filter-btn': 'toggleFilters',
  },

  modelEvents: {
    'change:filter': 'render',
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
  },
});
