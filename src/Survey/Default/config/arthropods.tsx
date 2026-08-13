import { object, string } from 'zod';
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
export const arthropodStageAttrOld = {
  id: 'stage',
  remote: {
    id: 829,
    values: [
      { id: 17657, value: 'Not recorded' },
      { id: 17643, value: 'Adult' },
      { id: 17644, value: 'Pupa' },
      { id: 17645, value: 'Cocoon' },
      { id: 17646, value: 'Exuvia' },
      { id: 17647, value: 'Larva' },
      { id: 20551, value: 'Mine' },
      { id: 17648, value: 'Mine (empty)' },
      { id: 17649, value: 'Mine (tenanted)' },
      { id: 17650, value: 'Case' },
      { id: 17651, value: 'Larval web' },
      { id: 24307, value: 'Immature' },
      { id: 17652, value: 'Nymph' },
      { id: 17653, value: 'Gall' },
      { id: 17654, value: 'Egg' },
      { id: 17655, value: 'Dead' },
      { id: 17656, value: 'Other' },
    ],
  },
} as const;

export const arthropodStageAttr = {
  id: 'occAttr:829',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { dataName: '17657', title: 'Not recorded' },
    { dataName: '17643', title: 'Adult' },
    { dataName: '17644', title: 'Pupa' },
    { dataName: '17645', title: 'Cocoon' },
    { dataName: '17646', title: 'Exuvia' },
    { dataName: '17647', title: 'Larva' },
    { dataName: '20551', title: 'Mine' },
    { dataName: '17648', title: 'Mine (empty)' },
    { dataName: '17649', title: 'Mine (tenanted)' },
    { dataName: '17650', title: 'Case' },
    { dataName: '17651', title: 'Larval web' },
    { dataName: '24307', title: 'Immature' },
    { dataName: '17652', title: 'Nymph' },
    { dataName: '17653', title: 'Gall' },
    { dataName: '17654', title: 'Egg' },
    { dataName: '17655', title: 'Dead' },
    { dataName: '17656', title: 'Other' },
  ],
  validation: { required: true },
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
  [arthropodStageAttr.id]: { block: arthropodStageAttr },
  [sexAttr.id]: { block: sexAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'arthropods',
  taxaGroups: [
    groups.acarine,
    groups.centipede,
    groups.crustacean,
    groups['false scorpion'],
    groups.harvestman,
    groups.alderfly,
    groups.beetle,
    groups.booklouse,
    groups.bristletail,
    groups.butterfly,
    groups['caddis fly'],
    groups.cockroach,
    groups.dragonfly,
    groups.earwig,
    groups.flea,
    groups.hymenopteran,
    groups.lacewing,
    groups.louse,
    groups.mayfly,
    groups.moth,
    groups.orthopteran,
    groups['scorpion fly'],
    groups.silverfish,
    groups.snakefly,
    groups['stick insect'],
    groups.stonefly,
    groups.stylops,
    groups.thrips,
    groups['true bug'],
    groups['true fly'],
    groups.millipede,
    groups['sea spider'],
    groups.spider,
    groups.springtail,
    groups.symphylan,
    groups['two-tailed bristletail'],
    groups.scorpion,
    groups.mantis,
    groups.pauropod,
    groups['web-spinner'],
  ],

  occ: {
    render: [numberPageAttr, arthropodStageAttr, sexAttr, identifiersAttr],

    attrs: occAttrs,

    verify: (attrs: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [arthropodStageAttr.id]: string({
          error: 'Stage is missing.',
        }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
