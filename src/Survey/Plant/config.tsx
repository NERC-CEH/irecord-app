import { peopleOutline, businessOutline, pencilOutline } from 'ionicons/icons';
import { object, array, string } from 'zod';
import { ChoiceInputConf } from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import VCs from 'common/data/vice_counties.data.json';
import { InfoButton } from 'common/flumens';
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
  sensitivityPrecisionAttr,
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

export const recordersAttr = {
  id: 'recorders',
  menuProps: { icon: peopleOutline, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'inputList',
      info: 'If anyone helped with documenting the record please enter their name here.',
      inputProps: { placeholder: 'Recorder name' },
    },
  },

  remote: {
    id: 1018,
    values(val: any, submission: any) {
      // add recorder count
      let count;
      switch (true) {
        case val.length === 1:
          count = 7299;
          break;
        case val.length === 2:
          count = 7300;
          break;
        case val.length <= 5:
          count = 7301;
          break;
        case val.length <= 10:
          count = 7302;
          break;
        case val.length <= 20:
          count = 7303;
          break;
        case val.length >= 21:
          count = 7304;
          break;
        default:
          throw new Error('No such recorderCount case found!');
      }

      // eslint-disable-next-line no-param-reassign
      submission.values['smpAttr:992'] = count;

      return val;
    },
  },
} as const;

export const viceCountyAttr = {
  id: 'vice-county',
  menuProps: {
    icon: businessOutline,
    label: 'Vice County',
    parse: (val: any) => val?.name,
  },
  pageProps: {
    headerProps: { title: 'Vice County' },
    attrProps: {
      input: 'radio',
      set: (val: any, model: any) => {
        const byName = ({ name }: any) => name === val;
        const VC = VCs.find(byName);
        // eslint-disable-next-line no-param-reassign
        model.data['vice-county'] = VC;
      },

      get: (model: any) => model.data['vice-county']?.name,
      inputProps: {
        options: VCs.map((vc: any) => ({ value: vc.name })),
      },
    },
  },
  remote: {
    id: 991,
    values(val: any, submission: any) {
      const id = viceCountyAttr.remote?.id;
      // eslint-disable-next-line no-param-reassign
      submission.values[`smpAttr:${id}:name`] = val.name;

      return parseInt(val.id, 10);
    },
  },
} as const;

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

const abundanceAttr = {
  id: 'abundance',
  menuProps: { icon: numberIcon, skipValueTranslation: true },
  pageProps: {
    attrProps: {
      input: 'input',
      info: (
        <>
          Abundance (DAFOR, LA, LF or count).
          <InfoButton label="READ MORE" header="Info" color="tertiary">
            <p>
              DAFOR refers to a subjective abundance scale comprising the
              following ordered terms: <b>D</b>ominant / <b>A</b>
              bundant / <b>F</b>requent / <b>O</b>ccasional / <b>R</b>
              are. The prefix "Locally" can also be used with the Abundant and
              Frequent classes (e.g. LA = Locally Abundant).
            </p>
            <p>
              Assessed abundance should either relate to the scale of the survey
              (e.g. 1 or 2 km grid squares), or be clearly qualified in the
              record comments field.
            </p>
          </InfoButton>
        </>
      ),
      set(value: any, model: any) {
        const re = /^(\d+|[DAFOR]|LA|LF)$/;
        if (!re.test(value)) return;
        // eslint-disable-next-line no-param-reassign
        model.data.abundance = value;
      },
    },
  },
  remote: {
    id: 610,
    values: (value: any) =>
      typeof value === 'string' ? value.toUpperCase() : value, // fixes lowercase values
  },
} as const;

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

const plantOccIdentifiersAttr = {
  id: 'identifiers',
  menuProps: {
    icon: peopleOutline,
    label: 'Identified by',
    skipValueTranslation: true,
  },
  pageProps: {
    headerProps: { title: 'Identified by' },
    attrProps: {
      input: 'inputList',
      info: 'If another person identified the species for you, please enter their name here.',
      inputProps: {
        placeholder: 'Name',
      },
    },
  },
  remote: { id: 125 },
} as const;

const plantSensitivityPrecisionAttr = {
  ...sensitivityPrecisionAttr(),
  id: 'sensitivityPrecision',
} as const;

const SURVEY_ID = 325;
const SURVEY_WEBFORM = 'enter-vascular-plants';

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

  attrs: {
    [dateAttr.id]: dateAttr,
    [plantLocationAttr.id]: plantLocationAttr,
    [childGeolocationAttr.id]: childGeolocationAttr,
    [recordersAttr.id]: recordersAttr,
    [viceCountyAttr.id]: viceCountyAttr,
    [commentAttr.id]: commentAttr,
  },

  smp: {
    attrs: {
      [dateAttr.id]: dateAttr,
      [plantSmpLocationAttr.id]: plantSmpLocationAttr,
    },

    occ: {
      render: [
        statusAttr,
        plantStageAttr,
        abundanceAttr,
        plantOccIdentifiersAttr,
        commentAttr,
        plantSensitivityPrecisionAttr,
      ],
      attrs: {
        [taxonAttr.id]: taxonAttr,
        [abundanceAttr.id]: abundanceAttr,
        [statusAttr.id]: statusAttr,
        [plantStageAttr.id]: plantStageAttr,
        [plantOccIdentifiersAttr.id]: plantOccIdentifiersAttr,
        [commentAttr.id]: commentAttr,
        [plantSensitivityPrecisionAttr.id]: plantSensitivityPrecisionAttr,
      },

      verify: (attrs: any) =>
        object({
          taxon: object({}, { error: 'Species is missing.' }).nullable(),
        }).safeParse(attrs).error,

      modifySubmission(submission: any, occ: Occurrence) {
        return { ...submission, ...occ.getClassifierSubmission() };
      },
    },

    async create({ taxon, images, surveySample }) {
      const { gridSquareUnit } = appModel.data;

      const sample = new Sample({
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

  verify: (attrs: any) =>
    object({
      location: locationAttrValidator({
        name: string({ error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
      recorders: array(string(), {
        error: 'Recorders field is missing.',
      })
        .min(1)
        .nullable(),
    }).safeParse(attrs).error,

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
        recorders,
      },
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
