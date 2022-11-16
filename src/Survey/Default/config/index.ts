/* eslint-disable no-param-reassign */
import appModel from 'models/app';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import AppOccurrence from 'models/occurrence';
import AppSample from 'models/sample';
import * as Yup from 'yup';
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
} from 'Survey/common/config';
import mergeWith from 'lodash.mergewith';
import arthropodSurvey from './arthropods';
import dragonfliesSurvey from './dragonflies';
import bryophytesSurvey from './bryophytes';
import butterfliesSurvey from './butterflies';
import mothsSurvey from './moths';
import plantFungiSurvey from './plantFungi';
import birdsSurvey from './birds';

export const taxonGroupSurveys = {
  arthropods: arthropodSurvey,
  dragonflies: dragonfliesSurvey,
  bryophytes: bryophytesSurvey,
  butterflies: butterfliesSurvey,
  moths: mothsSurvey,
  'plants-fungi': plantFungiSurvey,
  birds: birdsSurvey,
};

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
  { label: 'Not Recorded', value: '', isDefault: true },
  { value: 'Adult', id: 1950 },
  { value: 'Pre-adult', id: 1951 },
  { value: 'Other', id: 1952 },
];

const sexOptions = [
  { label: 'Not Recorded', value: '', isDefault: true },
  { value: 'Male', id: 1947 },
  { value: 'Female', id: 1948 },
  { value: 'Mixed', id: 3482 },
];

const numberOptions = [
  { isPlaceholder: true, label: 'Ranges' },
  { value: null, isDefault: true, label: 'Present' },
  { value: 1, id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
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
    'occ:sex',
    'occ:identifiers',
  ],

  attrs: {
    location: locationAttr,

    date: dateAttr,

    activity: activityAttr,
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
            if (numberRegex.test(`${value}`)) {
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
                  'number-ranges': null,
                }),
              get: (model: AppOccurrence) => model.attrs.number,
              input: 'slider',
              info: 'How many individuals of this type?',
              inputProps: { max: 500 },
            },
            {
              set: (value: string, model: AppOccurrence) =>
                Object.assign(model.attrs, {
                  number: null,
                  'number-ranges': value,
                }),
              get: (model: AppOccurrence) => model.attrs['number-ranges'],
              onChange: () => window.history.back(),
              input: 'radio',
              inputProps: { options: numberOptions },
            },
          ],
        },
        remote: { id: 16 },
      },

      'number-ranges': { remote: { id: 523, values: numberOptions } },

      stage: {
        menuProps: { icon: progressIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please pick the life stage.',
            inputProps: { options: stageOptions },
          },
        },
        remote: { id: 106, values: stageOptions },
      },
      sex: {
        menuProps: { icon: genderIcon },
        pageProps: {
          attrProps: {
            input: 'radio',
            info: 'Please indicate the sex of the organism.',
            inputProps: { options: sexOptions },
          },
        },
        remote: { id: 105, values: sexOptions },
      },
      identifiers: identifiersAttr,
      comment: commentAttr,
    },
    verify(attrs) {
      try {
        Yup.object()
          .shape({
            taxon: Yup.object().nullable().required('Species is missing.'),
          })
          .validateSync(attrs, { abortEarly: false });
      } catch (attrError) {
        return attrError;
      }

      return null;
    },
  },

  async create(Sample, Occurrence, options) {
    const { image, taxon, skipLocation, skipGPS } = options;

    const occurrence = new Occurrence();

    if (image) occurrence.media.push(image);

    const sample = new Sample({
      metadata: {
        survey_id: survey.id,
        survey: survey.name,
      },
      attrs: { location: {} },
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
      sample.startGPS();
      return sample;
    }

    const surveyConfig = sample.getSurvey();
    const speciesGroup = surveyConfig.taxa || 'default';
    const surveyLocks = defaultSurveyLocks[speciesGroup];
    const fullSurveyLocks = { ...coreLocks, ...surveyLocks };
    appModel.appendAttrLocks(sample, fullSurveyLocks, skipLocation);

    const isLocationLocked = appModel.getAttrLock('smp', 'location');
    if (!isLocationLocked && !skipGPS) {
      sample.startGPS();
    }

    return sample;
  },

  async createWithPhoto(Sample, Occurrence, { image }) {
    return survey.create(Sample, Occurrence, { image });
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
