import Backbone from 'backbone';
import API from '../controller';
import appModel from '../../../common/models/app_model';
import userModel from '../../../common/models/user_model';

describe('Activities Controller', () => {
  it('should have a show method', () => {
    expect(API.show).to.be.a('function');
  });

  it('should have a save method', () => {
    expect(API.save).to.be.a('function');
  });

  it('should have a initActivities method', () => {
    expect(API.initActivities).to.be.a('function');
  });

  it('should have a _updateActivitiesCollection method', () => {
    expect(API._updateActivitiesCollection).to.be.a('function');
  });

  describe('initActivities', () => {
    let server;
    before(() => {
      userModel.logIn({
        secret: '123',
        email: '123@123.com',
        name: '123',
        surname: '123',
      });

      server = sinon.fakeServer.create();
    });

    after(() => {
      server.restore();
    });

    beforeEach(() => {
      appModel.unset('activities');
      appModel.unset('currentActivityId');
      sinon.spy(API, '_loadActivities');
    });

    afterEach(() => {
      API._loadActivities.restore();
    });

    it('should use existing activities', () => {
      const collection = new Backbone.Collection();

      // previously saved activities
      appModel.set('activities', [
        {
          id: 1,
        },
        {
          id: 2,
        }]);

      API.initActivities(collection);
      // 2 + default = 3
      expect(collection.length).to.be.equal(3);
    });

    it('should call server to initialize', () => {

      const collection = new Backbone.Collection();

      // initialize
      API.initActivities(collection);
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([{ id: 1 }]),
      ]);
      server.respond();

      expect(API._loadActivities.calledOnce).to.be.true;
      expect(collection.length).to.be.equal(2);
    });

    it('should call server to refresh', () => {
      // previously saved activities
      appModel.set('activities', [
        {
          id: 1,
        },
        {
          id: 2,
        }]);

      const collection = new Backbone.Collection();
      API.initActivities(collection);
      expect(collection.length).to.be.equal(3);

      // refresh
      API.initActivities(collection, true);
      server.respondWith([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify([{ id: 1 }]),
      ]);
      server.respond();

      expect(collection.length).to.be.equal(2);
      expect(API._loadActivities.calledOnce).to.be.true;
    });

    it('should not call server if user not logged in', () => {
      userModel.logOut();

      const collection = new Backbone.Collection();
      API.initActivities(collection);

      expect(API._loadActivities.called).to.be.false;
    });
  });
});
