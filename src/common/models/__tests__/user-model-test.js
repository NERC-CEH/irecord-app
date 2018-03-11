import _ from 'lodash';
import { UserModel } from '../user_model';

/* eslint-disable no-unused-expressions */

describe('User Model', () => {
  let server;
  beforeEach(() => {
    server = sinon.fakeServer.create();

    const userModel = new UserModel();
    userModel.clear();
    userModel.save();
  });

  afterEach(() => {
    const userModel = new UserModel();
    userModel.clear();
    userModel.save();
    server.restore();
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
    beforeEach(() => {
      const userModel = new UserModel();

      userModel.logIn({
        secret: '123',
        email: '123@123.com',
        password: '123@123.com',
        name: '123',
        surname: '123',
      });
      userModel.save();
    });
    function getRandActivity() {
      const id = parseInt((Math.random() * 100).toFixed(0), 10);
      const activity = {
        id,
        title: '',
        description: '',
        type: '',
        activity_from_date: '2015-01-01',
        activity_to_date: '2020-01-01',
      };
      return activity;
    }

    afterEach(() => {
      if (UserModel.prototype.fetchActivities.restore) {
        UserModel.prototype.fetchActivities.restore();
      }
    });

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

    it('should sync activities from server', done => {
      const userModel = new UserModel();

      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
      ]);

      userModel
        .fetchActivities()
        .then(() => {
          const activities = userModel.get('activities');
          expect(activities.length).to.be.equal(1);
          done();
        })
        .catch(done);

      server.respond();
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

    it('should force fetch', done => {
      let userModel = new UserModel();
      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
      ]);

      // first fetch
      userModel.synchronizingActivities.then(() => {
        sinon.spy(UserModel.prototype, 'fetchActivities');
        userModel = new UserModel();
        // already fetched sync
        userModel
          .syncActivities()
          .then(() => {
            expect(userModel.fetchActivities.called).to.be.false;

            // force fetch
            userModel
              .syncActivities(true)
              .then(() => {
                expect(userModel.fetchActivities.called).to.be.true;

                userModel.fetchActivities.restore();
                done();
              })
              .catch(done);

            server.respond();
          })
          .catch(done);
      });

      server.respond();
    });

    it('should set synchronizingActivities on sync', () => {
      const userModel = new UserModel();
      expect(userModel.synchronizingActivities).to.be.instanceOf(Promise);
    });

    it('should fire event on sync start and end', done => {
      const userModel = new UserModel();

      userModel.on('sync:activities:end', () => {
        userModel.on('sync:activities:start', done);
        userModel.syncActivities(true).catch(done);
      });

      const activity = getRandActivity();

      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
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
      expiredActivity.activity_to_date = '2000-01-01';

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
      expiredActivity.activity_to_date = '2000-01-01';

      userModel.set('activities', [expiredActivity, getRandActivity()]);
      userModel.save();

      userModel = new UserModel();
      const activities = userModel.get('activities');
      expect(activities.length).to.be.equal(1);
    });

    it('should auto fetch new activities every day', done => {
      const clock = sinon.useFakeTimers();

      let userModel = new UserModel();
      const activity = getRandActivity();
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ data: [activity] }),
      ]);

      userModel.synchronizingActivities.then(() => {
        sinon.spy(UserModel.prototype, 'fetchActivities');

        clock.tick(1000 * 60 * 60 * 24); // 1day
        userModel = new UserModel();
        userModel.synchronizingActivities.then(() => {
          expect(userModel.fetchActivities.called).to.be.true;
          clock.restore();
          userModel.fetchActivities.restore();
          done();
        });
        server.respond();
      });
      server.respond();
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
          JSON.stringify({
            data: [
              {
                id: 1,
                activity_from_date: '2016-05-03',
                activity_to_date: '2016-05-25',
              },
            ],
          }),
        ]);
        userModel.synchronizingActivities.then(() => {
          const activities = userModel.get('activities');
          const parsedActivity = activities[0];

          expect(parsedActivity).to.be.an('object');
          expect(typeof parsedActivity.id).be.equal('number');
          expect(parsedActivity.title).to.be.a('string');
          // expect(parsedActivity.description).to.be.a('string');
          // expect(parsedActivity.type).to.be.a('string');
          // expect(parsedActivity.activity_from_date).to.be.a('string');
          // expect(parsedActivity.activity_to_date).to.be.a('string');
          // expect(parsedActivity.synced_on).to.be.a('string');
        });
        server.respond();
      });

      it('should complain on unfamiliar server serponse', () => {
        const userModel = new UserModel();
        userModel.fetchActivities(err => {
          expect(err).to.be.an('object');
        });

        server.respondWith([
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify([{ id: 1 }]),
        ]);
      });
    });
  });
});
