import config from 'common/config';
import { GroupCollection } from 'common/flumens';
import Group from 'common/models/group';
import userModel from 'common/models/user';
import { groupsStore as store } from '../store';

const groupCollection = new GroupCollection({
  store,
  Model: Group,
  url: config.backend.indicia.url,
  getAccessToken: () => userModel.getAccessToken(),
});

export default groupCollection;
