import * as Yup from 'yup';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import appModel from 'models/app';
import userModel from 'models/user';
import {
  verifyLocationSchema,
  recorderAttr,
  Survey,
  locationAttr,
  getSystemAttrs,
  dateAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  mothStageAttr,
  makeSubmissionBackwardsCompatible,
  sensitivityPrecisionAttr,
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
  label: 'Moth',
  id: 90,

  taxaGroups: [groups.moth],

  webForm: 'enter-moth-sightings',

  attrs: {
    location: locationAttr,

    date: dateAttr,

    recorder: recorderAttr,
    /** @deprecated */
    recorders: recorderAttr,

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

    create({ Occurrence, taxon, images }) {
      const newOccurrence = new Occurrence({ attrs: { taxon, number: 1 } });
      if (images) newOccurrence.media.push(...images);

      const locks = appModel.attrs.attrLocks.complex.moth || {};
      appModel.appendAttrLocks(newOccurrence, locks);
      return newOccurrence;
    },
  },

  verify(attrs) {
    try {
      Yup.object()
        .shape({
          location: verifyLocationSchema,
          date: Yup.string().nullable().required('Date is missing.'),
          method: Yup.string().nullable().required('Method is missing.'),
          // TODO: re-enable in future versions after everyone uploads
          // recorder: Yup.string().nullable().required('Recorder field is missing.'),
        })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  create({ Sample }) {
    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: {
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
      'smpAttr:8': userModel.attrs.email,
    });

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },
};

export default survey;
