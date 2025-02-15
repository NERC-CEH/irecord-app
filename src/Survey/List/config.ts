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
  groupIdAttr,
  childGeolocationAttr,
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

  render: [
    'smp:location',
    'smp:childGeolocation',
    'smp:date',
    'smp:recorder',
    'smp:comment',
  ],

  attrs: {
    location: locationAttr,

    childGeolocation: childGeolocationAttr,

    recorder: recorderAttr,

    /** @deprecated */
    recorders: recorderAttr,

    comment: commentAttr,

    /** @deprecated */
    activity: activityAttr,

    groupId: groupIdAttr,

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
    async create({ Sample, Occurrence, taxon, images, surveySample }) {
      const occurrence = new Occurrence();
      if (images) occurrence.media.push(...images);

      const { groupId } = surveySample.attrs;

      const sample = new Sample({
        isSubSample: true,

        metadata: {
          survey_id: survey.id,
          survey: 'default', // not list since it looks for taxa specific attrs
        },
        attrs: {
          enteredSrefSystem: 4326,
          location: {},
          groupId,
        },
      });

      sample.occurrences.push(occurrence);

      if (taxon) sample.setTaxon(taxon);

      appendLockedAttrs(sample);
      autoIncrementAbundance(sample);

      if (surveySample.attrs.childGeolocation) {
        const ignoreError = () => {};
        sample.startGPS().catch(ignoreError);
      }

      return sample;
    },

    modifySubmission(submission) {
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

    const groupId = appModel.getAttrLock('smp', 'groupId');

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: {
        date: new Date().toISOString(),
        enteredSrefSystem: 4326,
        location: {},
        recorder,
        groupId,
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
