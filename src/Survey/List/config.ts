import * as Yup from 'yup';
import gridAlertService from 'common/helpers/gridAlertService';
import appModel from 'models/app';
import AppSample from 'models/sample';
import userModel from 'models/user';
import {
  coreAttributes,
  dateAttr,
  recorderAttr,
  commentAttr,
  verifyLocationSchema,
  Survey,
  activityAttr,
  locationAttr,
  getSystemAttrs,
  makeSubmissionBackwardsCompatible,
  assignParentLocationIfMissing,
} from 'Survey/common/config';

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
  label: 'Species List',
  id: 576,

  webForm: 'enter-app-record-list',

  render: ['smp:location', 'smp:date', 'smp:recorder', 'smp:comment'],

  attrs: {
    location: locationAttr,

    recorder: recorderAttr,
    /** @deprecated */
    recorders: recorderAttr,

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
    async create({ Sample, Occurrence, taxon, surveySample, skipGPS = false }) {
      const occurrence = new Occurrence();

      const { activity } = surveySample.attrs;

      const sample = new Sample({
        isSubSample: true,

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
          // TODO: re-enable in future versions after everyone uploads
          // recorder: Yup.string().nullable().required('Recorder field is missing.'),
        })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create({ Sample, alert }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const activity = appModel.getAttrLock('smp', 'activity');

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: {
        location: {},
        recorder,
        activity,
      },
    });

    const { useGridNotifications } = appModel.attrs;
    if (useGridNotifications) gridAlertService.start(sample.cid, alert);

    return Promise.resolve(sample);
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
