import { calendarOutline } from 'ionicons/icons';
import { object, string } from 'zod';
import { dateFormat } from '@flumens';
import gridAlertService from 'common/helpers/gridAlertService';
import Occurrence, { MachineInvolvement } from 'common/models/occurrence';
import appModel from 'models/app';
import Sample from 'models/sample';
import userModel from 'models/user';
import defaultSurvey from 'Survey/Default/config';
import {
  coreAttributes,
  recorderAttr,
  commentAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  groupIdAttr,
  childGeolocationAttr,
  locationAttrValidator,
} from 'Survey/common/config';

export {
  sensitivityPrecisionAttr,
  commentAttr,
  groupIdAttr,
} from 'Survey/common/config';
export { defaultSensitivityPrecisionAttr } from 'Survey/Default/config';

function appendLockedAttrs(sample: Sample) {
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

function autoIncrementAbundance(sample: Sample) {
  const sampleSurvey = sample.getSurvey();
  const { skipAutoIncrement } = sampleSurvey.occ || {};
  const locks = appModel.getAllLocks(sample);
  const isNumberLocked = locks['occ:number'];

  if (!isNumberLocked && !skipAutoIncrement) {
    // eslint-disable-next-line no-param-reassign
    sample.occurrences[0].data.number = 1;
  }
}

const dateAttr = {
  id: 'date',
  menuProps: {
    icon: calendarOutline,
    attrProps: {
      input: 'date',
      inputProps: {
        max: () => new Date(),
        label: 'Date',
        icon: calendarOutline,
        autoFocus: false,
        usePrettyDates: true,
        presentation: 'date',
      },
    },
  },

  /** @deprecated  TODO: keep it backwards compatible, remove in the future once everyone uploads their records */
  values: (date: any) => dateFormat.format(new Date(date)),
} as const;

const SURVEY_ID = 576;
const SURVEY_WEBFORM = 'enter-app-record-list';

const survey = {
  name: 'list',
  label: 'Species List Survey',
  id: SURVEY_ID,

  webForm: SURVEY_WEBFORM,

  attrs: {
    [locationAttr.id]: locationAttr,
    [childGeolocationAttr.id]: { block: childGeolocationAttr },
    [recorderAttr.id]: recorderAttr,
    [commentAttr.id]: { block: commentAttr },
    [groupIdAttr.id]: groupIdAttr,

    date: {
      ...dateAttr,
      menuProps: {
        ...dateAttr.menuProps,
        attrProps: {
          ...dateAttr.menuProps.attrProps,

          set: (value: string, sample: Sample) => {
            // eslint-disable-next-line no-param-reassign
            sample.data.date = value;

            const setDate = (smp: Sample) => {
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
    async create({ taxon, images, surveySample }) {
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
        metadata: {
          forceSurveyId: defaultSurvey.id, // not list since it looks for taxa specific attrs
        },
        data: {
          surveyId: SURVEY_ID,
          inputForm: SURVEY_WEBFORM,
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
        name: string({ error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
      date: string({ error: 'Date is missing.' }).nullable(),
      recorder: string({
        error: 'Recorder field is missing.',
      })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(attrs).error,

  create({ alert }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const groupId = appModel.getAttrLock('smp', 'groupId');

    const sample = new Sample({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: new Date().toISOString().split('T')[0],
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
} as const satisfies Survey;

export default survey;
