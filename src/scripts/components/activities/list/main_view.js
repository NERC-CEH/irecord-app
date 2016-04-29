/******************************************************************************
 * Activities main view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';
import $ from 'jquery';

/**
 * Single activity item view
 */
const ActivityView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',
  template: JST['activities/list/activity']
});

/**
 * View used if the list is empty
 */
const NoActivitiesView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['activities/list/list-none']
});

/**
 * View for the activities list. Composite to allow a header with instructions.
 */
export default Marionette.CompositeView.extend({
  id: 'activities-list',
  className: 'table-view no-top',
  emptyView: NoActivitiesView,
  childView: ActivityView,
  template: JST['activities/list/wrapper'],
  childViewContainer: "ul",

  // Checking an item fires save and closes the page
  triggers() {
    return {
      'click input': 'save',
    };
  },

  getGroupId() {
    let $inputs, groupId = null;
    $inputs = this.$el.find('input');
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        groupId = $(elem).val();
      }
    });
    return groupId;
  }
});
