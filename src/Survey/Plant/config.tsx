/* eslint-disable no-param-reassign */
import {
  peopleOutline,
  businessOutline,
  pencilOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { object, array, string } from 'zod';
import {
  InfoButton,
  type OccurrenceData,
  type SampleData,
  type inferAttrConfigTypes,
} from '@flumens';
import {
  ChoiceInputConf,
  TextInputConf,
  YesNoInputConf,
} from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import VCs from 'common/data/vice_counties.data.json';
import gridAlertService from 'common/helpers/gridAlertService';
import numberIcon from 'common/images/number.svg';
import Sample from 'common/models/sample';
import appModel from 'models/app';
import Occurrence, { MachineInvolvement } from 'models/occurrence';
import userModel from 'models/user';
import {
  dateAttr,
  commentAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  taxonAttr,
  childGeolocationAttr,
  locationAttrValidator,
  plantStageAttr,
} from 'Survey/common/config';

export {
  commentAttr,
  dateAttr,
  childGeolocationAttr,
} from 'Survey/common/config';

const plantLocationAttr = {
  ...locationAttr,
  id: 'location',
  menuProps: { label: 'Square' },
  remote: {
    id: 'entered_sref',
    values(location: any, submission: any) {
      // eslint-disable-next-line no-param-reassign
      submission.values.location_name = location.name; // this is a native indicia attr
      return location.gridref;
    },
  },
} as const;

const getRecorderCount = (recorders: any[]) => {
  if (recorders.length === 1) return 7299;
  if (recorders.length === 2) return 7300;
  if (recorders.length <= 5) return 7301;
  if (recorders.length <= 10) return 7302;
  if (recorders.length <= 20) return 7303;
  return 7304;
};

export const recordersCountAttr = { id: 'smpAttr:992' };

export const recordersAttr = {
  id: 'smpAttr:1018',
  title: 'Recorders',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'textInput',
  container: 'page',
  multiple: true,
  placeholder: 'Recorder name',
  description:
    'If anyone helped with documenting the record please enter their name here.',
  onChange: (_, __, { record }) => {
    const data = record;
    const recorders = data['smpAttr:1018'] || [];
    data[recordersCountAttr.id] = recorders.length
      ? getRecorderCount(recorders)
      : null;
  },
} as const satisfies TextInputConf;

export const viceCountyAttr = {
  id: 'smpAttr:991',
  title: 'Vice County',
  prefix: <IonIcon icon={businessOutline} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  appearance: 'list',
  choices: VCs.map((vc: any) => ({ title: vc.name, dataName: `${vc.id}` })),
  onChange: (val, op, { record }) => {
    record[viceCountyAttr.id] = val;

    const VC = VCs.find(vc => vc.id == val); // eslint-disable-line eqeqeq
    if (!VC) return;

    record[`${viceCountyAttr.id}:name`] = VC.name;
  },
} as const satisfies ChoiceInputConf;

const plantSmpLocationAttr = {
  ...locationAttr,
  id: 'location',
  remote: {
    id: 'entered_sref',
    values(location: any, submission: any) {
      // eslint-disable-next-line no-param-reassign
      submission.values.location_name = location.name; // this is a native indicia attr
      return location.gridref;
    },
  },
} as const;

export const abundanceAttr = {
  id: 'occAttr:610',
  title: 'Abundance',
  prefix: <IonIcon src={numberIcon} className="size-6" />,
  type: 'textInput',
  container: 'page',
  description: (
    <T>
      Abundance (DAFOR, LA, LF or count).
      <InfoButton label="READ MORE" header="Info" color="tertiary">
        <p>
          DAFOR refers to a subjective abundance scale comprising the following
          ordered terms: <b>D</b>ominant / <b>A</b>
          bundant / <b>F</b>requent / <b>O</b>ccasional / <b>R</b>
          are. The prefix "Locally" can also be used with the Abundant and
          Frequent classes (e.g. LA = Locally Abundant).
        </p>
        <p>
          Assessed abundance should either relate to the scale of the survey
          (e.g. 1 or 2 km grid squares), or be clearly qualified in the record
          comments field.
        </p>
      </InfoButton>
    </T>
  ),
  validation: { pattern: '^(\\d+|[DAFORdafor]|[Ll][Aa]|[Ll][Ff])$' },
  onChange: (val, op, { record }) => {
    record[abundanceAttr.id] = val.toUpperCase();
  },
} as const satisfies TextInputConf;

// remove after migration is complete
/** @deprecated */
export const statusAttrOld = {
  id: 'status',
  remote: {
    id: 507,
    values: [
      { label: 'Not Recorded', value: null, isDefault: true },
      { value: 'Native', id: 5709 },
      { value: 'Unknown', id: 5710 },
      { value: 'Introduced', id: 6775 },
      { value: 'Introduced - planted', id: 5711 },
      { value: 'Introduced - surviving', id: 10662 },
      { value: 'Introduced - casual', id: 10663 },
      { value: 'Introduced - established', id: 5712 },
      { value: 'Introduced - invasive', id: 5713 },
    ],
  },
};

export const statusAttr = {
  id: 'occAttr:507',
  title: 'Status',
  prefix: <IonIcon src={pencilOutline} className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'Native', dataName: '5709' },
    { title: 'Unknown', dataName: '5710' },
    { title: 'Introduced', dataName: '6775' },
    { title: 'Introduced - planted', dataName: '5711' },
    { title: 'Introduced - surviving', dataName: '10662' },
    { title: 'Introduced - casual', dataName: '10663' },
    { title: 'Introduced - established', dataName: '5712' },
    { title: 'Introduced - invasive', dataName: '5713' },
  ],
} as const satisfies ChoiceInputConf;

