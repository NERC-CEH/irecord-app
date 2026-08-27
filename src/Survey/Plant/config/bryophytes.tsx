import { groupsReverse as groups } from 'common/data/informalGroups';
import {
  bulbilsAttr,
  femaleAttr,
  fruitAttr,
  gemmaeAttr,
  maleAttr,
  microscopicallyCheckedAttr,
  tubersAttr,
} from 'Survey/Default/config/bryophytes';
import { defaultSensitivityPrecisionAttr } from 'Survey/Default/config/common';
import { commentAttr, Survey, taxonAttr } from 'Survey/common/config';
import plantOccIdentifiersAttr, { altitudeAttr } from './common';

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [altitudeAttr.id]: { block: altitudeAttr },
  [plantOccIdentifiersAttr.id]: { block: plantOccIdentifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  sex: null as any,
  stage: null as any,
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

  render: [],
  attrs: {},

  occ: {
    render: [
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
