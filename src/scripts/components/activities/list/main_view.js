/******************************************************************************
 * Activities main view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';
import $ from 'jquery';
import LoaderView from '../../common/views/loader_view';

/**
 * Single activity item view
 */
const ActivityView = Marionette.ItemView.extend({
  tagName: 'div',
  className: 'activity',
  template: JST['activities/list/activity'],
});

/**
 * View for the activities list. Composite to allow a header with instructions.
 */
export default Marionette.CompositeView.extend({
  id: 'activities-list',
  className: 'no-top',
  emptyView: LoaderView,
  childView: ActivityView,
  template: JST['activities/list/wrapper'],
  childViewContainer: 'div.list',

  // Checking an item fires save and closes the page
  triggers() {
    return {
      'click input': 'save',
    };
  },

  getActivity() {
    const that = this;
    const $inputs = this.$el.find('input');
    let activity;
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        const activityId = parseInt($(elem).val());
        const filtered = that.collection.filter((a) => a.id == activityId);
        if (filtered.length) {
          // should be only one activity in the array matching the id
          activity = filtered[0].attributes;
        }
      }
    });
    return activity;
  },
});
