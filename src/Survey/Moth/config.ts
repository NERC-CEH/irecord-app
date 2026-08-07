import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import { MachineInvolvement } from 'common/models/occurrence';
import Sample from 'common/models/sample';
import appModel from 'models/app';
import userModel from 'models/user';
import {
  recorderAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  dateAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  mothStageAttr,
  sensitivityPrecisionAttr,
  locationAttrValidator,
} from 'Survey/common/config';

export { commentAttr, dateAttr, recorderAttr } from 'Survey/common/config';

const sex = [
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const methodOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'MV light', id: 2196 },
  { value: 'LED light', id: 17557 },
  { value: 'Actinic light', id: 2197 },
  { value: 'Light trapping', id: 2198 },
  { value: 'Daytime observation', id: 2199 },
  { value: 'Dusking', id: 2200 },
  { value: 'Attracted to a lighted window', id: 2201 },
  { value: 'Sugaring', id: 2202 },
  { value: 'Wine roping', id: 2203 },
  { value: 'Beating tray', id: 2204 },
  { value: 'Pheromone trap', id: 2205 },
  { value: 'Other method (add comment)', id: 2206 },
];

export const methodAttr = {
  id: 'method',
  menuProps: { icon: numberIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please enter your sampling method (i.e. type of trap or recording method).',
      inputProps: { options: methodOptions },
    },
  },
  remote: { id: 263, values: methodOptions },
} as const;

export const numberAttr = {
  id: 'number',
  menuProps: { icon: numberIcon, label: 'Quantity' },
  pageProps: {
    headerProps: { title: 'Quantity' },
    attrProps: {
      input: 'slider',
      info: 'How many individuals of this species did you see?',
      inputProps: {
        inputProps: { max: 500 },
      },
    },
  },

  remote: { id: 133 },
} as const;

export const sexAttr = {
  id: 'sex',
  menuProps: { icon: genderIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      info: 'Please indicate the sex of the organism.',
      inputProps: { options: sex },
    },
  },
  remote: { id: 105, values: sex },
} as const;

const mothSensitivityPrecisionAttr = {
  id: 'sensitivityPrecision',
  ...sensitivityPrecisionAttr(1000),
} as const;

const SURVEY_ID = 90;
const SURVEY_WEBFORM = 'enter-moth-sightings';

const survey = {
  name: 'moth',
  label: 'Moth List Survey',
  id: SURVEY_ID,

  taxaGroups: [groups.moth],

  webForm: SURVEY_WEBFORM,

  attrs: {
    [locationAttr.id]: locationAttr,
    [dateAttr.id]: { block: dateAttr },
    [recorderAttr.id]: recorderAttr,
    [methodAttr.id]: methodAttr,
    [commentAttr.id]: { block: commentAttr },
  },

  occ: {
    render: [
      taxonAttr,
      numberAttr,
      mothStageAttr,
      sexAttr,
      identifiersAttr,
      mothSensitivityPrecisionAttr,
      commentAttr,
    ],

    attrs: {
      [taxonAttr.id]: taxonAttr,
      [numberAttr.id]: numberAttr,
      [mothStageAttr.id]: mothStageAttr,
      [sexAttr.id]: sexAttr,
      [identifiersAttr.id]: identifiersAttr,
      [commentAttr.id]: { block: commentAttr },
      [mothSensitivityPrecisionAttr.id]: mothSensitivityPrecisionAttr,
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        stage: string({ error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,

    create({ Occurrence, taxon, images }) {
      const newOccurrence = new Occurrence({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
          number: 1,
        },
      });
      if (images) newOccurrence.media.push(...images);

      const locks = appModel.data.attrLocks.complex.moth || {};
      appModel.appendAttrLocks(newOccurrence, locks);
      return newOccurrence;
    },
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
      method: string({ error: 'Method is missing.' })
        .min(1, 'Method is missing.')
        .nullable(),
      recorder: string({ error: 'Recorder field is missing.' })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(attrs).error,

  create() {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: undefined, // user should specify the trap time
        enteredSrefSystem: 4326,
        location: {},
        recorder,
      },
    });

    const ignoreErrors = () => {};
    sample.startGPS().catch(ignoreErrors);

    return Promise.resolve(sample);
  },

  modifySubmission(submission: any) {
    Object.assign(submission.values, {
      ...getSystemAttrs(),

      // email must be added to submissions
      'smpAttr:8': userModel.data.email,
    });

    return submission;
  },
} as const satisfies Survey;

export default survey;
