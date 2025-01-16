/* eslint-disable camelcase */
import axios from 'axios';
import camelCase from 'lodash.camelcase';
import mapKeys from 'lodash.mapkeys';
import { ZodError } from 'zod';
import { isAxiosNetworkError, HandledError } from '@flumens';
import CONFIG from 'common/config';
import Group, { RemoteAttributes } from 'models/group';
import userModel from 'models/user';

type Props = { member?: boolean };

export async function fetch({ member }: Props): Promise<RemoteAttributes[]> {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups`;

  const token = await userModel.getAccessToken();

  const options = {
    params: {
      view: member ? 'member' : 'joinable',
    },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    const res = await axios.get(url, options);

    const getValues = (doc: any) =>
      mapKeys(doc.values, (_, key) => camelCase(key));
    const docs = res.data.map(getValues);

    docs.forEach(Group.remoteSchema.parse);

    const expired = (group: RemoteAttributes) =>
      !group.toDate || new Date(group.toDate) > new Date();
    const unavailable = (group: RemoteAttributes) =>
      !group.fromDate || new Date(group.fromDate) < new Date();

    return docs.filter(expired).filter(unavailable);
  } catch (error: any) {
    if (axios.isCancel(error)) return [];

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    if ('issues' in error) {
      const err: ZodError = error;
      throw new Error(
        err.issues.map(e => `${e.path.join(' ')} ${e.message}`).join(' ')
      );
    }

    throw error;
  }
}

export async function join(groupId: string) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${groupId}/users`;

  const token = await userModel.getAccessToken();

  const body = {
    values: {
      id: userModel.attrs.indiciaUserId,
    },
  };

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    await axios.post(url, body, options);
  } catch (error: any) {
    if (axios.isCancel(error)) return;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    throw error;
  }
}

export async function leave(groupId: string) {
  const url = `${CONFIG.backend.indicia.url}/index.php/services/rest/groups/${groupId}/users/${userModel.attrs.indiciaUserId}`;

  const token = await userModel.getAccessToken();

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 80000,
  };

  try {
    await axios.delete(url, options);
  } catch (error: any) {
    if (axios.isCancel(error)) return;

    if (isAxiosNetworkError(error))
      throw new HandledError(
        'Request aborted because of a network issue (timeout or similar).'
      );

    const hasAlreadyLeft = error.response?.data?.message?.includes(
      'User is not a member of the group'
    );
    if (hasAlreadyLeft) return;

    throw error;
  }
}
