import $ from 'jquery';
import Morel from 'morel';
import Sample from '../sample';
import Occurrence from '../occurrence';
import userModel from '../user_model';
import DateHelp from 'helpers/date';
import CONFIG from 'config'; // Replaced with alias
import { savedSamples, Manager as savedSamples } from '../../saved_samples';

const morelConfiguration = $.extend(CONFIG.morel.manager, {
  Storage: Morel.DatabaseStorage,
  Sample,
});

function getRandomSample() {
  const occurrence = new Occurrence({
    taxon: { warehouse_id: 166205 },
  });
  const sample = new Sample({
    location: {
      latitude: 12.12,
      longitude: -0.23,
      name: 'automatic test' },
  }, {
    occurrences: [occurrence],
    manager: savedSamples,
    onSend: () => {}, // overwrite manager's one checking for user login
  });

  sample.metadata.saved = true;

  return sample;
}

describe('Sample', () => {
  it('should have current date by default', () => {
    const sample = new Sample();
    const date = sample.get('date');

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  describe('validation', () => {
    it('should return sample send false invalid if not saved', () => {
      const sample = new Sample();
      expect(sample.validate).to.be.a('function');
      sample.clear();

      const invalids = sample.validate();
      expect(invalids.sample.send).to.be.false;
    });

    it('should return sample and occurrence objects with invalids', () => {
      const sample = new Sample();
      expect(sample.validate).to.be.a('function');
      sample.metadata.saved = true;
      sample.clear();

      let invalids = sample.validate({});
      expect(invalids).to.be.an('object')
        .and.have.property('sample')
        .and.have.property('occurrences');

      // sample
      expect(invalids.sample).to.have.property('date');
      expect(invalids.sample).to.have.property('location');
      expect(invalids.sample).to.have.property('location name');
      expect(invalids.sample).to.have.property('location_type');
      expect(invalids.sample).to.have.property('occurrences');

      // occurrence
      expect(invalids.occurrences)
        .to.be.an('object')
        .and.to.be.empty;

      const occurrence = new Occurrence();
      sample.addOccurrence(occurrence);
      invalids = sample.validate();
      expect(invalids.occurrences).to.not.be.empty;
      expect(invalids.occurrences).to.have.property(occurrence.cid);
    });
  });

  describe('setToSend', () => {
    it('should set the saved flag in sample metadata', () => {
      const sample = getRandomSample();
      sample.setToSend();
      expect(sample.metadata.saved).to.be.true;
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      const promise = sample.setToSend();
      expect(promise).to.be.an.instanceof(Promise);
    });

    it('should not send if invalid, but set validationError', () => {
      const sample = new Sample();
      const valid = sample.setToSend();
      expect(valid).to.be.false;

      expect(sample.validationError).to.be.an('object');
      expect(sample.metadata.saved).to.be.false;
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
    it('has functions', () => {
      const sample = new Sample();
      expect(sample.checkExpiredGroup).to.be.a('function');
    });

    it('should remove expired activities on init', (done) => {
      const sample = getRandomSample();
      const activity = getRandActivity();
      userModel.set('activities', [activity]);
      userModel.save();
      sample.set('group', activity);
      sample.save().then(() => {
        expect(sample.get('group')).to.be.an('object');

        // expire activities
        userModel.set('activities', []);
        userModel.save();

        // get the same sample - fresh
        const newManager = new savedSamples(morelConfiguration);
        newManager.get(sample)
          .then((newSample) => {
            expect(newSample.get('group')).to.be.undefined;
            done();
          });
      });
    });

    it('should remove expired activities on activities sync', () => {
      const sample = getRandomSample();
      const activity = getRandActivity();

      // OK
      userModel.set('activities', [activity]);
      sample.set('group', activity);
      userModel.trigger('sync:activities:end');
      expect(sample.get('group')).to.be.an('object');

      // expire
      userModel.set('activities', []);
      userModel.trigger('sync:activities:end');
      expect(sample.get('group')).to.be.undefined;
    });
  });

  describe('GPS extension', () => {
    it('has GPS functions', () => {
      const sample = new Sample();
      expect(sample.startGPS).to.be.a('function');
      expect(sample.stopGPS).to.be.a('function');
      expect(sample.isGPSRunning).to.be.a('function');
    });
  });
});
