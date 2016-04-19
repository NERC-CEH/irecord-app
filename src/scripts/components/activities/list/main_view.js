/** ****************************************************************************
 * Activities main view.
 *****************************************************************************/
import Marionette from 'marionette';
import PastLocationsView from '../../common/activities_view';
import JST from '../../../JST';

const ActivityView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell',

  initialize() {
    this.template = JST['activities/list/activity'];
  },
});

const NoActivitiesView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'table-view-cell empty',
  template: JST['activities/list/list-none'],
});

export default Marionette.CollectionView.extend({
  id: 'activities-list',
  tagName: 'ul',
  className: 'table-view no-top',
  emptyView: NoActivitiesView,
  childView: ActivityView,

  // inverse the collection
  attachHtml(collectionView, childView) {
    collectionView.$el.prepend(childView.el);
  },

  childViewOptions() {
    return {
      appModel: this.options.appModel,
    };
  },
});
