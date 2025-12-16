import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import landIcon from 'common/images/land.svg';
import numberIcon from 'common/images/number.svg';
import { Survey } from 'Survey/common/config';

const numRanges = [
  { value: null, isDefault: true, label: 'Not selected' },
  { value: '1', id: 665 },
  { value: '2-5', id: 666 },
  { value: '6-20', id: 667 },
  { value: '21-100', id: 668 },
  { value: '101-500', id: 669 },
  { value: '500+', id: 670 },
  { value: 'Present', id: 671 },
];

const siteTypeOptions = [
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
];

const siteAttr = {
  id: 'site',
  menuProps: { icon: landIcon, label: 'Site type' },
  pageProps: {
    attrProps: {
      input: 'radio',
      inputProps: { options: siteTypeOptions },
    },
  },
  remote: { id: 59, values: siteTypeOptions },
} as const;

const adCountAttr = {
  id: 'adCount',
  menuProps: { icon: numberIcon, label: 'Adults' },
  pageProps: {
    headerProps: { title: 'Adults' },
    attrProps: {
      input: 'radio',
      info: 'Total number of adults, including teneral adults. Also include in this total twice the count of coupled pairs plus the count of ovipositing females.',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 34, values: numRanges },
} as const;

const coCountAttr = {
  id: 'coCount',
  menuProps: { icon: numberIcon, label: 'Coupled pairs' },
  pageProps: {
    headerProps: { title: 'Coupled pairs' },
    attrProps: {
      input: 'radio',
      info: 'Number of coupled pairs or mating pairs seen.',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 35, values: numRanges },
} as const;

const ovCountAttr = {
  id: 'ovCount',
  menuProps: { icon: numberIcon, label: 'Ovipositing females' },
  pageProps: {
    headerProps: { title: 'Ovipositing females' },
    attrProps: {
      input: 'radio',
      info: 'Number of egg-laying females seen.',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 36, values: numRanges },
} as const;

const scCountAttr = {
  id: 'scCount',
  menuProps: { icon: numberIcon, label: 'Oviposition scars' },
  pageProps: {
    headerProps: { title: 'Oviposition scars' },
    attrProps: {
      input: 'radio',
      info: 'For Willow Emerald Damselfly only, enter 1 if any egg-laying scars seen in the bark of waterside tree branches.',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 842, values: numRanges },
} as const;

const laCountAttr = {
  id: 'laCount',
  menuProps: { icon: numberIcon, label: 'Larvae' },
  pageProps: {
    headerProps: { title: 'Larvae' },
    attrProps: {
      input: 'radio',
      info: 'Number of live larvae seen.',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 37, values: numRanges },
} as const;

const exCountAttr = {
  id: 'exCount',
  menuProps: { icon: numberIcon, label: 'Exuviae' },
  pageProps: {
    headerProps: { title: 'Exuviae' },
    attrProps: {
      input: 'radio',
      info: 'Number of shed larval skins (left over after the adult has emerged).',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 38, values: numRanges },
} as const;

const emCountAttr = {
  id: 'emCount',
  menuProps: { icon: numberIcon, label: 'Emergents' },
  pageProps: {
    headerProps: { title: 'Emergents' },
    attrProps: {
      input: 'radio',
      info: 'Number of emergents – from larvae just out of the water to pre-flight adults, including deformed adults incapable of flight (do not include these in the total count of adults).',
      inputProps: { options: numRanges },
    },
  },
  remote: { id: 39, values: numRanges },
} as const;

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'dragonflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.dragonfly],

  render: [
    { ...siteAttr, model: 'sample' },
    adCountAttr,
    coCountAttr,
    ovCountAttr,
    scCountAttr,
    laCountAttr,
    exCountAttr,
    emCountAttr,
    // 'smp:siteOther',
  ],

  attrs: {
    [siteAttr.id]: siteAttr,
  },

  occ: {
    skipAutoIncrement: true,

    attrs: {
      sex: null as any, // disable for bulk-editing
      stage: null as any, // disable for bulk-editing

      [adCountAttr.id]: adCountAttr,
      [coCountAttr.id]: coCountAttr,
      [ovCountAttr.id]: ovCountAttr,
      [scCountAttr.id]: scCountAttr,
      [laCountAttr.id]: laCountAttr,
      [exCountAttr.id]: exCountAttr,
      [emCountAttr.id]: emCountAttr,
    },

    verify: (attrs: any) =>
      object({
        taxon: object({}, { required_error: 'Species is missing.' }).nullable(),
        adCount: string().nullable().optional(),
        coCount: string().nullable().optional(),
        ovCount: string().nullable().optional(),
        scCount: string().nullable().optional(),
        laCount: string().nullable().optional(),
        exCount: string().nullable().optional(),
        emCount: string().nullable().optional(),
      })
        .refine(
          (val: any) =>
            val.adCount ||
            val.coCount ||
            val.ovCount ||
            val.scCount ||
            val.laCount ||
            val.exCount ||
            val.emCount,
          'Add quantity for at least one life stage.'
        )
        .safeParse(attrs).error,
  },
};

export default survey;
