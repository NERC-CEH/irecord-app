import { object, string } from 'zod';
import {
  dateFormatISO,
  type SampleData,
  type inferAttrConfigTypes,
} from '@flumens';
import gridAlertService from 'common/helpers/gridAlertService';
import Occurrence, { MachineInvolvement } from 'common/models/occurrence';
import appModel from 'models/app';
import Sample from 'models/sample';
import userModel from 'models/user';
import defaultSurvey, { getTaxaGroupSurvey } from 'Survey/Default/config';
import {
  recorderAttr,
  commentAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  groupIdAttr,
  childGeolocationAttr,
  locationAttrValidator,
  dateAttr,
} from 'Survey/common/config';

export {
  sensitivityPrecisionAttr,
  commentAttr,
  groupIdAttr,
} from 'Survey/common/config';
export { defaultSensitivityPrecisionAttr } from 'Survey/Default/config';

const getTaxon = (sample: Sample) => sample.getSurvey().taxa || null;

const SURVEY_ID = 576;
const SURVEY_WEBFORM = 'enter-app-record-list';

const attrs = {
  [locationAttr.id]: locationAttr,
  [childGeolocationAttr.id]: { block: childGeolocationAttr },
  [recorderAttr.id]: { block: recorderAttr },
  [commentAttr.id]: { block: commentAttr },
  [groupIdAttr.id]: groupIdAttr,
  [dateAttr.id]: { block: dateAttr },
};

export type Data = SampleData & inferAttrConfigTypes<typeof attrs>;

const survey = {
  name: 'list',
  label: 'Species List Survey',
  id: SURVEY_ID,

  webForm: SURVEY_WEBFORM,

  attrs,

  smp: {
    async create({ taxon, images, surveySample }) {
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

      const taxonSurvey = taxon ? getTaxaGroupSurvey(taxon.group) : undefined;
      const createOccurrence =
        taxonSurvey?.occ?.create ?? survey.smp.occ.create;
      const occurrence = await createOccurrence({
        images: images!,
        taxon,
        isListSurvey: true,
      });

      sample.occurrences.push(occurrence);

      if (taxon) sample.setTaxon(taxon, occurrence.id, true);

      const locks = appModel.locks.getAll('list', getTaxon(sample));
      Object.assign(sample.data, locks.smp);

      if (surveySample.data.childGeolocation) sample.startGPS().catch(() => {});

      return sample;
    },

    occ: {
      attrs: {
        // occ config is taxa specific
      },

      async create({ images, taxon }) {
        const occurrence = new Occurrence({
          data: {
            machineInvolvement: MachineInvolvement.NONE,
            taxon,
          },
          media: images,
        });

        if (taxon) {
          const taxa = getTaxaGroupSurvey(taxon.group)?.taxa || 'default';
          const locks = appModel.locks.getAll('list', taxa);
          Object.assign(occurrence.data, locks.occ);
        }

        return occurrence;
      },
    },
  },

  verify: (values: any) =>
    object({
      location: locationAttrValidator(),
      locationName: string({ error: 'Location name is missing' }).min(
        1,
        'Location name is missing'
      ),
      date: string({ error: 'Date is missing.' }).nullable(),
      [recorderAttr.id]: string({
        error: 'Recorder field is missing.',
      })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(values).error,

  create({ alert }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    // get the groupId from the appModel, which is locked to the default value for this survey
    const groupId = appModel.locks.get('default', 'all', 'smp', 'groupId');

    const sample = new Sample<Data>({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: dateFormatISO.format(new Date()),
        enteredSrefSystem: 4326,
        location: {},
        groupId,
      },
    });
    sample.data[recorderAttr.id] = recorder;

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
