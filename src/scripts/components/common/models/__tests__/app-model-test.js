import _ from 'lodash';
import Occurrence from '../occurrence';
import Sample from '../sample';
import {default as appModel, AppModel} from '../app_model';

describe('App Model', () => {
  function getRandomSample() {
    const occurrence = new Occurrence({
      taxon: { warehouse_id: 166205 },
    });
    const sample = new Sample({
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test'},
    }, {
      occurrences: [occurrence],
      onSend: () => {}, // overwrite manager's one checking for user login
    });
    return sample;
  }

  before(() => {
    const appModel = new AppModel();
    appModel.clear();
    appModel.save();
  });

  it('has default values', () => {
    const appModel = new AppModel();
    expect(_.keys(appModel.attributes).length).to.be.equal(6);
    expect(appModel.get('locations')).to.be.an.array;
    expect(appModel.get('attrLocks')).to.be.an.object;
    expect(appModel.get('autosync')).to.be.equal.true;
    expect(appModel.get('useGridRef')).to.be.equal.true;
    expect(appModel.get('currentActivityId')).to.be.null;
    expect(appModel.get('activities')).to.be.null;
  });

  describe('Activities support', () => {
    it('has functions', () => {
      const appModel = new AppModel();
      expect(appModel.getActivity).to.be.a('function');
      expect(appModel.checkCurrentActivityExpiry).to.be.a('function');
    });
    it('should retrieve activity by id', () => {
      const appModel = new AppModel();
      appModel.set('activities', [
        {"id":1,"title":"Activity 1"},
        {"id":2,"title":"Activity 2"}
      ]);
      let activity2 = appModel.getActivity(2);
      expect(activity2.title).to.be.equal("Activity 2");
    });
    it('should check activity expiry', () => {
      const appModel = new AppModel();
      appModel.set('activities', [
        {"id":1,"title":"Activity 1","group_to_date":"2015-01-01"},
        {"id":2,"title":"Activity 1","group_from_date":"2100-01-01"},
      ]);
      appModel.set('currentActivityId', 1);
      appModel.checkCurrentActivityExpiry();
      expect(appModel.get('currentActivityId')).to.be.null;
      appModel.set('currentActivityId', 2);
      appModel.checkCurrentActivityExpiry();
      expect(appModel.get('currentActivityId')).to.be.null;
    });
  });

  describe('Past locations extension', () => {
    it('has functions', () => {
      const appModel = new AppModel();
      expect(appModel.setLocation).to.be.a('function');
      expect(appModel.removeLocation).to.be.a('function');
      expect(appModel.locationExists).to.be.a('function');
      expect(appModel.getLocationSref).to.be.a('function');
      expect(appModel.printLocation).to.be.a('function');
    });
  });

  describe('Locking attributes extension', () => {
    it('has functions', () => {
      const appModel = new AppModel();
      expect(appModel.setAttrLock).to.be.a('function');
      expect(appModel.getAttrLock).to.be.a('function');
      expect(appModel.isAttrLocked).to.be.a('function');
      expect(appModel.appendAttrLocks).to.be.a('function');
    });

    it('should sample append locked attributes', () => {
      // lock some attributes
      appModel.setAttrLock('number', 123);

      // create a new sample
      const sample = getRandomSample();
      appModel.appendAttrLocks(sample);

      // check if correct
      const number = sample.occurrences.at(0).get('number');
      expect(number).to.be.equal(123);
    });

    it('should copy new attributes and not references', () => {
      // lock some attributes
      const numberObject = { num: 1 };
      appModel.setAttrLock('number', numberObject);

      // create a new sample
      const sample = getRandomSample();
      appModel.appendAttrLocks(sample);

      const sample2 = getRandomSample();
      appModel.appendAttrLocks(sample2);

      // check if references with saved lock attributes
      let lockNum = appModel.getAttrLock('number');
      lockNum.num = 2;

      let number = sample2.occurrences.at(0).get('number');
      expect(number).to.deep.equal({ num: 1 });

      // check if references between samples
      let num = sample.occurrences.at(0).get('number');
      num.num = 3;

      number = sample2.occurrences.at(0).get('number');
      expect(number).to.deep.equal({ num: 1 });

      // check if haven't overwritten
      numberObject.num = 4;
      sample.occurrences.at(0).set('number', numberObject);

      number = sample2.occurrences.at(0).get('number');
      expect(number).to.deep.equal({ num: 1 });
    });
  });
});
