import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import { MachineInvolvement } from 'common/models/occurrence';
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

const survey: Survey = {
  name: 'moth',
  label: 'Moth List Survey',
  id: 90,

  taxaGroups: [groups.moth],

  webForm: 'enter-moth-sightings',

  attrs: {
    location: locationAttr,
    date: dateAttr,
    recorder: recorderAttr,

    method: {
      menuProps: { icon: numberIcon },
      pageProps: {
        attrProps: {
          input: 'radio',
          info: 'Please enter your sampling method (i.e. type of trap or recording method).',
          inputProps: { options: methodOptions },
        },
      },
      remote: { id: 263, values: methodOptions },
    },

    comment: commentAttr,
  },

  occ: {
    render: [
      'occ:taxon',
      'occ:number',
      'occ:stage',
      'occ:sex',
      'occ:identifiers',
      'occ:comment',
      'occ:sensitivityPrecision',
    ],

    attrs: {
      taxon: taxonAttr,
      number: {
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
      },
      stage: mothStageAttr,
      sex: {
        menuProps: { icon: genderIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the sex of the organism.',
            inputProps: { options: sex },
          },
        },
        remote: { id: 105, values: sex },
      },
      identifiers: identifiersAttr,
      comment: commentAttr,
      sensitivityPrecision: sensitivityPrecisionAttr(1000),
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        stage: string({ required_error: 'Stage is missing.' }).nullable(),
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
        name: string({ required_error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
      date: string({ required_error: 'Date is missing.' }).nullable(),
      method: string({ required_error: 'Method is missing.' })
        .min(1, 'Method is missing.')
        .nullable(),
      recorder: string({
        required_error: 'Recorder field is missing.',
      })
        .min(1, 'Recorder field is missing.')
        .nullable(),
    }).safeParse(attrs).error,

  create({ Sample }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample({
      data: {
        surveyId: survey.id,
        inputForm: survey.webForm,
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
};

export default survey;
