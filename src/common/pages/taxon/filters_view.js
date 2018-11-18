/** ****************************************************************************
 * Species List filter view.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import informalGroups from 'common/data/informal_groups.data';
import template from './templates/filters.tpl';

export default Marionette.View.extend({
  id: 'species-list-filters',
  tagName: 'ion-list',
  attributes: { lines: 'full' },
  template,
  events: {
    'ionChange ion-checkbox': 'saveTaxonFilter',
    'ionChange ion-radio-group': 'saveNameFilter',
  },

  saveTaxonFilter(e) {
    const filter = parseInt(e.target.value, 10);
    this.trigger('filter:taxon', filter);
  },

  saveNameFilter(e) {
    const filter = e.target.value;
    this.trigger('filter:name', filter);
  },

  serializeData() {
    const filters = Object.keys(informalGroups)
      .sort((a, b) => t(informalGroups[a]).localeCompare(t(informalGroups[b])))
      .map(id => ({ id, label: informalGroups[id] }));

    return {
      searchNamesOnly: this.model.get('searchNamesOnly'),
      selectedFilters: this.model.get('taxonGroupFilters'),
      filters
    };
  }
});
