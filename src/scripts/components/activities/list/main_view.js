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
  tagName: 'div',
  className: 'activity',
  template: JST['activities/list/activity']
});

/**
 * View used if the list is empty
 */
const NoActivitiesView = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'empty',
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
  childViewContainer: "div.list",

  // Checking an item fires save and closes the page
  triggers() {
    return {
      'click input': 'save',
    };
  },

  getActivityId() {
    let $inputs, activityId = null;
    $inputs = this.$el.find('input');
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        activityId = $(elem).val();
      }
    });
    return activityId;
  }
});
