import { eyeOffOutline, peopleOutline } from 'ionicons/icons';
import { object, string } from 'zod';
import type {
  OccurrenceData,
  SampleData,
  inferAttrConfigTypes,
} from '@flumens';
import {
  ChoiceInputConf,
  NumberInputConf,
  TextInputConf,
  YesNoInputConf,
} from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import Occurrence, { MachineInvolvement } from 'common/models/occurrence';
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
  locationAttrValidator,
} from 'Survey/common/config';

export { commentAttr, dateAttr, recorderAttr } from 'Survey/common/config';

/** @deprecated */
export const methodAttrOld = {
  id: 'method',
  remote: {
    id: 263,
    values: [
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
    ],
  },
} as const;

export const methodAttr = {
  id: 'smpAttr:263',
  title: 'Method',
  prefix: <IonIcon src={numberIcon} className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'MV light', dataName: '2196' },
    { title: 'LED light', dataName: '17557' },
    { title: 'Actinic light', dataName: '2197' },
    { title: 'Light trapping', dataName: '2198' },
    { title: 'Daytime observation', dataName: '2199' },
    { title: 'Dusking', dataName: '2200' },
    { title: 'Attracted to a lighted window', dataName: '2201' },
    { title: 'Sugaring', dataName: '2202' },
    { title: 'Wine roping', dataName: '2203' },
    { title: 'Beating tray', dataName: '2204' },
    { title: 'Pheromone trap', dataName: '2205' },
    { title: 'Other method (add comment)', dataName: '2206' },
  ],
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const numberAttrOld = {
  id: 'number',
  remote: { id: 133 },
} as const;

export const numberAttr = {
  id: 'occAttr:133',
  title: 'Quantity',
  prefix: <img src={numberIcon} alt="" className="size-6" />,
  type: 'numberInput',
  container: 'page',
  appearance: 'slider',
  description: 'How many individuals of this species did you see?',
  validation: { max: 500 },
} as const satisfies NumberInputConf;

/** @deprecated */
export const sexAttrOld = {
  id: 'sex',
  remote: {
    id: 105,
    values: [
      { value: 'Male', id: 1947 },
      { value: 'Female', id: 1948 },
      { value: 'Mixed', id: 3482 },
    ],
  },
} as const;

export const sexAttr = {
  id: 'occAttr:105',
  title: 'Sex',
  prefix: <img src={genderIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Male', dataName: '1947' },
    { title: 'Female', dataName: '1948' },
    { title: 'Mixed', dataName: '3482' },
  ],
} as const satisfies ChoiceInputConf;

export const mothStageAttr = {
  id: 'occAttr:130',
  title: 'Stage',
  type: 'choiceInput',
  container: 'page',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  choices: [
    { title: 'Not recorded', dataName: '10647' },
    { title: 'Adult', dataName: '2189' },
    { title: 'Larva', dataName: '2190' },
    { title: 'Larval web', dataName: '2191' },
    { title: 'Larval case', dataName: '2192' },
    { title: 'Mine', dataName: '2193' },
    { title: 'Egg', dataName: '2194' },
    { title: 'Egg batch', dataName: '2195' },
    { title: 'Pupa', dataName: '17556' },
  ],
  validation: { required: true },
  description:
    'Please indicate the stage of the organism. If you are recording larvae, cases or leaf-mines please add the foodplant in to the comments field, as this is often needed to verify the records.',
} as const satisfies ChoiceInputConf;

export const mothIdentifiersAttr = {
  id: 'occAttr:18',
  title: 'Identified by',
  type: 'textInput',
  container: 'page',
  multiple: true,
  placeholder: 'Name',
  prefix: <IonIcon src={peopleOutline} className="size-6" />,
  description:
    'If another person identified the species for you, please enter their name here.',
} as const satisfies TextInputConf;

const mothSensitivityPrecisionAttr = {
  id: 'sensitivityPrecision',
  title: 'Sensitive',
  type: 'yesNoInput',
  prefix: <IonIcon src={eyeOffOutline} className="size-6" />,
  choices: [{ dataName: '' }, { dataName: '1000' }],
} as const satisfies YesNoInputConf;

const SURVEY_ID = 90;
const SURVEY_WEBFORM = 'enter-moth-sightings';

const attrs = {
  [locationAttr.id]: locationAttr,
  [dateAttr.id]: { block: dateAttr },
  [recorderAttr.id]: { block: recorderAttr },
  [methodAttr.id]: { block: methodAttr },
  [commentAttr.id]: { block: commentAttr },
};

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [numberAttr.id]: { block: numberAttr },
  [mothStageAttr.id]: { block: mothStageAttr },
  [sexAttr.id]: { block: sexAttr },
  [mothIdentifiersAttr.id]: { block: mothIdentifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [mothSensitivityPrecisionAttr.id]: { block: mothSensitivityPrecisionAttr },
};

export type Data = SampleData & inferAttrConfigTypes<typeof attrs>;
export type OccData = OccurrenceData & inferAttrConfigTypes<typeof occAttrs>;

const survey = {
  name: 'moth',
  label: 'Moth List Survey',
  id: SURVEY_ID,

  taxaGroups: [groups.moth],

  webForm: SURVEY_WEBFORM,

  attrs,

  occ: {
    render: [
      taxonAttr,
      numberAttr,
      mothStageAttr,
      sexAttr,
      mothIdentifiersAttr,
      mothSensitivityPrecisionAttr,
      commentAttr,
    ],

    attrs: occAttrs,

    verify: (values: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [mothStageAttr.id]: string({ error: 'Stage is missing.' }).nullable(),
      }).safeParse(values).error,

    create({ taxon, images }) {
      const newOccurrence = new Occurrence({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
          [numberAttr.id]: 1,
        },
      });
      if (images) newOccurrence.media.push(...images);

      const locks = appModel.locks.getAll('moth');
      Object.assign(newOccurrence.data, locks.occ);

      return newOccurrence;
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
      [methodAttr.id]: string({ error: 'Method is missing.' })
        .min(1, 'Method is missing.')
        .nullable(),
      [recorderAttr.id]: string({ error: 'Recorder field is missing.' })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(values).error,

  create() {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample<Data>({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: undefined, // user should specify the trap time
        enteredSrefSystem: 4326,
        location: {},
      },
    });
    sample.data[recorderAttr.id] = recorder;

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
