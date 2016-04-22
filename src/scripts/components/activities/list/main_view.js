/** ****************************************************************************
 * Activities main view.
 *****************************************************************************/
import Marionette from 'marionette';
import JST from '../../../JST';
import $ from 'jquery';

const ActivityView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',
  template: JST['activities/list/activity']
});

const NoActivitiesView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['activities/list/list-none']
});

export default Marionette.CompositeView.extend({
  id: 'activities-list',
  className: 'table-view no-top',
  emptyView: NoActivitiesView,
  childView: ActivityView,
  template: JST['activities/list/wrapper'],
  childViewContainer: "ul",

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
