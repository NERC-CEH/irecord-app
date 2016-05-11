/** ****************************************************************************
 * App model. Persistent.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import App from '../../../app';
import Store from '../../../../vendor/backbone.localStorage/js/backbone.localStorage';
import pastLocationsExtension from './app_model_past_loc_ext';
import attributeLockExtension from './app_model_attr_lock_ext';
import CONFIG from 'config'; // Replaced with alias

let AppModel = Backbone.Model.extend({
  id: 'app',

  defaults: {
    locations: [],
    attrLocks: {},
    autosync: true,
    useGridRef: true,
    currentActivityId: null,
    activities: null,
  },

  localStorage: new Store(CONFIG.name),

  /**
   * Lookup an activity definition using the ID.
   * @return object Data stored for his activity
   */
   getActivityById: function(activityId) {
    let activity = null;
    let activities = this.get('activities');
    $.each(activities, function() {
      if (this['id'] == activityId) {
        activity = this;
        return false; // from $.each
      }
    });
    return activity;
  },

  checkCurrentActivityExpiry: function() {
    if (this.get('currentActivityId')) {
      // test the activity is not expired
      let activity = this.getActivityById(this.get('currentActivityId')),
          today = new Date().setHours(0,0,0,0);
      // activity not found in available list, or activity found but out of date range
      if (!activity ||
         (activity.group_from_date && new Date(activity.group_from_date).setHours(0,0,0,0) > today) ||
         (activity.group_to_date && new Date(activity.group_to_date).setHours(0,0,0,0) < today)) {
        // unset the activity as it's now expired
        this.set('currentActivityId', null);
        this.save();
        if (typeof App.regions!=="undefined") {
          App.regions.dialog.show({
            title: 'Information',
            body: 'The previously selected activity is no longer available so the default ' +
                'activity has been selected for you.',
            buttons: [{
              id: 'ok',
              title: 'OK',
              onClick: App.regions.dialog.hide
            }]
          });
        }
      }
    }
  },

  /**
   * Initializes the object.
   */
  initialize() {
    this.fetch();
  },
});

// add previous/pased saved locations management
AppModel = AppModel.extend(pastLocationsExtension);
// add sample/occurrence attribute management
AppModel = AppModel.extend(attributeLockExtension);

const appModel = new AppModel();
export { appModel as default, AppModel };
