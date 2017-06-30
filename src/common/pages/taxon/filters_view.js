/** ****************************************************************************
 * Species List filter view.
 *****************************************************************************/
import $ from 'jquery';
import Marionette from 'backbone.marionette';
import informalGroups from 'informal_groups.data';
import JST from 'JST';

export default Marionette.View.extend({
  id: 'species-list-filters',
  tagName: 'ul',
  className: 'table-view accordion',
  template: JST['common/taxon/filters'],
  events: {
    'click input[type="checkbox"]': 'saveFilter',
  },

  saveFilter(e) {
    const $input = $(e.target);
    const filter = parseInt($input.val(), 10);
    this.trigger('filter', filter);
  },

  serializeData() {
    const filters = Object.keys(informalGroups)
      .sort((a, b) => informalGroups[a].localeCompare(informalGroups[b]))
      .map(id => ({ id, label: informalGroups[id] }));

    return {
      selectedFilters: this.model.get('taxonGroupFilters'),
      filters,
    };
  },
});
