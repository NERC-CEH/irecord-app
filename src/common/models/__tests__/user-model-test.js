import _ from 'lodash';
import { UserModel } from '../user_model';

describe('User Model', () => {
  before(() => {
    const userModel = new UserModel();
    userModel.clear();
    userModel.save();
  });

  it('has default values', () => {
    const userModel = new UserModel();
    expect(userModel.get('drupalID')).to.be.equal('');
    expect(userModel.get('name')).to.be.equal('');
    expect(userModel.get('firstname')).to.be.equal('');
    expect(userModel.get('secondname')).to.be.equal('');
    expect(userModel.get('email')).to.be.equal('');
    expect(userModel.get('password')).to.be.equal('');
  });

  describe('Activities support', () => {
    let server;

    beforeEach(() => {
      server = sinon.fakeServer.create();

      const userModel = new UserModel();
      userModel.logIn({
        secret: '123',
        email: '123@123.com',
        name: '123',
        surname: '123',
      });
      userModel.save();
    });

    afterEach(() => {
      const userModel = new UserModel();
      userModel.clear();
      userModel.save();
      server.restore();
    });

    function getRandActivity() {
      const id = parseInt((Math.random() * 100).toFixed(0));
      const activity = {
        id,
        title: '',
        description: '',
        type: '',
        group_from_date: '2015-01-01',
        group_to_date: '2020-01-01',
      };
      return activity;
    }

    it('has functions', () => {
      const userModel = new UserModel();
      expect(userModel.hasActivityExpired).to.be.a('function');
      expect(userModel.syncActivities).to.be.a('function');
      expect(userModel.getActivity).to.be.a('function');
      expect(userModel.hasActivity).to.be.a('function');
    });

    it('should have attributes', () => {
      const userModel = new UserModel();
      expect(userModel.get('activities')).to.be.an('array');
    });

    it('should sync activities from server', () => {
      const userModel = new UserModel();
      const activity = getRandActivity();

      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([activity]),
      ]);
      server.respond();

      const activities = userModel.get('activities');
      expect(activities.length).to.be.equal(1);
    });

    it('should not sync if user not logged in', () => {
      let userModel = new UserModel();
      userModel.logOut();
      userModel.save();

      sinon.spy(UserModel.prototype, 'fetchActivities');
      userModel = new UserModel();

      expect(userModel.fetchActivities.called).to.be.false;
      userModel.fetchActivities.restore();
    });

    it('should force fetch', () => {
      let userModel = new UserModel();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([getRandActivity()]),
      ]);
      server.respond();

      sinon.spy(UserModel.prototype, 'fetchActivities');
      userModel = new UserModel();
      userModel.syncActivities();
      expect(userModel.fetchActivities.called).to.be.false;

      userModel.syncActivities(true);
      expect(userModel.fetchActivities.called).to.be.true;

      userModel.fetchActivities.restore();
    });

    it('should set synchronizingActivities on sync', () => {
      const userModel = new UserModel();
      expect(userModel.synchronizingActivities).to.be.true;
    });

    it('should fire event on sync start and end', (done) => {
      const userModel = new UserModel();

      userModel.on('sync:activities:end', () => {
        userModel.on('sync:activities:start', done);
        userModel.syncActivities(true);
      });

      const activity = getRandActivity();

      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([activity]),
      ]);
      server.respond();
    });

    it('should reset activities on logout', () => {
      const userModel = new UserModel();
      userModel.set('activities', [getRandActivity(), getRandActivity()]);

      userModel.logOut();
      const activities = userModel.get('activities');
      expect(activities.length).to.be.equal(0);
    });

    it('should check activity expiry', () => {
      const userModel = new UserModel();

      // check out of range
      const expiredActivity = getRandActivity();
      expiredActivity.group_to_date = '2000-01-01';

      userModel.set('activities', [expiredActivity]);

      let expired = userModel.hasActivityExpired(expiredActivity);
      expect(expired).to.be.true;

      // check a deleted one
      let activity = getRandActivity();
      expired = userModel.hasActivityExpired(activity);
      expect(expired).to.be.true;

      // check old updated one
      activity = getRandActivity();
      const notUpdatedActivity = _.cloneDeep(activity);
      activity.name = 'new name';
      userModel.set('activities', [activity]);
      expired = userModel.hasActivityExpired(notUpdatedActivity);
      expect(expired).to.be.true;
    });

    it('should remove expired activities on initialize', () => {
      let userModel = new UserModel();
      const expiredActivity = getRandActivity();
      expiredActivity.group_to_date = '2000-01-01';

      userModel.set('activities', [expiredActivity, getRandActivity()]);
      userModel.save();

      userModel = new UserModel();
      const activities = userModel.get('activities');
      expect(activities.length).to.be.equal(1);
    });

    it('should auto fetch new activities every day', () => {
      const clock = sinon.useFakeTimers();

      let userModel = new UserModel();
      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([activity]),
      ]);
      server.respond();

      userModel = new UserModel();
      expect(userModel.synchronizingActivities).to.be.false;

      clock.tick(1000 * 60 * 60 * 24); // 1day
      userModel = new UserModel();
      expect(userModel.synchronizingActivities).to.be.true;
      clock.restore();
    });

    it('should get activity by id', () => {
      const userModel = new UserModel();
      const activity = getRandActivity();
      userModel.set('activities', [getRandActivity(), activity]);
      const activity2 = userModel.getActivity(activity.id);
      expect(activity2).to.be.deep.equal(activity);
    });

    describe('Activity', () => {
      it('should have default values', () => {
        const userModel = new UserModel();
        server.respondWith([
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify([{
            id: 1,
            group_from_date: '2016-05-03',
            group_to_date: '2016-05-25',
          }]),
        ]);
        server.respond();

        const activities = userModel.get('activities');
        const parsedActivity = activities[0];

        expect(parsedActivity).to.be.an('object');
        expect(typeof parsedActivity.id).be.equal('number');
        expect(parsedActivity.title).to.be.a('string');
        // expect(parsedActivity.description).to.be.a('string');
        // expect(parsedActivity.type).to.be.a('string');
        // expect(parsedActivity.group_from_date).to.be.a('string');
        // expect(parsedActivity.group_to_date).to.be.a('string');
        // expect(parsedActivity.synced_on).to.be.a('string');
      });

      it('should complain on unfamiliar server serponse', () => {
        const userModel = new UserModel();
        userModel.fetchActivities((err) => {
          expect(err).to.be.an('object');
        });

        server.respondWith([
          200, { 'Content-Type': 'application/json' },
          JSON.stringify([{ id: 1 }]),
        ]);
      });
    });
  });
});
