import userModel from 'models/user';
import appModel from 'models/app';
import {
  verifyLocationSchema,
  recordersAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  dateAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  makeSubmissionBackwardsCompatible,
} from 'Survey/common/config';
import genderIcon from 'common/images/gender.svg';
import progressIcon from 'common/images/progress-circles.svg';
import numberIcon from 'common/images/number.svg';
import * as Yup from 'yup';
import { groupsReverse as groups } from 'common/data/informalGroups';

const sex = [
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const stage = [
  { value: 'Not recorded', id: 10647 },
  { value: 'Adult', id: 2189 },
  { value: 'Larva', id: 2190 },
  { value: 'Larval web', id: 2191 },
  { value: 'Larval case', id: 2192 },
  { value: 'Mine', id: 2193 },
  { value: 'Egg', id: 2194 },
  { value: 'Egg batch', id: 2195 },
  { value: 'Pupa', id: 17556 },
];

const methodOptions = [
  { label: 'Not Recorded', value: '', isDefault: true },
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
  label: 'Moth',
  id: 90,

  taxonGroups: [groups.moth],

  webForm: 'enter-moth-sightings',

  attrs: {
    location: locationAttr,

    date: dateAttr,

    recorders: recordersAttr,

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
    ],

    attrs: {
      taxon: taxonAttr,
      number: {
        menuProps: { icon: numberIcon, label: 'Quantity' },
        pageProps: {
          headerProps: { title: 'Quantity' },
          attrProps: {
            input: 'slider',
            info: 'How many individuals of this type?',
            inputProps: {
              inputProps: { max: 500 },
            },
          },
        },

        remote: { id: 133 },
      },
      stage: {
        menuProps: { icon: progressIcon, required: true },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the stage of the organism. If you are recording larvae, cases or leaf-mines please add the foodplant in to the comments field, as this is often needed to verify the records.',
            inputProps: { options: stage },
          },
        },
        remote: { id: 130, values: stage },
      },
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
    },

    verify(attrs: any) {
      try {
        Yup.object()
          .shape({
            taxon: Yup.object().nullable().required('Species is missing.'),
            stage: Yup.string().nullable().required('Stage is missing.'),
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },

    create(Occurrence, { taxon }) {
      const newOccurrene = new Occurrence({ attrs: { taxon, number: 1 } });

      const locks = appModel.attrs.attrLocks.complex.moth || {};
      appModel.appendAttrLocks(newOccurrene, locks);
      return newOccurrene;
    },
  },

  verify(attrs) {
    try {
      Yup.object()
        .shape({
          location: verifyLocationSchema,
          date: Yup.string().nullable().required('Date is missing.'),
          method: Yup.string().nullable().required('Method is missing.'),
          recorders: Yup.array()
            .of(Yup.string())
            .min(1, 'Recorders field is missing.'),
        })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create(Sample) {
    // add currently logged in user as one of the recorders
    const recorders = [];
    if (userModel.isLoggedIn()) {
      recorders.push(userModel.getPrettyName());
    }

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: {
        location: {},
        date: '', // user should specify the trap time
        recorders,
      },
    });

    sample.startGPS();

    return Promise.resolve(sample);
  },

  modifySubmission(submission: any) {
    Object.assign(submission.values, {
      ...getSystemAttrs(),

      // email must be added to submissions
      'smpAttr:8': userModel.attrs.email,
    });

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
