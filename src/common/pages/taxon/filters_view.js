/** ****************************************************************************
 * Species List filter view.
 **************************************************************************** */
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import informalGroups from 'informal_groups.data';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'species-list-filters',
  tagName: 'ion-list',
  attributes: { lines: 'full' },
  template: JST['common/taxon/filters'],
  events: {
    'ionChange ion-checkbox': 'saveFilter'
  },

  saveFilter(e) {
    const $input = $(e.target);
    const filter = parseInt($input.val(), 10);
    this.trigger('filter', filter);
  },

  serializeData() {
    const filters = Object.keys(informalGroups)
      .sort((a, b) => t(informalGroups[a]).localeCompare(t(informalGroups[b])))
      .map(id => ({ id, label: informalGroups[id] }));

    return {
      selectedFilters: this.model.get('taxonGroupFilters'),
      filters
    };
  }
});
