/** ****************************************************************************
 * App Model activities functions.
 **************************************************************************** */
import { observable } from 'mobx';
import config from 'common/config';
import axios, { AxiosRequestConfig } from 'axios';
import { HandledError, isAxiosNetworkError } from '@flumens';
import * as Yup from 'yup';

export interface Activity {
  id: any;
  title: string;
  description: string;
  group_type: string;
  group_from_date: any;
  group_to_date: any;
}

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

const extension = {
  activities: observable({ synchronizing: false }),

  async syncActivities(force: boolean) {
    console.log('UserModel:Activities: synchronising.');

    if (this.activities.synchronizing) return;

    if (
      !(
        (this.isLoggedIn() && this.attrs.verified && this._lastSyncExpired()) ||
        force
      )
    ) {
      this._removeExpired();
      return;
    }

    const data = await this._fetchActivities();

    const activities: Activity[] = [];
    const defaultActivity = {
      synced_on: new Date().toString(),
      id: null,
      title: '',
      description: '',
      group_type: '',
      group_from_date: '',
      group_to_date: '',
    };

    data.forEach((activity: Activity) => {
      const fullActivity = { ...{}, ...defaultActivity, ...activity };
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

    this.attrs.activities = activities;
    this.save();
  },

  async _fetchActivities() {
    const url = `${config.backend.indicia.url}/index.php/services/rest/reports/library/groups/groups_for_app.xml`;

    const options: AxiosRequestConfig = {
      url,
      headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
      params: {
        path: 'enter-app-record',
        user_id: this.attrs.indiciaUserId,
      },
      timeout: 80000,
    };

    try {
      this.activities.synchronizing = true;
      const { data: response } = await axios(options);

      const isValidResponse = await schemaBackend.isValid(response);
      if (!isValidResponse) throw new Error('Invalid server response.');

      this.activities.synchronizing = false;

      return response.data;
    } catch (error: any) {
      this.activities.synchronizing = false;

      if (isAxiosNetworkError(error))
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );

      throw error;
    }
  },

  _removeExpired() {
    const activities = this.attrs.activities || [];
    for (let i = activities.length - 1; i >= 0; i--) {
      const activity = activities[i];
      if (this.hasActivityExpired(activity)) {
        console.log('UserModel:Activities: removing expired one.');
        activities.splice(i, 1);
      }
    }
  },

  hasActivity(activity: Activity) {
    return this.getActivity(activity.id) !== null;
  },

  getActivity(id: any) {
    const { activities } = this.attrs;
    let foundedActivity = null;
    activities.forEach((activity: Activity) => {
      if (id === activity.id) {
        foundedActivity = activity;
      }
    });
    return foundedActivity;
  },

  /**
   * Check if an activity has expired and should be deleted/updated.
   */
  hasActivityExpired(activity: Activity) {
    if (!activity?.id) return true;

    // check if old one was updated
    const savedActivity = this.getActivity(activity.id);
    if (!savedActivity) return true;

    const savedActivityCopy = JSON.parse(JSON.stringify(savedActivity));
    delete savedActivityCopy.synced_on;

    const activityCopy = JSON.parse(JSON.stringify(activity));
    delete activityCopy.synced_on;

    const isEqual = JSON.stringify(savedActivity) === JSON.stringify(activity);
    if (!isEqual) return true;

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

    function daydiff(first: Date, second: Date) {
      return Math.round(
        (second.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return daydiff(lastSync, new Date()) >= 1;
  },
} as any;

export default extension;
