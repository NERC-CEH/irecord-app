/* eslint-disable no-param-reassign */
import appModel from 'models/app';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import AppOccurrence from 'models/occurrence';
import Media from 'models/media';
import { isPlatform } from '@ionic/react';
import * as Yup from 'yup';
import {
  coreAttributes,
  dateAttr,
  activityAttr,
  verifyLocationSchema,
  Survey,
  locationAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  getSystemAttrs,
  makeSubmissionBackwardsCompatible,
} from 'Survey/common/config';
import { Capacitor } from '@capacitor/core';
import config from 'common/config';

const stageOptions = [
  { label: 'Not Recorded', value: '', isDefault: true },
  { value: 'Adult', id: 1950 },
  { value: 'Pre-adult', id: 1951 },
  { value: 'Other', id: 1952 },
];

const sexOptions = [
  { label: 'Not Recorded', value: '', isDefault: true },
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const numberOptions = [
  { value: null, isDefault: true, label: 'Present' },
  { value: 1, id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
];

const survey: Survey = {
  name: 'default',
  id: 374,
  webForm: 'enter-app-record',

  taxonGroups: [], // all

  render: [
    {
      id: 'occ:number',
      label: 'Abundance',
      icon: 'number',
      group: ['occ:number', 'occ:number-ranges'],
    },

    'occ:stage',
    'occ:sex',
    'occ:identifiers',
  ],

  attrs: {
    location: locationAttr,

    date: dateAttr,

    activity: activityAttr,
  },

  verify(attrs: any) {
    try {
      Yup.object()
        .shape({ location: verifyLocationSchema })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  occ: {
    attrs: {
      taxon: taxonAttr,

      number: {
        menuProps: {
          label: 'Abundance',
          icon: numberIcon,
          parse: (_, model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          isLocked: (model: any) => {
            const value =
              survey.occ?.attrs?.number?.menuProps?.getLock?.(model);
            return (
              value &&
              (value === appModel.getAttrLock(model, 'number') ||
                value === appModel.getAttrLock(model, 'number-ranges'))
            );
          },
          getLock: (model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          unsetLock: model => {
            appModel.unsetAttrLock(model, 'number', true);
            appModel.unsetAttrLock(model, 'number-ranges', true);
          },
          setLock: (model, _, value) => {
            const numberRegex = /^\d+$/; // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
            if (numberRegex.test(`${value}`)) {
              appModel.setAttrLock(model, 'number', value, true);
            } else {
              appModel.setAttrLock(model, 'number-ranges', value, true);
            }
          },
        },
        pageProps: {
          headerProps: { title: 'Abundance' },
          attrProps: [
            {
              set: (value: number, model: AppOccurrence) =>
                Object.assign(model.attrs, {
                  number: value,
                  'number-ranges': null,
                }),
              get: (model: AppOccurrence) => model.attrs.number,
              input: 'slider',
              info: 'How many individuals of this type?',
              inputProps: { min: 1, max: 500 },
            },
            {
              set: (value: string, model: AppOccurrence) =>
                Object.assign(model.attrs, {
                  number: null,
                  'number-ranges': value,
                }),
              get: (model: AppOccurrence) => model.attrs['number-ranges'],
              onChange: () => window.history.back(),
              input: 'radio',
              inputProps: { options: numberOptions },
            },
          ],
        },
        remote: { id: 16 },
      },

      'number-ranges': { remote: { id: 523, values: numberOptions } },

      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the life stage.',
            inputProps: { options: stageOptions },
          },
        },
        remote: { id: 106, values: stageOptions },
      },
      sex: {
        menuProps: { icon: genderIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the sex of the organism.',
            inputProps: { options: sexOptions },
          },
        },
        remote: { id: 105, values: sexOptions },
      },
      identifiers: identifiersAttr,
      comment: commentAttr,
    },
    verify(attrs) {
      try {
        Yup.object()
          .shape({
            taxon: Yup.object().nullable().required('Species is missing.'),
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },
  },

  async create(Sample, Occurrence, options) {
    const { image, taxon, skipLocation, skipGPS } = options;

    // default survey
    const occurrence = new Occurrence({ attrs: { taxon } });

    if (image) occurrence.media.push(image);

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: { location: {} },
    });
    sample.occurrences.push(occurrence);

    // append locked attributes
    const defaultSurveyLocks = appModel.attrs.attrLocks.default || {};
    const locks = defaultSurveyLocks.default || {};
    const coreLocks = Object.keys(locks).reduce((agg, key) => {
      if (coreAttributes.includes(key)) {
        (agg as any)[key] = locks[key];
      }
      return agg;
    }, {});

    if (!taxon) {
      // when there is no taxon we don't know the survey yet
      // these are core attributes and safe to reuse in any survey
      appModel.appendAttrLocks(sample, coreLocks);
      sample.startGPS();
      return sample;
    }

    const surveyConfig = sample.getSurvey();
    const speciesGroup = surveyConfig.group || 'default';
    const surveyLocks = defaultSurveyLocks[speciesGroup];
    const fullSurveyLocks = { ...coreLocks, ...surveyLocks };
    appModel.appendAttrLocks(sample, fullSurveyLocks, skipLocation);

    const isLocationLocked = appModel.getAttrLock('smp', 'location');
    if (!isLocationLocked && !skipGPS) {
      sample.startGPS();
    }

    return sample;
  },

  async createWithPhoto(Sample, Occurrence, options) {
    const { image } = options;

    const imageModel = await Media.getImageModel(
      isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
      config.dataPath
    );
    return survey.create(Sample, Occurrence, { image: imageModel as Media });
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
