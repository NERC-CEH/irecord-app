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
    return {
      selectedFilters: this.model.get('taxonGroupFilters'),
      informalGroups,
    };
  },
});
