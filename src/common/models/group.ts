import { Group as GroupBase } from '@flumens';
import config from 'common/config';
import { groupsStore } from './store';
import userModel from './user';

class Group extends GroupBase {
  constructor(options: any) {
    super({
      ...options,
      store: groupsStore,
      url: config.backend.indicia.url,
      getAccessToken: () => userModel.getAccessToken(),
      getIndiciaUserId: () => userModel.data.indiciaUserId,
    });
  }
}

export default Group;
