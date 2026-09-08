import { Group as GroupBase, type GroupOptions } from '@flumens';
import config from 'common/config';
import { groupsStore } from './store';
import userModel from './user';

class Group extends GroupBase {
  constructor(options: GroupOptions) {
    super({
      ...options,
      store: groupsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      getIndiciaUserId: async () => {
        const id = userModel.data.indiciaUserId;
        if (id === undefined) throw new Error('User ID is missing.');
        return id;
      },
    });
  }
}

export default Group;
