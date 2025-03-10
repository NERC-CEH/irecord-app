import { object, string } from 'zod';
import gridAlertService from 'common/helpers/gridAlertService';
import { MachineInvolvement } from 'common/models/occurrence';
import appModel from 'models/app';
import AppSample from 'models/sample';
import userModel from 'models/user';
import defaultSurvey from 'Survey/Default/config';
import {
  coreAttributes,
  dateAttr,
  recorderAttr,
  commentAttr,
  Survey,
  activityAttr,
  locationAttr,
  getSystemAttrs,
  groupIdAttr,
  childGeolocationAttr,
  locationAttrValidator,
} from 'Survey/common/config';

function appendLockedAttrs(sample: AppSample) {
  const defaultSurveyLocks = appModel.data.attrLocks.complex || {};
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
    sample.occurrences[0].data.number = 1;
  }
}

const survey: Survey = {
  name: 'list',
  label: 'Species List Survey',
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
            sample.data.date = value;

            const setDate = (smp: AppSample) => {
              // eslint-disable-next-line no-param-reassign
              smp.data.date = value;
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
      const occurrence = new Occurrence({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
        },
      });
      if (images) occurrence.media.push(...images);

      const { groupId } = surveySample.data;

      const sample = new Sample({
        // only top samples should have the store, otherwise sync() will save sub-samples on attr change.
        skipStore: true,
        data: {
          surveyId: defaultSurvey.id, // not list since it looks for taxa specific attrs
          enteredSrefSystem: 4326,
          location: {},
          groupId,
        },
      });

      sample.occurrences.push(occurrence);

      if (taxon) sample.setTaxon(taxon);

      appendLockedAttrs(sample);
      autoIncrementAbundance(sample);

      if (surveySample.data.childGeolocation) {
        const ignoreError = () => {};
        sample.startGPS().catch(ignoreError);
      }

      return sample;
    },

    // occ config is taxa specific
  },

  verify: (attrs: any) =>
    object({
      location: locationAttrValidator({
        name: string({ required_error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
      date: string({ required_error: 'Date is missing.' }).nullable(),
      recorder: string({
        required_error: 'Recorder field is missing.',
      })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(attrs).error,

  create({ Sample, alert }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const groupId = appModel.getAttrLock('smp', 'groupId');

    const sample = new Sample({
      data: {
        surveyId: survey.id,
        date: new Date().toISOString(),
        enteredSrefSystem: 4326,
        location: {},
        recorder,
        groupId,
      },
    });

    const { useGridNotifications } = appModel.data;
    if (useGridNotifications) gridAlertService.start(sample.cid, alert);

    return Promise.resolve(sample);
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    return submission;
  },
};

export default survey;
