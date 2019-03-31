/** ****************************************************************************
 * Activities main view.
 **************************************************************************** */
import $ from 'jquery';
import _ from 'lodash';
import Marionette from 'backbone.marionette';
import CONFIG from 'config';
import LoaderView from '../../views/loader_view';
import './styles.scss';
import template from './templates/activity.tpl';
import templateWrapper from './templates/wrapper.tpl';

/**
 * Single activity item view
 */
const ActivityView = Marionette.View.extend({
  tagName: 'ion-item',
  template,
});

/**
 * View for the activities list. Composite to allow a header with instructions.
 */
export default Marionette.CompositeView.extend({
  id: 'activities-list',
  className: 'no-top',
  emptyView: LoaderView,
  childView: ActivityView,
  template: templateWrapper,
  childViewContainer: 'ion-radio-group',

  // Checking an item fires save and closes the page
  triggers() {
    return {
      'ionSelect ion-radio': 'save',
    };
  },

  /**
   * Gets the new user selected activity.
   * @returns {*}
   */
  getActivity() {
    const $inputs = this.$el.find('ion-radio');
    let activity;
    $inputs.each((int, elem) => {
      if ($(elem).prop('checked')) {
        const activityId = parseInt($(elem).val(), 10);
        const filtered = this.collection.filter(a => a.id === activityId);
        if (filtered.length) {
          // should be only one activity in the array matching the id
          activity = _.cloneDeep(filtered[0].attributes);
          delete activity.checked;
        }
      }
    });
    return activity;
  },

  serializeData() {
    return {
      site_url: CONFIG.site_url,
    };
  },
});
