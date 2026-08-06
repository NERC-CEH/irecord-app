/* eslint-disable no-param-reassign */
import mergeWith from 'lodash.mergewith';
import { object, string } from 'zod';
import userModel from 'common/models/user';
import appModel from 'models/app';
import Occurrence, { MachineInvolvement } from 'models/occurrence';
import Sample from 'models/sample';
import {
  coreAttributes,
  dateAttr,
  Survey,
  locationAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  getSystemAttrs,
  recorderAttr,
  groupIdAttr,
  sensitivityPrecisionAttr,
  locationAttrValidator,
} from 'Survey/common/config';
import arthropodSurvey from './arthropods';
import birdsSurvey from './birds';
import bryophytesSurvey from './bryophytes';
import butterfliesSurvey from './butterflies';
import { numberAttr, numberRangesAttr, sexAttr, stageAttr } from './common';
import dragonfliesSurvey from './dragonflies';
import mammalsSurvey from './mammals';
import mothsSurvey from './moths';
import plantFungiSurvey from './plantFungi';
import reptilesSurvey from './reptiles';

export {
  dateAttr,
  commentAttr,
  recorderAttr,
  groupIdAttr,
} from 'Survey/common/config';

export const taxonGroupSurveys = {
  arthropods: arthropodSurvey,
  dragonflies: dragonfliesSurvey,
  bryophytes: bryophytesSurvey,
  butterflies: butterfliesSurvey,
  moths: mothsSurvey,
  'plants-fungi': plantFungiSurvey,
  birds: birdsSurvey,
  mammals: mammalsSurvey,
  reptiles: reptilesSurvey,
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

export const defaultSensitivityPrecisionAttr = {
  ...sensitivityPrecisionAttr(1000),
  id: 'sensitivityPrecision',
};

const SURVEY_ID = 374;
const SURVEY_WEBFORM = 'enter-app-record';

const survey = {
  name: 'default',
  id: SURVEY_ID,
  webForm: SURVEY_WEBFORM,
  webViewForm: 'record-details',

  taxaGroups: [], // all // TODO: remove?

  attrs: {
    [locationAttr.id]: locationAttr,
    [dateAttr.id]: dateAttr,
    [recorderAttr.id]: recorderAttr,
    [groupIdAttr.id]: groupIdAttr,
  },

  verify: (attrs: any) =>
    object({
      location: locationAttrValidator({
        name: string({ error: 'Location name is missing' }).min(
          1,
          'Location name is missing'
        ),
      }),
    }).safeParse(attrs).error,

  occ: {
    render: [numberAttr, stageAttr, sexAttr, identifiersAttr],

    attrs: {
      [taxonAttr.id]: taxonAttr,
      [numberAttr.id]: numberAttr,
      [numberRangesAttr.id]: numberRangesAttr,
      [stageAttr.id]: stageAttr,
      [sexAttr.id]: sexAttr,
      [identifiersAttr.id]: identifiersAttr,
      [commentAttr.id]: commentAttr,
      [defaultSensitivityPrecisionAttr.id]: defaultSensitivityPrecisionAttr,
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
      }).safeParse(attrs).error,

    modifySubmission(submission: any, occ: Occurrence) {
      return { ...submission, ...occ.getClassifierSubmission() };
    },
  },

  async create({ images, taxon, skipLocation }) {
    const ignoreErrors = () => {};

    const occurrence = new Occurrence({
      data: { machineInvolvement: MachineInvolvement.NONE },
    });

    if (images?.length) occurrence.media.push(...images);

    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: new Date().toISOString().split('T')[0],
        enteredSrefSystem: 4326,
        location: {},
        recorder,
      },
    });
    sample.occurrences.push(occurrence);

    if (taxon) sample.setTaxon(taxon);

    // append locked attributes
    const defaultSurveyLocks = appModel.data.attrLocks.default || {};
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
    if (!isLocationLocked) {
      sample.startGPS().catch(ignoreErrors);
    }

    return sample;
  },

  modifySubmission(submission) {
    Object.assign(submission.values, getSystemAttrs());

    return submission;
  },

  get(sample: Sample) {
    const getTaxaSpecifigConfig = () => {
      if (!sample.occurrences.length) return this;

      if (!sample.metadata.taxa) return this;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return getFullTaxaGroupSurvey(sample.metadata.taxa);
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
} as const satisfies Survey;

export default survey;

/**
 * Finds the matching species group survey.
 * @param taxa species group name e.g. 'birds'.
 */
export function getFullTaxaGroupSurvey(
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
  const { render, taxaGroups, ...defaultSurveyCopy } = survey as any;
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
