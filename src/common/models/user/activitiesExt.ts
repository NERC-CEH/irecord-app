/** ****************************************************************************
 * App Model activities functions.
 **************************************************************************** */
import { observable } from 'mobx';
import axios, { type AxiosRequestConfig } from 'axios';
import { array, object, string } from 'zod';
import { HandledError, isAxiosNetworkError } from '@flumens';
import config from 'common/config';

export type Activity = {
  id: number | null;
  title: string;
  description: string;
  group_type: string;
  group_from_date: string;
  group_to_date: string;
  synced_on: string;
};

type RemoteActivity = { id: string; title: string } & Partial<
  Omit<Activity, 'id' | 'title' | 'synced_on'>
>;

const schemaBackend = object({
  data: array(
    object({
      id: string(),
      title: string(),
    })
  ),
});

export type ActivitiesExtension = {
  activities: { synchronizing: boolean };
  syncActivities: (force: boolean) => Promise<void>;
  _fetchActivities: () => Promise<RemoteActivity[]>;
  _removeExpired: () => void;
  hasActivity: (activity: Activity) => boolean;
  getActivity: (id: number | null) => Activity | null;
  hasActivityExpired: (activity: Activity) => boolean;
  _lastSyncExpired: () => boolean;
};

type ExtensionThis = ActivitiesExtension & {
  data: { verified?: boolean; indiciaUserId?: number; activities: Activity[] };
  isLoggedIn: () => boolean;
  getAccessToken: () => Promise<string>;
  save: () => Promise<void>;
};

const extension: ActivitiesExtension & ThisType<ExtensionThis> = {
  activities: observable({ synchronizing: false }),

  async syncActivities(force) {
    console.log('UserModel:Activities: synchronising.');

    if (this.activities.synchronizing) return;

    if (
      !(
        (this.isLoggedIn() && this.data.verified && this._lastSyncExpired()) ||
        force
      )
    ) {
      this._removeExpired();
      return;
    }

    const data = await this._fetchActivities();
    const syncedOn = new Date().toString();

    this.data.activities = data.map(activity => {
      const from = activity.group_from_date
        ? new Date(activity.group_from_date).toString()
        : '';
      let to = '';
      if (activity.group_to_date) {
        const date = new Date(activity.group_to_date);
        date.setDate(date.getDate() + 1); // include the last day
        to = date.toString();
      }

      return {
        ...activity,
        id: Number.parseInt(activity.id, 10),
        description: activity.description || '',
        group_type: activity.group_type || '',
        group_from_date: from,
        group_to_date: to,
        synced_on: syncedOn,
      };
    });
    await this.save();
  },

  async _fetchActivities() {
    const url = `${config.backend.indicia.url}/index.php/services/rest/reports/library/groups/groups_for_app.xml`;

    const options: AxiosRequestConfig = {
      url,
      headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
      params: {
        path: 'enter-app-record',
        user_id: this.data.indiciaUserId,
      },
      timeout: 80000,
    };

    try {
      this.activities.synchronizing = true;
      const { data: response } = await axios<{ data: RemoteActivity[] }>(
        options
      );

      if (!schemaBackend.safeParse(response).success)
        throw new Error('Invalid server response.');

      this.activities.synchronizing = false;
      return response.data;
    } catch (error) {
      this.activities.synchronizing = false;

      if (axios.isAxiosError(error) && isAxiosNetworkError(error))
        throw new HandledError(
          'Request aborted because of a network issue (timeout or similar).'
        );

      throw error;
    }
  },

  _removeExpired() {
    const { activities } = this.data;
    for (let i = activities.length - 1; i >= 0; i--) {
      const activity = activities[i];
      if (this.hasActivityExpired(activity)) {
        console.log('UserModel:Activities: removing expired one.');
        activities.splice(i, 1);
      }
    }
  },

  hasActivity(activity) {
    return this.getActivity(activity.id) !== null;
  },

  getActivity(id) {
    return this.data.activities.find(activity => id === activity.id) || null;
  },

  hasActivityExpired(activity) {
    if (!activity?.id) return true;

    const savedActivity = this.getActivity(activity.id);
    if (!savedActivity) return true;

    const savedActivityCopy = { ...savedActivity, synced_on: undefined };
    const activityCopy = { ...activity, synced_on: undefined };
    if (JSON.stringify(savedActivityCopy) !== JSON.stringify(activityCopy))
      return true;

    const today = new Date();
    const tooLate = activity.group_to_date
      ? new Date(activity.group_to_date) < today
      : false;
    const tooEarly = activity.group_from_date
      ? new Date(activity.group_from_date) > today
      : false;

    return tooEarly || tooLate;
  },

  _lastSyncExpired() {
    const { activities } = this.data;
    if (!activities.length) return true;

    const lastSync = new Date(activities[0].synced_on);
    const daysSinceSync = Math.round(
      (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSync >= 1;
  },
};

export default extension;