export const plantOccIdentifiersAttr = {
  id: 'occAttr:125',
  title: 'Identified by',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'textInput',
  container: 'page',
  multiple: true,
  placeholder: 'Name',
  description:
    'If another person identified the species for you, please enter their name here.',
} as const satisfies TextInputConf;

const plantSensitivityPrecisionAttr = {
  id: 'sensitivityPrecision',
  title: 'Sensitive',
  prefix: <IonIcon icon={eyeOffOutline} className="size-6" />,
  type: 'yesNoInput',
  onChange: (_, __, { record }) => {
    const data = record;
    data.sensitivityPrecision = data.sensitivityPrecision ? 2000 : '';
  },
} as const satisfies YesNoInputConf;

const SURVEY_ID = 325;
const SURVEY_WEBFORM = 'enter-vascular-plants';

const attrs = {
  [dateAttr.id]: { block: dateAttr },
  [plantLocationAttr.id]: plantLocationAttr,
  [childGeolocationAttr.id]: { block: childGeolocationAttr },
  [recordersAttr.id]: { block: recordersAttr },
  [viceCountyAttr.id]: { block: viceCountyAttr },
  [commentAttr.id]: { block: commentAttr },
};

const smpAttrs = {
  [dateAttr.id]: { block: dateAttr },
  [plantSmpLocationAttr.id]: plantSmpLocationAttr,
};

const smpOccAttrs = {
  [taxonAttr.id]: taxonAttr,
  [abundanceAttr.id]: { block: abundanceAttr },
  [statusAttr.id]: { block: statusAttr },
  [plantStageAttr.id]: { block: plantStageAttr },
  [plantOccIdentifiersAttr.id]: { block: plantOccIdentifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [plantSensitivityPrecisionAttr.id]: {
    block: plantSensitivityPrecisionAttr,
  },
};

export type Data = SampleData &
  inferAttrConfigTypes<typeof attrs> & { location?: any };
export type SmpData = SampleData & inferAttrConfigTypes<typeof smpAttrs>;
export type OccData = OccurrenceData & inferAttrConfigTypes<typeof smpOccAttrs>;

const survey = {
  name: 'plant',
  label: 'Plant List Survey',
  id: SURVEY_ID,
  webForm: SURVEY_WEBFORM,

  taxaGroups: [
    groups['flower. plant'],
    groups.clubmoss,
    groups.fern,
    groups.horsetail,
    groups.conifer,
    groups.stonewort,
    groups.moss,
    groups.liverwort,
  ],

  attrs,

  smp: {
    attrs: smpAttrs,

    occ: {
      render: [
        statusAttr,
        plantStageAttr,
        abundanceAttr,
        plantOccIdentifiersAttr,
        plantSensitivityPrecisionAttr,
        commentAttr,
      ],
      attrs: smpOccAttrs,

      verify: (values: any) =>
        object({
          taxon: object({}, { error: 'Species is missing.' }).nullable(),
        }).safeParse(values).error,

      modifySubmission(submission: any, occ: Occurrence) {
        return { ...submission, ...occ.getClassifierSubmission() };
      },
    },

    async create({ taxon, images, surveySample }) {
      const { gridSquareUnit } = appModel.data;

      const sample = new Sample<Data>({
        // only top samples should have the store, otherwise sync() will save sub-samples on attr change.
        skipStore: true,

        metadata: { gridSquareUnit },
        data: {
          surveyId: SURVEY_ID,
          inputForm: SURVEY_WEBFORM,
          enteredSrefSystem: 'OSGB',
          location: {},
        },
      });

      const occurrence = new Occurrence({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
        },
      });
      if (images) occurrence.media.push(...images);

      sample.occurrences.push(occurrence);

      const locks = appModel.data.attrLocks.complex.plant || {};
      appModel.appendAttrLocks(sample, locks);

      if (surveySample.data.childGeolocation) {
        const ignoreError = () => {};
        sample.startGPS().catch(ignoreError);
      }

      return sample;
    },
  },

  verify: (values: any) =>
    object({
      location: locationAttrValidator({
        name: string({ error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
      [recordersAttr.id]: array(string(), {
        error: 'Recorders field is missing.',
      })
        .min(1)
        .nullable(),
    }).safeParse(values).error,

  create({ alert }) {
    const { gridSquareUnit, useGridNotifications } = appModel.data;

    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.isLoggedIn()) {
      recorders.push(userModel.getPrettyName());
    }

    const sample = new Sample({
      metadata: {
        gridSquareUnit,
      },
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: new Date().toISOString().split('T')[0],
        enteredSrefSystem: 'OSGB',
        sampleMethodId: 7305,
        [recordersAttr.id]: recorders,
        [recordersCountAttr.id]: recorders.length
          ? getRecorderCount(recorders)
          : null,
      } as any,
    });

    if (useGridNotifications) gridAlertService.start(sample.cid, alert);

    return Promise.resolve(sample);
  },

  modifySubmission(submission: any) {
    Object.assign(submission.values, getSystemAttrs());

    return submission;
  },
} as const satisfies Survey;

export default survey;
