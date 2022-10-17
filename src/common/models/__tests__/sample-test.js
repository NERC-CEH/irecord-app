import { device, date as DateHelp } from '@flumens';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import userModel from 'models/user';
import appModel from 'models/app';
import { coreAttributes, systemAttrs } from 'Survey/common/config';
import defaultSurvey from 'Survey/Default/config';
import birdsSurvey from 'Survey/common/config/birds';
import bryophytesSurvey from 'Survey/common/config/bryophytes';
import dragonfliesSyrvey from 'Survey/common/config/dragonflies';
import listSurvey from 'Survey/List/config';
import plantsSurvey from 'Survey/Plant/config';
import stringify from 'json-stable-stringify';
import config from 'common/config';
import sinon from 'sinon';
import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({ lng: 'en' });

const validTaxon = { warehouse_id: 1, group: 1 };

const getDefaultSample = taxon =>
  defaultSurvey.create(Sample, Occurrence, {
    taxon: taxon || validTaxon,
    skipGPS: true,
  });

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

    expect(DateHelp.print(date)).toBe(DateHelp.print(new Date()));
  });

  it('should set training mode', async () => {
    appModel.attrs.useTraining = false;

    let sample = await getDefaultSample();
    expect(sample.attrs.training).toBe(false);

    appModel.attrs.useTraining = true;

    sample = await getDefaultSample();
    expect(sample.attrs.training).toBe(true);
  });

  describe('upload', () => {
    it('should not resend', async () => {
      // Given
      const sample = await getDefaultSample(validTaxon);
      sample.id = 123;
      sample.metadata.server_on = new Date();

      // When
      await sample.upload();

      // Then
      expect(sampleRemoteCreateStub.calledOnce).toBe(false);
    });
  });

  describe('validateRemote', () => {
    it('should return invalids if incomplete', async () => {
      const sample = await getDefaultSample();
      delete sample.attrs.location;
      const invalids = sample.validateRemote();

      expect(invalids.attributes.errors[0]).toBe(
        'Please enter location and its name.'
      );
    });
  });

  describe('removeOldTaxonAttributes', () => {
    it('should remove all non core attributes on survey change', async () => {
      // Given
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = await getDefaultSample(dragonfly);
      const [occ] = sample.occurrences;

      sample.attrs.non_core_attr = 1;
      occ.attrs.non_core_attr = 1;

      // When
      const bryophyte = { group: bryophytesSurvey.taxonGroups[0] };
      sample.removeOldTaxonAttributes(occ, bryophyte);

      // Then
      expect(sample.attrs.non_core_attr).toBeUndefined();
      expect(occ.attrs.non_core_attr).toBeUndefined();
    });

    it('should retain all core attributes on survey change', async () => {
      // Given
      const dragonfly = { group: dragonfliesSyrvey.taxonGroups[0] };
      const sample = await getDefaultSample(dragonfly);
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
      const bryophyte = { group: bryophytesSurvey.taxonGroups[0] };
      sample.removeOldTaxonAttributes(occ, bryophyte);

      // Then
      sampleKeys.forEach(key => {
        expect(sample.attrs[key]).toEqual(sampleKeyValues[key]);
      });
      occKeys.forEach(key => {
        expect(occ.attrs[key]).toEqual(occKeyValues[key]);
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

    it('should remove expired activities on init', async done => {
      const sample = await getDefaultSample();
      const activity = getRandActivity();
      userModel.attrs.activities = [activity];
      userModel.save();
      sample.attrs.activity = activity;
      sample
        .save()
        .then(() => {
          expect(sample.attrs.activity).toBeInstanceOf(Object);

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

    it('should remove expired activities on activities sync', async () => {
      const sample = await getDefaultSample();
      const activity = getRandActivity();

      // OK
      userModel.attrs.activities = [activity];
      sample.attrs.activity = activity;
      userModel.trigger('sync:activities:end');
      expect(sample.attrs.activity).toBeInstanceOf(Object);

      // expire
      userModel.attrs.activities = [];
      userModel.trigger('sync:activities:end');
      expect(sample.attrs.activity).toBeUndefined();
    });
  });

  describe('GPS extension', () => {
    it('has GPS functions', () => {
      const sample = new Sample();
      expect(sample.startGPS).toBeInstanceOf(Function);
      expect(sample.stopGPS).toBeInstanceOf(Function);
      expect(sample.isGPSRunning).toBeInstanceOf(Function);
    });
  });

  describe('getSubmission', () => {
    it('should add survey id and webform to be backwards compatible', async () => {
      // Given
      const sample = await listSurvey.create(Sample, Occurrence, {
        taxon: validTaxon,
        skipGPS: true,
      });
      const subSample = await listSurvey.smp.create(Sample, Occurrence, {
        taxon: validTaxon,
        skipGPS: true,
        surveySample: sample,
      });
      sample.samples.push(subSample);
      delete sample.metadata.survey_id;
      delete subSample.metadata.survey_id;

      // When
      const { values, samples } = sample.getSubmission();

      // Then
      expect(values.survey_id).toBe(listSurvey.id);
      expect(samples[0].values.survey_id).toBe(listSurvey.id);
    });

    it('should add a system attributes', async () => {
      // Given
      config.version = 1;
      device.info = { osVersion: 1, platform: 'ios' };
      const sample = await getDefaultSample();

      // When
      const { values } = sample.getSubmission();

      // Then
      expect(values[`smpAttr:${systemAttrs.device.remote.id}`]).toEqual(
        systemAttrs.device.remote.values.ios
      );
      expect(values[`smpAttr:${systemAttrs.device_version.remote.id}`]).toEqual(
        1
      );
      expect(values[`smpAttr:${systemAttrs.app_version.remote.id}`]).toEqual(1);
    });

    it('should set subsamples missing location to parent survey location', async () => {
      // Given
      const sample = await listSurvey.create(Sample, { skipGPS: true });
      sample.attrs.location = { name: 'location' };
      const bird = { group: birdsSurvey.taxonGroups[0] };
      const subSample = await listSurvey.smp.create(Sample, Occurrence, {
        taxon: bird,
        surveySample: sample,
        skipGPS: true,
      });
      delete subSample.attrs.location;
      sample.samples.push(subSample);

      // When
      const { values, samples } = sample.getSubmission();

      // Then
      expect(values.location_name).toEqual(samples[0].values.location_name);
    });
  });

  describe('getSurvey', () => {
    it('should return default survey config', async () => {
      // Given
      const sample = await getDefaultSample();

      // When
      const survey = sample.getSurvey();

      // Then
      expect(survey.name).toBe('default');
      expect(survey.taxonGroups.length).toBe(0);
      expect(survey.webForm).toBe('enter-app-record');
      expect(stringify(survey.attrs)).toBe(stringify(defaultSurvey.attrs));
      expect(stringify(survey.occ)).toBe(stringify(defaultSurvey.occ));
      expect(survey.occ.attrs.microscopicallyChecked).toBeUndefined();
    });

    it('should match default species specific', async () => {
      // Given
      const bird = { group: birdsSurvey.taxonGroups[0] };
      const sample = await getDefaultSample(bird);

      // When
      const survey = sample.getSurvey();

      // Then
      expect(survey.name).toBe('default');
      expect(survey.group).toBe('birds');
      expect(survey.taxonGroups).toStrictEqual(birdsSurvey.taxonGroups);
      expect(survey.render).toStrictEqual(birdsSurvey.render);
      expect(survey.attrs).toStrictEqual(defaultSurvey.attrs);
      // merged attrs
      expect(survey.occ.attrs.breeding).toStrictEqual(
        birdsSurvey.occ.attrs.breeding
      );
      expect(survey.occ.attrs.comment).toStrictEqual(
        defaultSurvey.occ.attrs.comment
      );
    });

    it('should match plant', async () => {
      // Given
      const sample = await plantsSurvey.create(Sample);

      // When
      const survey = sample.getSurvey();

      // Then
      expect(survey.name).toBe(plantsSurvey.name);
      expect(survey.taxonGroups).toStrictEqual(plantsSurvey.taxonGroups);
      expect(survey.attrs).toStrictEqual(plantsSurvey.attrs);
    });
  });
});
