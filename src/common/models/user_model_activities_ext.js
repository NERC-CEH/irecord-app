/** ****************************************************************************
 * App Model activities functions.
 **************************************************************************** */
import _ from 'lodash';
import Log from 'helpers/log';
import config from 'config';
import * as Yup from 'yup';
import makeRequest from 'common/helpers/makeRequest';

const schemaBackend = Yup.object().shape({
  data: Yup.array().of(
    Yup.object()
      .shape({
        id: Yup.string(),
        title: Yup.string(),
        // description: null
        // group_type: Yup.string,
        // group_from_date: null
        // group_to_date: null
      })
      .required()
  ),
});

export default {
  async syncActivities(force) {
    Log('UserModel:Activities: synchronising.');

    if (this.activities.synchronizing) {
      return;
    }

    if (!((this.hasLogIn() && this._lastSyncExpired()) || force)) {
      this._removeExpired();
      return;
    }

    const data = await this._fetchActivities();

    const activities = [];
    const defaultActivity = {
      synced_on: new Date().toString(),
      id: null,
      title: '',
      description: '',
      activity_type: '',
      activity_from_date: '',
      activity_to_date: '',
    };

    data.forEach(activity => {
      const fullActivity = { ...{}, ...defaultActivity, ...activity };
      fullActivity.id = parseInt(fullActivity.id, 10);

      // from
      let date;
      if (fullActivity.activity_from_date) {
        date = new Date(fullActivity.activity_from_date);
        fullActivity.activity_from_date = date.toString();
      }

      // to
      if (fullActivity.activity_to_date) {
        date = new Date(fullActivity.activity_to_date);
        date.setDate(date.getDate() + 1); // include the last day
        fullActivity.activity_to_date = date.toString();
      }
      activities.push(fullActivity);
    });

    this.attrs.activities = activities;
    this.save();
  },

  async _fetchActivities() {
    const url = `${config.site_url}api/v1/reports/library/groups/groups_for_app.xml`;

    const { name, password } = this.attrs;
    const userAuth = btoa(`${name}:${password}`);

    const options = {
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': config.indicia.api_key,
      },
      qs: {
        path: 'enter-app-record',
      },
    };

    let response;
    try {
      this.activities.synchronizing = true;
      response = await makeRequest(url, options, 1000000);
      const isValidResponse = await schemaBackend.isValid(response);

      if (!isValidResponse) {
        throw new Error('Invalid server response.');
      }
      this.activities.synchronizing = false;

      return response.data;
    } catch (e) {
      this.activities.synchronizing = false;
      throw new Error(e.message);
    }
  },

  _removeExpired() {
    const activities = this.attrs.activities || [];
    for (let i = activities.length - 1; i >= 0; i--) {
      const activity = activities[i];
      if (this.hasActivityExpired(activity)) {
        Log('UserModel:Activities: removing expired one.');
        activities.splice(i, 1);
      }
    }
  },

  hasActivity(activity) {
    return this.getActivity(activity.id) !== null;
  },

  getActivity(id) {
    const { activities } = this.attrs;
    let foundedActivity = null;
    activities.forEach(activity => {
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
    if (
      !_.isEqual(
        _.omit(savedActivity, ['synced_on']),
        _.omit(activity, ['synced_on'])
      )
    ) {
      return true;
    }

    // check if out of range
    const today = new Date();
    let tooLate = false;
    if (activity.activity_to_date) {
      tooLate = new Date(activity.activity_to_date) < today;
    }
    let tooEarly = false;
    if (activity.activity_from_date) {
      tooEarly = new Date(activity.activity_from_date) > today;
    }

    // activity not found in available list, or activity found but out of date range
    return tooEarly || tooLate;
  },

  /**
   * Checks if the last sync was done too long ago.
   * @returns {boolean}
   * @private
   */
  _lastSyncExpired() {
    const { activities } = this.attrs;

    if (!activities.length) {
      return true;
    }

    const lastSync = new Date(activities[0].synced_on);

    function daydiff(first, second) {
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    return daydiff(lastSync, new Date()) >= 1;
  },
};
