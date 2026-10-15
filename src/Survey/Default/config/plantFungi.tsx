import { object } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import appModel from 'common/models/app';
import Occurrence, { Data, MachineInvolvement } from 'common/models/occurrence';
import {
  abundanceAttr,
  abundanceSchema,
  altitudeAttr,
  statusAttr,
} from 'Survey/Plant/config/common';
import {
  commentAttr,
  identifiersAttr,
  plantStageAttr,
  Survey,
  taxonAttr,
} from 'Survey/common/config';
import { defaultSensitivityPrecisionAttr } from './common';

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [identifiersAttr.id]: { block: identifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  [abundanceAttr.id]: { block: abundanceAttr },
  [altitudeAttr.id]: { block: altitudeAttr },
  [statusAttr.id]: { block: statusAttr },
  [plantStageAttr.id]: { block: plantStageAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'plants-fungi',
  taxaGroups: [
    groups['flower. plant'],
    groups.clubmoss,
    groups.fern,
    groups.horsetail,
    groups.conifer,
    groups.stonewort,
    groups.fungus,

    // disabled because there is a bryophytes config
    // groups.moss,
    // groups.liverwort
  ],

  occ: {
    render: [
      abundanceAttr,
      plantStageAttr,
      statusAttr,
      altitudeAttr,
      identifiersAttr,
    ],

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

      return occurrence;
    },

    verify: values =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [abundanceAttr.id]: abundanceSchema,
      }).safeParse(values).error,
  },
};

export default survey;
