import { object } from 'zod';
import { ChoiceInputConf } from '@flumens/tailwind/dist/Survey';
import { groupsReverse as groups } from 'common/data/informalGroups';
import progressIcon from 'common/images/progress-circles.svg';
import {
  commentAttr,
  identifiersAttr,
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

/** @deprecated */
export const reptileStageAttrOld = {
  id: 'stage',
  remote: {
    id: 874,
    values: [
      { value: 'Not Recorded', id: 17674 },
      { value: 'Adult', id: 17669 },
      { value: 'Young', id: 17670 },
      { value: 'Tadpoles/larvae', id: 17671 },
      { value: 'Spawn/egg', id: 17672 },
      { value: 'Other', id: 17673 },
    ],
  },
} as const;

export const reptileStageAttr = {
  id: 'occAttr:874',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '17674' },
    { title: 'Adult', dataName: '17669' },
    { title: 'Young', dataName: '17670' },
    { title: 'Tadpoles/larvae', dataName: '17671' },
    { title: 'Spawn/egg', dataName: '17672' },
    { title: 'Other', dataName: '17673' },
  ],
} as const satisfies ChoiceInputConf;

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
  [reptileStageAttr.id]: { block: reptileStageAttr },
  [sexAttr.id]: { block: sexAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'reptiles',
  taxaGroups: [groups.reptile, groups.amphibian],

  occ: {
    render: [numberPageAttr, reptileStageAttr, sexAttr, identifiersAttr],

    attrs: occAttrs,

    verify: (attrs: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
