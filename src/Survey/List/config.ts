import appModel from 'models/app';
import userModel from 'models/user';
import {
  coreAttributes,
  dateAttr,
  recordersAttr,
  commentAttr,
  verifyLocationSchema,
  Survey,
  activityAttr,
  locationAttr,
  getSystemAttrs,
  makeSubmissionBackwardsCompatible,
  assignParentLocationIfMissing,
} from 'Survey/common/config';
import AppSample from 'models/sample';
import * as Yup from 'yup';

function appendLockedAttrs(sample: AppSample) {
  const defaultSurveyLocks = appModel.attrs.attrLocks.complex || {};
  const locks = defaultSurveyLocks['default-default'] || {}; // bypassing the API here!
  const coreLocks = Object.keys(locks).reduce((agg, key) => {
    if (coreAttributes.includes(key)) {
      // eslint-disable-next-line no-param-reassign
      (agg as any)[key] = locks[key];
    }
    return agg;
  }, {});

  const surveyLocks = appModel.getAllLocks(sample);

  const fullSurveyLocks = { ...coreLocks, ...surveyLocks };

  appModel.appendAttrLocks(sample, fullSurveyLocks, true);
}

function autoIncrementAbundance(sample: AppSample) {
  const sampleSurvey = sample.getSurvey();
  const { skipAutoIncrement } = sampleSurvey.occ || {};
  const locks = appModel.getAllLocks(sample);
  const isNumberLocked = locks['occ:number'];

  if (!isNumberLocked && !skipAutoIncrement) {
    // eslint-disable-next-line no-param-reassign
    sample.occurrences[0].attrs.number = 1;
  }
}

const survey: Survey = {
  name: 'list',
  label: 'General',
  id: 576,

  webForm: 'enter-app-record-list',

  render: ['smp:location', 'smp:date', 'smp:recorders', 'smp:comment'],

  attrs: {
    location: locationAttr,

    recorders: recordersAttr,

    comment: commentAttr,

    activity: activityAttr,

    date: {
      ...dateAttr,
      menuProps: {
        ...dateAttr.menuProps,
        attrProps: {
          ...dateAttr.menuProps.attrProps,

          set: (value: string, sample: AppSample) => {
            // eslint-disable-next-line no-param-reassign
            sample.attrs.date = value;

            const setDate = (smp: AppSample) => {
              // eslint-disable-next-line no-param-reassign
              smp.attrs.date = value;
            };
            sample.samples.forEach(setDate);
            sample.save();
          },
        },
      },
    },
  },

  smp: {
    async create(Sample, Occurrence, options) {
      const { taxon, surveySample, skipGPS = false } = options;

      const occurrence = new Occurrence();
      const { activity } = surveySample.attrs;
      const sample = new Sample({
        metadata: {
          survey_id: survey.id,
          survey: 'default', // not list since it looks for taxa specific attrs
        },
        attrs: {
          date: surveySample.attrs.date,
          location: {},
          activity,
        },
      });
      sample.occurrences.push(occurrence);

      sample.setTaxon(taxon);

      appendLockedAttrs(sample);
      autoIncrementAbundance(sample);

      const ignoreErrors = () => {};
      if (!skipGPS && appModel.attrs.geolocateSurveyEntries)
        sample.startGPS().catch(ignoreErrors);

      return sample;
    },

    modifySubmission(submission, sample) {
      assignParentLocationIfMissing(submission, sample);

      makeSubmissionBackwardsCompatible(submission, survey);

      return submission;
    },

    // occ config is taxa specific
  },

  verify(attrs) {
    try {
      Yup.object()
        .shape({
          location: verifyLocationSchema,
          recorders: Yup.array()
            .of(Yup.string())
            .min(1, 'Recorders field is missing.'),
        })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create(Sample) {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.isLoggedIn()) {
      recorders.push(userModel.getPrettyName());
    }

    const activity = appModel.getAttrLock('smp', 'activity');

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: {
        location: {},
        recorders,
        activity,
      },
    });

    return Promise.resolve(sample);
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
