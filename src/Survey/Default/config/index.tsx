/* eslint-disable no-param-reassign */
import { object, string } from 'zod';
import {
  dateFormatISO,
  type OccurrenceData,
  type SampleData,
  type inferAttrConfigTypes,
} from '@flumens';
import userModel from 'common/models/user';
import appModel from 'models/app';
import Occurrence, { MachineInvolvement } from 'models/occurrence';
import Sample from 'models/sample';
import {
  dateAttr,
  Survey,
  locationAttr,
  taxonAttr,
  commentAttr,
  identifiersAttr,
  getSystemAttrs,
  recorderAttr,
  groupIdAttr,
  locationAttrValidator,
} from 'Survey/common/config';
import arthropodSurvey from './arthropods';
import birdsSurvey from './birds';
import bryophytesSurvey from './bryophytes';
import butterfliesSurvey from './butterflies';
import {
  defaultSensitivityPrecisionAttr,
  numberAttr,
  numberPageAttr,
  numberRangesAttr,
  sexAttr,
  stageAttr,
} from './common';
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
export { defaultSensitivityPrecisionAttr } from './common';

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

const SURVEY_ID = 374;
const SURVEY_WEBFORM = 'enter-app-record';

const attrs = {
  [locationAttr.id]: locationAttr,
  [dateAttr.id]: { block: dateAttr },
  [recorderAttr.id]: { block: recorderAttr },
  [groupIdAttr.id]: groupIdAttr,
};

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [numberPageAttr.id]: { block: numberPageAttr },
  [numberAttr.id]: { block: numberAttr },
  [numberRangesAttr.id]: { block: numberRangesAttr },
  [stageAttr.id]: { block: stageAttr },
  [sexAttr.id]: { block: sexAttr },
  [identifiersAttr.id]: { block: identifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
};

export type Data = SampleData & inferAttrConfigTypes<typeof attrs>;
export type OccData = OccurrenceData & inferAttrConfigTypes<typeof occAttrs>;

const survey = {
  name: 'default',
  taxa: 'default',
  id: SURVEY_ID,
  webForm: SURVEY_WEBFORM,
  webViewForm: 'record-details',
  taxaGroups: [],

  attrs,

  verify: (values: any) =>
    object({
      location: locationAttrValidator(),
      locationName: string({ error: 'Location name is missing' }).min(
        1,
        'Location name is missing'
      ),
    }).safeParse(values).error,

  occ: {
    render: [numberPageAttr, stageAttr, sexAttr, identifiersAttr],

    attrs: occAttrs,

    verify: (values: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
      }).safeParse(values).error,

    modifySubmission(submission: any, occ: Occurrence) {
      return { ...submission, ...occ.getClassifierSubmission() };
    },

    async create({ images, taxon }) {
      const occurrence = new Occurrence({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
        },
        media: images,
      });

      if (taxon) {
        const taxa = getTaxaGroupSurvey(taxon.group)?.taxa || 'default';
        const locks = appModel.locks.getAll('default', taxa);
        Object.assign(occurrence.data, locks.occ);
      }

      return occurrence;
    },
  },

  async create({ images, taxon }) {
    const ignoreErrors = () => {};

    // add currently logged in user as one of the recorders
    let recorder = '';
    if (userModel.isLoggedIn()) {
      recorder = userModel.getPrettyName();
    }

    const sample = new Sample<Data>({
      data: {
        surveyId: SURVEY_ID,
        inputForm: SURVEY_WEBFORM,
        date: dateFormatISO.format(new Date()),
        enteredSrefSystem: 4326,
        location: {},
      },
    });
    sample.data[recorderAttr.id] = recorder;

    const taxonSurvey = taxon ? getTaxaGroupSurvey(taxon.group) : undefined;
    const createOccurrence = taxonSurvey?.occ?.create ?? survey.occ.create;
    const occurrence = await createOccurrence({ images: images!, taxon });
    sample.occurrences.push(occurrence);

    if (taxon) sample.setTaxon(taxon, occurrence.id, true);

    // append locked attributes
    const taxonGroup = sample.getSurvey().taxa || null;
    const locks = appModel.locks.getAll('default', taxonGroup);
    Object.assign(sample.data, locks.smp);

    if (!taxon) {
      sample.startGPS().catch(ignoreErrors);
      return sample;
    }

    const isLocationLocked = appModel.locks.get(
      'default',
      taxonGroup,
      'smp',
      'location'
    );
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
    const getTaxaConfig = () => {
      if (!sample.occurrences.length) return this;
      if (!sample.metadata.taxa) return this;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return getFullTaxaGroupSurvey(sample.metadata.taxa);
    };

    const isSubSample = sample.parent;
    if (isSubSample) {
      const taxaConfig = getTaxaConfig();
      const subSampleConfig = sample.parent?.getSurvey()?.smp;
      const taxaSurvey: any = {
        ...taxaConfig,
        ...subSampleConfig,
        occ: {
          ...taxaConfig.occ,
          ...subSampleConfig?.occ,
          attrs: {
            ...taxaConfig.occ?.attrs,
            ...subSampleConfig?.occ?.attrs,
          },
        },
      };
      delete taxaSurvey.verify;
      return taxaSurvey;
    }

    return getTaxaConfig();
  },
} as const satisfies Survey;

export default survey;

/**
 * Finds the matching species group survey.
 * @param taxa species group name e.g. 'birds'.
 */
export function getFullTaxaGroupSurvey(
  taxa: keyof typeof taxonGroupSurveys
): Survey {
  const taxaSurvey = taxonGroupSurveys[taxa] || {};

  const mergedSurvey = {
    ...survey,
    ...taxaSurvey,
    attrs: {
      ...survey.attrs,
      ...taxaSurvey.attrs,
    },
    occ: {
      ...survey.occ,
      ...taxaSurvey.occ,
    },
  };

  return mergedSurvey;
}
