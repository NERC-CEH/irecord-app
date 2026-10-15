import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import appModel from 'models/app';
import Occurrence, { MachineInvolvement, type Data } from 'models/occurrence';
import {
  commentAttr,
  identifiersAttr,
  mothStageAttr,
  Survey,
  taxonAttr,
} from 'Survey/common/config';
import {
  defaultSensitivityPrecisionAttr,
  numberAttr,
  numberPageAttr,
  numberRangesAttr,
  sexAttr,
} from './common';

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [numberPageAttr.id]: { block: numberPageAttr },
  [numberAttr.id]: { block: numberAttr },
  [numberRangesAttr.id]: { block: numberRangesAttr },
  [identifiersAttr.id]: { block: identifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  [mothStageAttr.id]: { block: mothStageAttr },
  [sexAttr.id]: { block: sexAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'moths',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.moth],

  occ: {
    render: [numberPageAttr, mothStageAttr, sexAttr, identifiersAttr],

    attrs: occAttrs,

    async create({ images, taxon, isListSurvey }) {
      const occurrence = new Occurrence<Data>({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
        },
        media: images,
      });

      const locks = appModel.locks.getAll(
        isListSurvey ? 'list' : 'default',
        survey.taxa
      );
      Object.assign(occurrence.data, locks.occ);

      // Preserve locked counts (including zero) and ranges.
      if (
        isListSurvey &&
        occurrence.data[numberAttr.id] == null &&
        occurrence.data[numberRangesAttr.id] == null
      ) {
        occurrence.data[numberAttr.id] = 1;
      }

      return occurrence;
    },

    verify: attrs =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [mothStageAttr.id]: string({ error: 'Stage is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
