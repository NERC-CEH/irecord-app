import DateHelp from 'helpers/date';
import Sample from 'sample';
import Occurrence from 'occurrence';
import userModel from 'user_model';
import appModel from 'app_model';
import Survey from 'common/config/surveys/Survey';
import { savedSamples, Collection } from '../../saved_samples';
import store from '../../store';

/* eslint-disable no-unused-expressions */

function getRandomSample() {
  const occurrence = new Occurrence({
    taxon: { warehouse_id: 166205, group: 1 },
  });
  const sample = new Sample(
    {
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test',
      },
    },
    {
      occurrences: [occurrence],
      Collection: savedSamples,
      onSend: () => {}, // overwrite Collection's one checking for user login
    }
  );

  sample.metadata.saved = true;

  return sample;
}

describe('Sample', () => {
  it('should have current date by default', () => {
    const sample = new Sample();
    const date = sample.get('date');

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  it('should set training mode', () => {
    appModel.set('useTraining', false);

    let sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(false);

    appModel.set('useTraining', true);

    sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(true);
  });

  describe('getKeys', () => {
    it.skip('should call getSurvey and return its sample attrs', () => {
      expect(false).to.be.equal(true);
    });
  });

  describe('validation', () => {
    it('should return sample send false invalid if not saved', () => {
      const sample = getRandomSample();
      delete sample.metadata.saved;
      sample.setTaxon({ warehouse_id: 1, group: 1 });
      expect(sample.validate).to.be.a('function');
      sample.clear();

      const invalids = sample.validate(null, { remote: true });
      expect(invalids.attributes.send).to.be.false;
    });

    it('should return attributes and occurrence objects with invalids', () => {
      const sample = getRandomSample();
      sample.metadata.saved = true;
      sample.clear();

      let invalids = sample.validate({}, { remote: true });
      expect(invalids)
        .to.be.an('object')
        .and.have.all.keys('attributes', 'occurrences', 'samples');

      // sample
      expect(invalids.attributes).to.have.all.keys(
        'date',
        'location',
        'location',
        'location_type'
      );

      // occurrence
      expect(invalids.occurrences).to.be.an('object').and.to.be.empty;

      const occurrence = new Occurrence();
      sample.addOccurrence(occurrence);
      invalids = sample.validate(null, { remote: true });
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
      const sample = getRandomSample();
      delete sample.attributes.location;
      delete sample.metadata.saved;
      const valid = sample.setToSend();
      expect(valid).to.be.false;

      expect(sample.validationError).to.be.an('object');
      expect(sample.metadata.saved).to.be.false;
    });
  });

  describe('setTaxon', () => {
    it('should exist', () => {
      const sample = getRandomSample();
      expect(sample.setTaxon).to.be.a('function');
    });

    it('should return a promise', () => {
      const sample = getRandomSample();
      sample.setTaxon({ warehouse_id: 1 });
      expect(sample.setTaxon({ warehouse_id: 1 })).to.be.instanceOf(Promise);
    });

    it('should set taxon to the first occurrence', () => {
      const sample = getRandomSample();
      sample.setTaxon({ warehouse_id: 1 });
      expect(sample.getOccurrence().get('taxon').warehouse_id).to.be.equal(1);
    });

    it('should throw if no occurrence exists', () => {
      const sample = new Sample();
      sample.setTaxon({ warehouse_id: 1 }).catch(err => {
        expect(err.message).to.equal('No occurrence present to set taxon');
      });
    });

    it('should return rejected Promise if sample survey is complex', () => {
      const sample = getRandomSample();
      sample.metadata.complex_survey = true;
      sample.setTaxon({ warehouse_id: 1 }).catch(err => {
        expect(err.message).to.equal(
          'Only general survey samples can use setTaxon method'
        );
      });
    });
  });

  describe('getSurvey', () => {
    let surveyFacotryStub;

    before(() => {
      surveyFacotryStub = sinon.stub(Survey, 'factory');
    });

    after(() => {
      surveyFacotryStub.restore();
    });

    it('should exist', () => {
      const sample = getRandomSample();
      expect(sample.getSurvey).to.be.a('function');
    });

    it('should return survey factory result', () => {
      surveyFacotryStub.returns(1);

      const sample = getRandomSample();
      sample.setTaxon({ warehouse_id: 1, group: 1 });
      const survey = sample.getSurvey();
      expect(surveyFacotryStub.called).to.be.equal(true);
      expect(survey).to.equal(1);
    });

    it('should throw if no occurrence exists', done => {
      const sample = new Sample();
      try {
        sample.getSurvey();
      } catch (err) {
        expect(err.message).to.equal('No occurrence present to get survey');
        done();
      }
    });

    it('should throw if no occurrence taxon group exists', () => {
      const sample = getRandomSample();
      try {
        sample.getSurvey();
      } catch (err) {
        expect(err.message).to.equal(
          'No occurrence taxon group is present to get survey'
        );
      }
    });

    it('should return complex survey', () => {
      surveyFacotryStub.withArgs(null, true).returns('complex');
      const sample = getRandomSample();
      sample.metadata.complex_survey = true;
      expect(sample.getSurvey()).to.be.equal('complex');
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

    it('should remove expired activities on init', done => {
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
        const newCollection = new Collection([], { store, model: Sample });
        newCollection.fetch().then(() => {
          const newSample = newCollection.get(sample);
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
