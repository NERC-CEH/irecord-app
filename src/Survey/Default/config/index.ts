/* eslint-disable no-param-reassign */
import mergeWith from 'lodash.mergewith';
import * as Yup from 'yup';
import fingerprintIcon from 'common/images/fingerprint.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import targetIcon from 'common/images/target.svg';
import userModel from 'common/models/user';
import appModel from 'models/app';
import AppOccurrence from 'models/occurrence';
import AppSample from 'models/sample';
import {
  coreAttributes,
  dateAttr,
  activityAttr,
  verifyLocationSchema,
  Survey,
  locationAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  getSystemAttrs,
  makeSubmissionBackwardsCompatible,
  recorderAttr,
  methodAttr,
  verifyTypeSchema,
} from 'Survey/common/config';
// import arthropodSurvey from './arthropods';
// import birdsSurvey from './birds';
// import bryophytesSurvey from './bryophytes';
// import butterfliesSurvey from './butterflies';
// import dragonfliesSurvey from './dragonflies';
// import mothsSurvey from './moths';
// import plantFungiSurvey from './plantFungi';

export const taxonGroupSurveys = {};

export function getTaxaGroupSurvey(taxaGroup: number) {
  type SpeciesSurvey = Pick<Survey, 'taxaGroups' | 'taxaPriority'>;

  const matchesGroup = (s: SpeciesSurvey) => s.taxaGroups?.includes(taxaGroup);

  const byTaxaPriority = (s1: SpeciesSurvey, s2: SpeciesSurvey) =>
    (s2.taxaPriority || 1) - (s1.taxaPriority || 1);

  const matchingSurveys = Object.values<SpeciesSurvey>(taxonGroupSurveys)
    .filter(matchesGroup)
    .sort(byTaxaPriority);

  return matchingSurveys[0] as Survey;
}

const stageOptions = [
  { label: 'Not Recorded', value: null, isDefault: true },
  { value: 'Male', id: 3484 },
  { value: 'Pre-adult', id: 1951 },
  { value: 'Female', id: 3483 },
  { value: 'Other', id: 1952 },
  { value: 'Adult', id: 3405 },
  { value: 'Adult male', id: 3406 },
  { value: 'Adult female', id: 3407 },
  { value: 'Juvenile', id: 3408 },
  { value: 'Juvenile male', id: 3409 },
  { value: 'Juvenile female', id: 3410 },
  { value: 'Breeding pair', id: 3411 },
  { value: 'Mixed group', id: 5261 },
  { value: 'In flower', id: 3412 },
  { value: 'Fruiting', id: 3413 },
  { value: 'Egg', id: 3956 },
  { value: 'Larva', id: 3957 },
  { value: 'Nymph', id: 3959 },
  { value: 'Spawn', id: 3960 },
  { value: 'Pupa', id: 3958 },
  { value: 'Other (please add to comments)', id: 3414 },
];

const typeOptions = [
  { value: 'Bat Breeding Roost', id: 5296 },
  { value: 'Bat Detected', id: 5299 },
  { value: 'Bat Grounded', id: 7799 },
  { value: 'Bat Hibernacula', id: 5294 },
  { value: 'Bat in hand', id: 21902 },
  { value: 'Bat Roost', id: 3924 },
  { value: 'Burrow', id: 3391 },
  { value: 'Colony', id: 5667 },
  { value: 'Dead', id: 3385 },
  { value: 'Dead on road', id: 3386 },
  { value: 'Dung or droppings', id: 3388 },
  { value: 'Feeding remains', id: 3387 },
  { value: 'Living organism', id: 21966 },
  { value: 'Nest', id: 3392 },
  { value: 'Tracks or trail', id: 3389 },
  { value: 'Heard', id: 3384 },
  { value: 'Other (please add to comments)', id: 3393 },
];

const sensitivityOptions = [
  { label: 'Not Sensitive', value: null, isDefault: true },
  { value: 'Blur to 1km', id: 1000 },
  { value: 'Blur to 2km', id: 2000 },
  { value: 'Blur to 10km', id: 10000 },
  { value: 'Blur to 100km', id: 100000 },
];

