/** ****************************************************************************
 * App Model activities functions.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Indicia from 'indicia';
import Log from 'helpers/log';
import CONFIG from 'config';

export default {
  syncActivities(force) {
    Log('UserModel:Activities: synchronising.');

    const that = this;
    if (this.synchronizingActivities) {
      return this.synchronizingActivities;
    }

    if ((this.hasLogIn() && this._lastSyncExpired()) || force) {
      // init or refresh
      this.trigger('sync:activities:start');

      this.synchronizingActivities = this.fetchActivities()
        .then(() => {
          delete that.synchronizingActivities;
          that.trigger('sync:activities:end');
        })
        .catch((err) => {
          delete that.synchronizingActivities;
          that.trigger('sync:activities:end');
          return Promise.reject(err);
        });

      return this.synchronizingActivities;
    }

    // remove expired activities
    const activities = this.get('activities') || [];
    for (let i = activities.length - 1; i >= 0; i--) {
      const activity = activities[i];
      if (this.hasActivityExpired(activity)) {
        Log('UserModel:Activities: removing expired one.');
        activities.splice(i, 1);
      }
    }

    return Promise.resolve();
  },

  resetActivities() {
    Log('UserModel:Activities: resetting.');
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
    return tooEarly || tooLate;
  },

  /**
   * Loads the list of available activities from the warehouse then updates the
   * collection in the main view.
   */
  fetchActivities() {
    Log('UserModel:Activities: fetching.');

    const that = this;

    const report = new Indicia.Report({
      report: '/library/groups/groups_for_app.xml',

      api_key: CONFIG.indicia.api_key,
      host_url: CONFIG.indicia.host,
      user: this.getUser.bind(this),
      password: this.getPassword.bind(this),
      params: {
        path: CONFIG.indicia.surveys.general.input_form,
      },
    });

    const promise = report.run()
      .then((receivedData) => {
        const data = receivedData.data;
        if (!data || !(data instanceof Array)) {
          const err = new Error('Error while retrieving activities response.');
          return Promise.reject(err);
        }

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

        data.forEach((activity) => {
          const fullActivity = $.extend({}, defaultActivity, activity);
          fullActivity.id = parseInt(fullActivity.id, 10);

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

        return null;
      });

    return promise;
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

    return daydiff(lastSync, new Date()) >= 1;
  },
};
