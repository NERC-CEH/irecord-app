import { AppModel } from 'models/app';

async function getAppModel() {
  const genericStoreMock = { find: async () => null, save: async () => null };
  const appModel = new AppModel({ cid: 'app', store: genericStoreMock });
  await appModel.ready;
  return appModel;
}

describe('App Model', () => {
  describe.skip('Activities support', () => {
    function getRandActivity() {
      const activity = {
        id: (Math.random() * 100).toFixed(0),
        name: '',
        description: '',
        type: '',
        activity_from_date: '2015-01-01',
        activity_to_date: '2020-01-01',
      };
      return activity;
    }

    it('should remove expired activity lock', async () => {
      const appModel = await getAppModel();
      const activity = getRandActivity();
      activity.activity_to_date = '2000-01-01';
      appModel.setAttrLock('smp', 'activity', activity);
      appModel.save();

      expect(appModel.getAttrLock('smp', 'activity')).toBeInstanceOf(Object);

      expect(appModel.getAttrLock('smp', 'activity')).toBeUndefined();
    });
  });
});
