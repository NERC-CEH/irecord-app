import { object } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
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
    skipAutoIncrement: true,
    attrs: occAttrs,
    verify: values =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [abundanceAttr.id]: abundanceSchema,
      }).safeParse(values).error,
  },
};

export default survey;
