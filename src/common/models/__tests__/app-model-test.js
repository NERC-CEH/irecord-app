import _ from 'lodash';
import { AppModel } from 'app_model';
import { getRandomSample } from 'test-helpers';

/* eslint-disable no-unused-expressions */

describe('App Model', () => {
  before(() => {
    const appModel = new AppModel();
    appModel.clear();
    appModel.save();
  });

  it('has default values', () => {
    const appModel = new AppModel();
    expect(_.keys(appModel.attributes).length).to.be.equal(8);
    // should set the exact value checks in the modules requiring them
    expect(appModel.get('showWelcome')).to.be.equal(true);
    expect(appModel.get('locations')).to.be.an('array');
    expect(appModel.get('attrLocks')).to.be.an('object');
    expect(appModel.get('autosync')).to.be.equal(true);
    expect(appModel.get('useGridRef')).to.be.equal(true);
    expect(appModel.get('useGridMap')).to.be.equal(true);
    expect(appModel.get('useTraining')).to.be.equal(false);
    expect(appModel.get('surveyAccuracy')).to.be.equal('monad');
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
      const appModel = new AppModel();

      // lock some attributes
      appModel.setAttrLock('number', 123, 'general');

      // create a new sample
      const sample = getRandomSample();
      appModel.appendAttrLocks(sample);

      // check if correct
      const number = sample.getOccurrence().get('number');
      expect(number).to.be.equal(123);
    });

    it('should copy new attributes and not references', () => {
      const appModel = new AppModel();

      // lock some attributes
      const numberObject = { num: 1 };
      appModel.setAttrLock('number', numberObject, 'general');

      // create a new sample
      const sample = getRandomSample();
      appModel.appendAttrLocks(sample);

      const sample2 = getRandomSample();
      appModel.appendAttrLocks(sample2);

      // check if references with saved lock attributes
      const lockNum = appModel.getAttrLock('number', 'general');
      lockNum.num = 2;

      let number = sample2.getOccurrence().get('number');
      expect(number).to.deep.equal({ num: 1 });

      // check if references between samples
      const num = sample.getOccurrence().get('number');
      num.num = 3;

      number = sample2.getOccurrence().get('number');
      expect(number).to.deep.equal({ num: 1 });

      // check if haven't overwritten
      numberObject.num = 4;
      sample.getOccurrence().set('number', numberObject);

      number = sample2.getOccurrence().get('number');
      expect(number).to.deep.equal({ num: 1 });
    });
  });

  describe('Activities support', () => {
    function getRandActivity() {
      const activity = {
        id: (Math.random() * 100).toFixed(0),
        name: '',
        description: '',
        type: '',
        group_from_date: '2015-01-01',
        group_to_date: '2020-01-01',
      };
      return activity;
    }

    it('should remove expired activity lock', () => {
      let appModel = new AppModel();
      const activity = getRandActivity();
      activity.group_to_date = '2000-01-01';
      appModel.setAttrLock('activity', activity, 'general');
      appModel.save();
      expect(appModel.getAttrLock('activity', 'general')).to.be.an('object');

      appModel = new AppModel();
      expect(appModel.getAttrLock('activity', 'general')).to.be.undefined;
    });
  });
});
