/** ****************************************************************************
 * App Model activities functions.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Log from '../../../helpers/log';
import CONFIG from 'config';

export default {
  syncActivities(force) {
    const that = this;
    if (this.synchronizingActivities) {
      return;
    }
    this.synchronizingActivities = true;

    if (this.hasLogIn() && this._lastSyncExpired() || force) {
      // init or refresh
      this.fetchActivities(() => {
        that.synchronizingActivities = false;
      });
    } else {
      const activities = this.get('activities');
      // remove expired activities
      for (let i = activities.length - 1; i >= 0; i--) {
        const activity = activities[i];
        if (this.hasActivityExpired(activity)) {
          Log('UserModel: removing expired activity');
          activities.splice(i, 1);
        }
      }
      this.synchronizingActivities = false;
    }
  },

  resetActivities() {
    Log('UserModel: fetching activities');
    this.set('activities', []);
    this.save();
  },

  hasActivity(activity) {
    return this.getActivity(activity.id) !== null;
  },

  getActivity(id) {
    const activities = this.get('activities');
    let foundedActivity;
    activities.forEach((activity) => {
      if (id === activity.id) {
        foundedActivity = activity;
      }
    });
    return foundedActivity;
  },

  /**
   * Check if an activity has expired and should be deleted/updated.
   */
  hasActivityExpired(activity = {}) {
    if (!activity.id) {
      return true;
    }

    // check if old one was updated
    const savedActivity = this.getActivity(activity.id);
    if (!_.isEqual(_.omit(savedActivity, ['synced_on']), _.omit(activity, ['synced_on']))) {
      return true;
    }

    // check if out of range
    const today = new Date();
    let tooLate = false;
    if (activity.group_to_date) {
      tooLate = new Date(activity.group_to_date) < today;
    }
    let tooEarly = false;
    if (activity.group_from_date) {
      tooEarly = new Date(activity.group_from_date) > today;
    }

    // activity not found in available list, or activity found but out of date range
    if (tooEarly || tooLate) {
      return true;
    }

    return false;
  },

  /**
   * Loads the list of available activities from the warehouse then updates the
   * collection in the main view.
   */
  fetchActivities(callback) {
    Log('UserModel: fetching activities');
    this.trigger('sync:activities:start');
    const that = this;
    const data = {
      report: 'library/groups/groups_for_app.xml',
      // user_id filled in by iform_mobile_auth proxy
      path: CONFIG.morel.manager.input_form,
      email: this.get('email'),
      appname: CONFIG.morel.manager.appname,
      appsecret: CONFIG.morel.manager.appsecret,
      usersecret: this.get('secret'),
    };

    $.ajax({
      url: CONFIG.report.url,
      type: 'POST',
      data,
      dataType: 'JSON',
      timeout: CONFIG.report.timeout,
      success(receivedData) {
        const activities = [];
        const defaultActivity = {
          synced_on: new Date().toString(),
          id: null,
          title: '',
          description: '',
          group_type: '',
          group_from_date: '',
          group_to_date: '',
        };

        receivedData.forEach((activity) => {
          const fullActivity = $.extend({}, defaultActivity, activity);
          fullActivity.id = parseInt(fullActivity.id);

          // from
          let date;
          if (fullActivity.group_from_date) {
            date = new Date(fullActivity.group_from_date);
            fullActivity.group_from_date = date.toString();
          }

          // to
          if (fullActivity.group_to_date) {
            date = new Date(fullActivity.group_to_date);
            date.setDate(date.getDate() + 1); // include the last day
            fullActivity.group_to_date = date.toString();
          }
          activities.push(fullActivity);
        });

        that.set('activities', activities);
        that.save();
        callback();
        that.trigger('sync:activities:end');
      },
      error(err) {
        Log('Activities load failed');
        callback(err);
        that.trigger('sync:activities:end');
      },
    });
  },

  /**
   * Checks if the last sync was done too long ago.
   * @returns {boolean}
   * @private
   */
  _lastSyncExpired() {
    const activities = this.get('activities');

    if (!activities.length) return true;

    const lastSync = new Date(activities[0].synced_on);

    function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    if (daydiff(lastSync, new Date()) >= 1) return true;

    return false;
  },
};