const survey: Survey = {
  name: 'default',
  id: 374,
  webForm: 'enter-app-record',

  taxaGroups: [], // all // TODO: remove?

  render: [
    {
      id: 'occ:number',
      label: 'Abundance',
      icon: 'number',
      group: ['occ:number', 'occ:number-ranges'],
    },
    'occ:stage',
    'smp:method',
    'occ:type',
    'occ:identifiers',
    'occ:sensitivity_precision',
  ],

  attrs: {
    location: locationAttr,

    date: dateAttr,

    recorder: recorderAttr,
    /** @deprecated */
    recorders: recorderAttr,

    activity: activityAttr,

    method: methodAttr,
  },

  verify(attrs: any) {
    try {
      Yup.object()
        .shape({ location: verifyLocationSchema })
        .validateSync(attrs, { abortEarly: false });
    } catch (attrError) {
      return attrError;
    }

    return null;
  },

  occ: {
    attrs: {
      taxon: taxonAttr,

      number: {
        menuProps: {
          label: 'Abundance',
          icon: numberIcon,
          parse: (_, model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          isLocked: (model: any) => {
            const value =
              survey.occ?.attrs?.number?.menuProps?.getLock?.(model);
            return (
              value &&
              (value === appModel.getAttrLock(model, 'number') ||
                value === appModel.getAttrLock(model, 'number-ranges'))
            );
          },
          getLock: (model: any) =>
            model.attrs['number-ranges'] || model.attrs.number,
          unsetLock: model => {
            appModel.unsetAttrLock(model, 'number', true);
            appModel.unsetAttrLock(model, 'number-ranges', true);
          },
          setLock: (model, _, value) => {
            const numberRegex = /^\d+$/; // https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
            if (numberRegex.test(`${ value}`))  {
              appModel.setAttrLock(model, 'number', value, true);
            } else {
              appModel.setAttrLock(model, 'number-ranges', value, true);
            }
          },
        },
        pageProps: {
          headerProps: { title: 'Abundance' },
          attrProps: [
            {
              set: (value: number, model: AppOccurrence) =>
                Object.assign(model.attrs, {
                  number: value,
                  'number-ranges': undefined,
                }),
              get: (model: AppOccurrence) => model.attrs.number,
              input: 'slider',
              info: 'How many individuals of this species did you see?',
              inputProps: { max: 500 },
            },
          ],
        },
        remote: { id: 93 },
      },

      stage: {
        menuProps: { label: 'Life Stage/Sex', icon: fingerprintIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the life stage and sex of the organism, if recorded.',
            inputProps: { options: stageOptions },
          },
        },
        remote: { id: 218, values: stageOptions },
      },

      type: {
        menuProps: { icon: progressIcon, label: 'Type' },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the type of observation.',
            inputProps: { options: typeOptions },
          },
        },
        remote: { id: 217, values: typeOptions },
      },
      identifiers: identifiersAttr,
      sensitivity_precision: {
        menuProps: { label: 'Sensitivity', icon: targetIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'This is the precision that the record will be shown at for public viewing.',
            inputProps: { options: sensitivityOptions },
          },
        },
        remote: { values: sensitivityOptions },
      },
      comment: commentAttr,
    },
    verify(attrs) {
      try {
        Yup.object()
          .shape({
            taxon: Yup.object().nullable().required('Species is missing.'),
          })
          .shape({
            type: verifyTypeSchema,
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },
  },

  async create({ Sample, Occurrence, image, taxon, skipLocation, skipGPS }) {
    const ignoreErrors = () => {};

    const occurrence = new Occurrence();

    if (image) occurrence.media.push(image);

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
      attrs: { location: {}, recorder },
    });
    sample.occurrences.push(occurrence);

    if (taxon) sample.setTaxon(taxon);

    // append locked attributes
    const defaultSurveyLocks = appModel.attrs.attrLocks.default || {};
    const locks = defaultSurveyLocks.default || {};
    const coreLocks = Object.keys(locks).reduce((agg, key) => {
      if (coreAttributes.includes(key)) {
        (agg as any)[key] = locks[key];
      }
      return agg;
    }, {});

    if (!taxon) {
      // when there is no taxon we don't know the survey yet
      // these are core attributes and safe to reuse in any survey
      appModel.appendAttrLocks(sample, coreLocks);
      sample.startGPS().catch(ignoreErrors);

      return sample;
    }

    const surveyConfig = sample.getSurvey();
    const speciesGroup = surveyConfig.taxa || 'default';
    const surveyLocks = defaultSurveyLocks[speciesGroup];
    const fullSurveyLocks = { ...coreLocks, ...surveyLocks };
    appModel.appendAttrLocks(sample, fullSurveyLocks, skipLocation);

    const isLocationLocked = appModel.getAttrLock('smp', 'location');
    if (!isLocationLocked && !skipGPS) {
      sample.startGPS().catch(ignoreErrors);
    }

    return sample;
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    makeSubmissionBackwardsCompatible(submission, survey);

    return submission;
  },

  get(sample: AppSample) {
    const getTaxaSpecifigConfig = () => {
      if (!sample.occurrences.length) return sample.survey;

      if (!sample.metadata.taxa) return sample.survey;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return _getFullTaxaGroupSurvey(sample.metadata.taxa);
    };

    const isSubSample = sample.parent;
    if (isSubSample) {
      const taxaSurvey: any = {
        ...getTaxaSpecifigConfig(),
        ...sample.parent?.getSurvey()?.smp, // survey subsample config takes precedence
      };
      delete taxaSurvey.verify;
      return taxaSurvey;
    }

    return getTaxaSpecifigConfig();
  },
};

export default survey;

/**
 * Finds the matching species group survey.
 * @param taxa species group name e.g. 'birds'.
 */
export function _getFullTaxaGroupSurvey(
  taxa?: keyof typeof taxonGroupSurveys
): Survey {
  if (!taxa) return { ...survey };

  const matchedSurvey = taxonGroupSurveys[taxa];
  if (!matchedSurvey) return survey;

  function skipAttributes(__: any, srcValue: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isObject = typeof srcValue === 'object' && srcValue !== null;
    if (isObject && srcValue.remote) {
      return srcValue;
    }
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { render, taxaGroups, ...defaultSurveyCopy } = survey;
  const mergedDefaultSurvey: Survey = mergeWith(
    {},
    defaultSurveyCopy,
    matchedSurvey,
    skipAttributes
  );

  if (!mergedDefaultSurvey.render) {
    mergedDefaultSurvey.render = render;
  }

  return mergedDefaultSurvey;
}
