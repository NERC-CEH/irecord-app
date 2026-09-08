import { groupsReverse as groups } from 'common/data/informalGroups';
import {
  bulbilsAttr,
  femaleAttr,
  fruitAttr,
  gemmaeAttr,
  habitatAttr,
  maleAttr,
  microhabitatAttr,
  microscopicallyCheckedAttr,
  tubersAttr,
} from 'Survey/Default/config/bryophytes';
import { defaultSensitivityPrecisionAttr } from 'Survey/Default/config/common';
import { commentAttr, Survey, taxonAttr } from 'Survey/common/config';
import plantOccIdentifiersAttr, { altitudeAttr } from './common';

const attrs = {
  [habitatAttr.id]: { block: habitatAttr },
};

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [altitudeAttr.id]: { block: altitudeAttr },
  [microhabitatAttr.id]: { block: microhabitatAttr },
  [plantOccIdentifiersAttr.id]: { block: plantOccIdentifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  sex: { id: 'sex' },
  stage: { id: 'stage' },
  [microscopicallyCheckedAttr.id]: { block: microscopicallyCheckedAttr },
  [fruitAttr.id]: { block: fruitAttr },
  [maleAttr.id]: { block: maleAttr },
  [femaleAttr.id]: { block: femaleAttr },
  [bulbilsAttr.id]: { block: bulbilsAttr },
  [gemmaeAttr.id]: { block: gemmaeAttr },
  [tubersAttr.id]: { block: tubersAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'bryophytes',
  taxaGroups: [groups.moss, groups.liverwort],

  render: [habitatAttr],
  attrs,

  occ: {
    render: [
      microhabitatAttr,
      plantOccIdentifiersAttr,
      microscopicallyCheckedAttr,
      fruitAttr,
      maleAttr,
      femaleAttr,
      bulbilsAttr,
      gemmaeAttr,
      tubersAttr,
    ],
    skipAutoIncrement: true,
    attrs: occAttrs,
  },
};

export default survey;
