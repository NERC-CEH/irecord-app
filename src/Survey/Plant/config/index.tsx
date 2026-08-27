/* eslint-disable no-param-reassign */
import {
  peopleOutline,
  businessOutline,
  pencilOutline,
  eyeOffOutline,
  timeOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { object, array, string } from 'zod';
import {
  InfoButton,
  dateFormatISO,
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
import bryophytesSurvey from './bryophytes';
import plantOccIdentifiersAttr, { altitudeAttr } from './common';

export {
  commentAttr,
  dateAttr,
  childGeolocationAttr,
} from 'Survey/common/config';
export { altitudeAttr, default as plantOccIdentifiersAttr } from './common';

const plantLocationAttr = {
  ...locationAttr,
  id: 'location',
  menuProps: { label: 'Square' },
  remote: {
    id: 'entered_sref',
    values(location: any) {
      return location.gridref;
    },
  },
} as const;

const singleRecorderValue = '7299';

export const recordersCountAttr = {
  id: 'smpAttr:992',
  title: 'No. of recorders',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  appearance: 'list',
  description: 'Total number of recorders',
  validation: { required: true },
  choices: [
    { title: 'Not selected', dataName: '' },
    { title: '1', dataName: singleRecorderValue },
    { title: '2', dataName: '7300' },
    { title: '3-5', dataName: '7301' },
    { title: '6-10', dataName: '7302' },
    { title: '11-20', dataName: '7303' },
    { title: '21+', dataName: '7304' },
  ],
} as const satisfies ChoiceInputConf;

export const timeSurveyingAttr = {
  id: 'smpAttr:993',
  title: 'Time surveying',
  prefix: <IonIcon icon={timeOutline} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  appearance: 'list',
  choices: [
    { title: 'Not selected', dataName: '' },
    { title: '29 mins or less', dataName: '7468' },
    { title: '30 to 59 mins', dataName: '7469' },
    { title: '1h - 1h29mins', dataName: '7470' },
    { title: '1h30mins - 1h59mins', dataName: '7471' },
    { title: '2h - 2h29mins', dataName: '7472' },
    { title: '2h30mins -2h59mins', dataName: '7473' },
    { title: '3h - 3h29mins', dataName: '7474' },
    { title: '3h30mins - 3h59mins', dataName: '7475' },
    { title: '4h - 4h29mins', dataName: '7476' },
    { title: '4h30mins - 4h59mins', dataName: '7477' },
    { title: '5h - 5h29mins', dataName: '7478' },
    { title: '5h30mins - 5h59mins', dataName: '7479' },
    { title: '6h - 6h29mins', dataName: '7480' },
    { title: '6h30mins - 6h59mins', dataName: '7481' },
    { title: '7h - 7h29mins', dataName: '7482' },
    { title: '7h30mins - 7h59mins', dataName: '7483' },
    { title: '8h - 8h29mins', dataName: '7484' },
    { title: '8h30mins - 8h59mins', dataName: '7485' },
    { title: '9h - 9h29mins', dataName: '7486' },
    { title: '9h30mins - 9h59mins', dataName: '7487' },
    { title: '10hrs or longer', dataName: '7488' },
  ],
} as const satisfies ChoiceInputConf;

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
    values(location: any) {
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
    { title: 'Native - origin unknown', dataName: '17548' },
    { title: 'Introduced - accidental', dataName: '17549' },
    { title: 'Introduced - accidental - regenerating', dataName: '17550' },
    { title: 'Introduced - intentional', dataName: '17551' },
    { title: 'Introduced - intentional - regenerating', dataName: '17552' },
    { title: 'Introduced - origin unknown', dataName: '17553' },
    {
      title: 'Introduced - origin unknown - regenerating',
      dataName: '17554',
    },

    // hidden choices for legacy records
    { title: 'Native', dataName: '5709', className: 'hidden' },
    { title: 'Unknown', dataName: '5710', className: 'hidden' },
    { title: 'Introduced', dataName: '6775', className: 'hidden' },
    { title: 'Introduced - planted', dataName: '5711', className: 'hidden' },
    { title: 'Introduced - surviving', dataName: '10662', className: 'hidden' },
    { title: 'Introduced - casual', dataName: '10663', className: 'hidden' },
    {
      title: 'Introduced - established',
      dataName: '5712',
      className: 'hidden',
    },
    { title: 'Introduced - invasive', dataName: '5713', className: 'hidden' },
  ],
} as const satisfies ChoiceInputConf;

export const plantSensitivityPrecisionAttr = {
  id: 'sensitivityPrecision',
  title: 'Sensitive',
  prefix: <IonIcon icon={eyeOffOutline} className="size-6" />,
  type: 'yesNoInput',
  choices: [{ dataName: '' }, { dataName: '2000' }],
} as const satisfies YesNoInputConf;

const SURVEY_ID = 325;
const SURVEY_WEBFORM = 'enter-vascular-plants';

const attrs = {
  [dateAttr.id]: { block: dateAttr },
  [plantLocationAttr.id]: plantLocationAttr,
  [childGeolocationAttr.id]: { block: childGeolocationAttr },
  [recordersAttr.id]: { block: recordersAttr },
  [recordersCountAttr.id]: { block: recordersCountAttr },
  [timeSurveyingAttr.id]: { block: timeSurveyingAttr },
  [viceCountyAttr.id]: { block: viceCountyAttr },
  [commentAttr.id]: { block: commentAttr },
};

const smpAttrs = {
  [dateAttr.id]: { block: dateAttr },
  [plantSmpLocationAttr.id]: plantSmpLocationAttr,
};

const smpOccAttrs = {
  [taxonAttr.id]: taxonAttr,
  [altitudeAttr.id]: { block: altitudeAttr },
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

  get(sample: Sample) {
    if (!sample.occurrences.length) return this;

    const taxaGroup = sample.occurrences[0].data.taxon?.group;
    const taxaSurvey =
      taxaGroup !== undefined &&
      bryophytesSurvey.taxaGroups?.includes(taxaGroup)
        ? bryophytesSurvey
        : { taxa: 'default' };

    return {
      ...this.smp,
      ...taxaSurvey,
      attrs: {
        ...this.smp?.attrs,
        ...taxaSurvey.attrs,
      },
      occ: {
        ...this.smp?.occ,
        ...taxaSurvey.occ,
      },
    } as unknown as Survey;
  },

  smp: {
    attrs: smpAttrs,

    occ: {
      render: [
        statusAttr,
        plantStageAttr,
        abundanceAttr,
        plantOccIdentifiersAttr,
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

      const { taxa } = sample.getSurvey();
      const locks = appModel.locks.getAll('plant', taxa);
      Object.assign(sample.data, locks.smp);
      Object.assign(occurrence.data, locks.occ);

      if (surveySample.data.childGeolocation) {
        const ignoreError = () => {};
        sample.startGPS().catch(ignoreError);
      }

      return sample;
    },
  },

  verify: (values: any) =>
    object({
      location: locationAttrValidator(),
      locationName: string({ error: 'Location name is missing' }).min(
        1,
        'Location name is missing'
      ),
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
        date: dateFormatISO.format(new Date()),
        enteredSrefSystem: 'OSGB',
        sampleMethodId: 7305,
        [recordersAttr.id]: recorders,
        [recordersCountAttr.id]: singleRecorderValue,
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
