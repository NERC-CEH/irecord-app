import { object, string } from 'zod';
import { ChoiceInputConf } from '@flumens/tailwind/dist/Survey';
import { groupsReverse as groups } from 'common/data/informalGroups';
import landIcon from 'common/images/land.svg';
import numberIcon from 'common/images/number.svg';
import { commentAttr, Survey, taxonAttr } from 'Survey/common/config';
import { defaultSensitivityPrecisionAttr } from './common';

const numRangesOld = [
  { value: null, isDefault: true, label: 'Not selected' },
  { value: '1', id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
  { value: 'Present', id: 671 },
];

const numRanges = [
  { dataName: '', title: 'Not selected' },
  { title: '1', dataName: '665' },
  { title: '2-5', dataName: '666' },
  { title: '6-20', dataName: '667' },
  { title: '21-100', dataName: '668' },
  { title: '101-500', dataName: '669' },
  { title: '500+', dataName: '670' },
  { title: 'Present', dataName: '671' },
] as const;

/** @deprecated */
export const siteAttrOld = {
  id: 'site',
  remote: {
    id: 59,
    values: [
      { value: null, isDefault: true, label: 'Not selected' },
      { value: 'Lake', id: 672 },
      { value: 'Reservoir', id: 673 },
      { value: 'Mill lodge', id: 674 },
      { value: 'Large pond', id: 675 },
      { value: 'Small pond', id: 676 },
      { value: 'Garden pond', id: 677 },
      { value: 'River', id: 678 },
      { value: 'Stream', id: 679 },
      { value: 'Ditch', id: 680 },
      { value: 'Canal', id: 681 },
      { value: 'Other (please specify in comments)', id: 682 },
    ],
  },
} as const;

export const siteAttr = {
  id: 'smpAttr:59',
  title: 'Site type',
  prefix: <img src={landIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { dataName: '', title: 'Not selected' },
    { title: 'Lake', dataName: '672' },
    { title: 'Reservoir', dataName: '673' },
    { title: 'Mill lodge', dataName: '674' },
    { title: 'Large pond', dataName: '675' },
    { title: 'Small pond', dataName: '676' },
    { title: 'Garden pond', dataName: '677' },
    { title: 'River', dataName: '678' },
    { title: 'Stream', dataName: '679' },
    { title: 'Ditch', dataName: '680' },
    { title: 'Canal', dataName: '681' },
    { title: 'Other (please specify in comments)', dataName: '682' },
  ],
} as const satisfies ChoiceInputConf;

const countAttr = (id: string, title: string, description: string) =>
  ({
    id,
    title,
    prefix: <img src={numberIcon} alt="" className="size-6" />,
    type: 'choiceInput',
    container: 'page',
    choices: numRanges,
    description,
  }) as const satisfies ChoiceInputConf;

/** @deprecated */
export const adCountAttrOld = {
  id: 'adCount',
  remote: { id: 34, values: numRangesOld },
} as const;
export const adCountAttr = countAttr(
  'occAttr:34',
  'Adults',
  'Total number of adults, including teneral adults. Also include in this total twice the count of coupled pairs plus the count of ovipositing females.'
);

/** @deprecated */
export const coCountAttrOld = {
  id: 'coCount',
  remote: { id: 35, values: numRangesOld },
} as const;
export const coCountAttr = countAttr(
  'occAttr:35',
  'Coupled pairs',
  'Number of coupled pairs or mating pairs seen.'
);

/** @deprecated */
export const ovCountAttrOld = {
  id: 'ovCount',
  remote: { id: 36, values: numRangesOld },
} as const;
export const ovCountAttr = countAttr(
  'occAttr:36',
  'Ovipositing females',
  'Number of egg-laying females seen.'
);

/** @deprecated */
export const scCountAttrOld = {
  id: 'scCount',
  remote: { id: 842, values: numRangesOld },
} as const;
export const scCountAttr = countAttr(
  'occAttr:842',
  'Oviposition scars',
  'For Willow Emerald Damselfly only, enter 1 if any egg-laying scars seen in the bark of waterside tree branches.'
);

/** @deprecated */
export const laCountAttrOld = {
  id: 'laCount',
  remote: { id: 37, values: numRangesOld },
} as const;
export const laCountAttr = countAttr(
  'occAttr:37',
  'Larvae',
  'Number of live larvae seen.'
);

/** @deprecated */
export const exCountAttrOld = {
  id: 'exCount',
  remote: { id: 38, values: numRangesOld },
} as const;
export const exCountAttr = countAttr(
  'occAttr:38',
  'Exuviae',
  'Number of shed larval skins (left over after the adult has emerged).'
);

/** @deprecated */
export const emCountAttrOld = {
  id: 'emCount',
  remote: { id: 39, values: numRangesOld },
} as const;
export const emCountAttr = countAttr(
  'occAttr:39',
  'Emergents',
  'Number of emergents – from larvae just out of the water to pre-flight adults, including deformed adults incapable of flight (do not include these in the total count of adults).'
);

const attrs = {
  [siteAttr.id]: { block: siteAttr },
};

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  sex: null as any, // disable for bulk-editing
  stage: null as any, // disable for bulk-editing

  [adCountAttr.id]: { block: adCountAttr },
  [coCountAttr.id]: { block: coCountAttr },
  [ovCountAttr.id]: { block: ovCountAttr },
  [scCountAttr.id]: { block: scCountAttr },
  [laCountAttr.id]: { block: laCountAttr },
  [exCountAttr.id]: { block: exCountAttr },
  [emCountAttr.id]: { block: emCountAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'dragonflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.dragonfly],

  render: [siteAttr],

  attrs,

  occ: {
    render: [
      adCountAttr,
      coCountAttr,
      ovCountAttr,
      scCountAttr,
      laCountAttr,
      exCountAttr,
      emCountAttr,
    ],

    skipAutoIncrement: true,

    attrs: occAttrs,

    verify: (values: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [adCountAttr.id]: string().nullable().optional(),
        [coCountAttr.id]: string().nullable().optional(),
        [ovCountAttr.id]: string().nullable().optional(),
        [scCountAttr.id]: string().nullable().optional(),
        [laCountAttr.id]: string().nullable().optional(),
        [exCountAttr.id]: string().nullable().optional(),
        [emCountAttr.id]: string().nullable().optional(),
      })
        .refine(
          (val: any) =>
            val[adCountAttr.id] ||
            val[coCountAttr.id] ||
            val[ovCountAttr.id] ||
            val[scCountAttr.id] ||
            val[laCountAttr.id] ||
            val[exCountAttr.id] ||
            val[emCountAttr.id],
          'Add quantity for at least one life stage.'
        )
        .safeParse(values).error,
  },
};

export default survey;
