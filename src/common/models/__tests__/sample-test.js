import DateHelp from 'helpers/date';
import Sample from 'sample';
import Occurrence from 'occurrence';
import userModel from 'user_model';
import appModel from 'app_model';
import Device from 'helpers/device';
import coreAttributes from 'common/config/surveys';
import bryophytesSyrvey from 'common/config/surveys/taxon-groups/bryophytes';
import dragonfliesSyrvey from 'common/config/surveys/taxon-groups/dragonflies';
import savedSamples from '../../saved_samples';

/* eslint-disable no-unused-expressions */
const validTaxon = { warehouse_id: 1, group: 1 };

function getRandomSample(taxon) {
  const occurrence = new Occurrence({
    attrs: {
      taxon: taxon || validTaxon,
    },
  });
  const sample = new Sample({
    attrs: {
      location: {
        latitude: 12.12,
        longitude: -0.23,
        name: 'automatic test',
      },
    },
  });

  sample.occurrences.push(occurrence);
  sample.metadata.saved = true;

  return sample;
}

describe('Sample', () => {
  let sampleRemoteCreateStub;
  beforeEach(() => {
    sampleRemoteCreateStub = sinon
      .stub(Sample.prototype, '_createRemote')
      .resolves({ data: {} });
  });

  afterEach(() => {
    sampleRemoteCreateStub.restore();
  });

  it('should have current date by default', () => {
    const sample = new Sample();
    const { date } = sample.attrs;

    expect(DateHelp.print(date)).to.be.equal(DateHelp.print(new Date()));
  });

  it('should set training mode', () => {
    appModel.attrs.useTraining = false;

    let sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(false);

    appModel.attrs.useTraining = true;

    sample = getRandomSample();
    expect(sample.metadata.training).to.be.equal(true);
  });

  describe('saveRemote', () => {
    it('should not resend', async () => {
      // Given
      const sample = getRandomSample(validTaxon);
      sample.id = 123;
      sample.metadata.server_on = new Date();

      // When
      await sample.saveRemote();

      // Then
      expect(sampleRemoteCreateStub.calledOnce).to.be.false;
    });
  });

  describe('validateRemote', () => {
    it('should return invalids if incomplete', () => {
      const sample = getRandomSample();
      delete sample.attrs.location;
      const invalids = sample.validateRemote();

      expect(invalids.attributes.location).to.be.equal('missing');
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
      expect(sample.setToSend()).to.be.an.instanceof(Promise);
    });

    it('should return validation results if incomplete', () => {
      // Given
      const sample = getRandomSample();
      delete sample.attrs.location;

      // When
      const invalids = sample.validateRemote();

      // Then
      expect(invalids.attributes.location).to.be.equal('missing');
    });
  });

  describe('removeOldTaxonAttributes', () => {
    it('should remove all non core attributes on survey change', async () => {
      // Given
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = getRandomSample(dragonfly);
      const [occ] = sample.occurrences;

      sample.attrs.non_core_attr = 1;
      occ.attrs.non_core_attr = 1;

      // // When
      const bryophyte = { group: bryophytesSyrvey.taxonGroups[0] };
      sample.removeOldTaxonAttributes(occ, bryophyte);

      // // Then
      expect(sample.attrs.non_core_attr).to.be.an.undefined;
      expect(occ.attrs.non_core_attr).to.be.an.undefined;
    });

    it('should retain all core attributes on survey change', () => {
      // Given
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = getRandomSample(dragonfly);
      const [occ] = sample.occurrences;

      // set all core attributes
      const sampleKeys = coreAttributes
        .filter(key => key.includes('smp:'))
        .map(key => key.replace('smp:', ''));
      const sampleKeyValues = {};
      sampleKeys.forEach(key => {
        sampleKeyValues[key] = Math.random();
        sample.attrs[key] = sampleKeyValues[key];
      });
      const occKeys = coreAttributes
        .filter(key => key.includes('occ:'))
        .map(key => key.replace('occ:', ''));
      const occKeyValues = {};
      occKeys.forEach(key => {
        occKeyValues[key] = Math.random();
        sample.occurrences[0].attrs[key] = occKeyValues[key];
      });

      // When
      const bryophyte = { group: bryophytesSyrvey.taxonGroups[0] };
      sample.removeOldTaxonAttributes(occ, bryophyte);

      // Then
      sampleKeys.forEach(key => {
        expect(sample.attrs[key]).to.eql(sampleKeyValues[key]);
      });
      occKeys.forEach(key => {
        expect(occ.attrs[key]).to.eql(occKeyValues[key]);
      });
    });
  });

  describe.skip('Activities extension', () => {
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

    it('should remove expired activities on init', done => {
      const sample = getRandomSample();
      const activity = getRandActivity();
      userModel.attrs.activities = [activity];
      userModel.save();
      sample.attrs.activity = activity;
      sample
        .save()
        .then(() => {
          expect(sample.attrs.activity).to.be.an('object');

          // expire activities
          userModel.attrs.activities = [];
          userModel.save();

          // get the same sample - fresh
          // const newCollection = new Collection([], { store, model: Sample });
          // newCollection
          //   .fetch()
          //   .then(() => {
          //     const newSample = newCollection.get(sample);
          //     expect(newSample.attrs.activity).to.be.undefined;
          //     done();
          //   })
          //   .catch(done);
        })
        .catch(done);
    });

    it('should remove expired activities on activities sync', () => {
      const sample = getRandomSample();
      const activity = getRandActivity();

      // OK
      userModel.attrs.activities = [activity];
      sample.attrs.activity = activity;
      userModel.trigger('sync:activities:end');
      expect(sample.attrs.activity).to.be.an('object');

      // expire
      userModel.attrs.activities = [];
      userModel.trigger('sync:activities:end');
      expect(sample.attrs.activity).to.be.undefined;
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

  describe('getSubmission', () => {
    let devicePlatformStub;
    let deviceVersionStub;
    before(() => {
      devicePlatformStub = sinon.stub(Device, 'getPlatform');
      deviceVersionStub = sinon.stub(Device, 'getVersion');
    });

    after(() => {
      devicePlatformStub.restore();
      deviceVersionStub.restore();
    });

    it('should add survey id and webform', () => {
      // Given
      const sample = getRandomSample();

      // When
      const [submission] = sample.getSubmission();

      // Then
      expect(submission.survey_id).to.exist;
      expect(submission.input_form).to.exist;
    });

    it('should add a device platform/version and app version', () => {
      // Given
      devicePlatformStub.returns('Android');
      deviceVersionStub.returns(1);
      const sample = getRandomSample();
      const smpAttrs = sample.getSurvey().attrs;

      // When
      const [{ fields }] = sample.getSubmission();

      // Then
      expect(fields[smpAttrs.device.id]).to.eql(smpAttrs.device.values.Android);
      expect(fields[smpAttrs.device_version.id]).to.eql(1);
      expect(fields[smpAttrs.app_version.id]).to.exist;
    });

    it('should attach parent survey id to subsamples', () => {
      // Given
      const sample = getRandomSample();
      sample.metadata.complex_survey = 'default';
      delete sample.occurrences[0];

      const subSample = getRandomSample();
      sample.samples.push(subSample);

      // When
      const [submission] = sample.getSubmission();

      // Then
      expect(submission.survey_id).to.eql(submission.samples[0].survey_id);
    });

    it('should set subsamples missing location to parent survey location', () => {
      // Given
      const sample = getRandomSample();
      const subSample = getRandomSample();
      delete subSample.attrs.location;
      sample.samples.push(subSample);

      // When
      const [submission] = sample.getSubmission();

      // Then
      const keys = sample.keys();
      const locationKey = keys.location.id;

      expect(submission.fields[locationKey]).to.eql(
        submission.samples[0].fields[locationKey]
      );
    });
  });
});
