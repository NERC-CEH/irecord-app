import { object, string } from 'zod';
import { groupsReverse as groups } from 'common/data/informalGroups';
import landIcon from 'common/images/land.svg';
import numberIcon from 'common/images/number.svg';
import { Survey } from 'Survey/common/config';

const numRanges = [
  { value: null, isDefault: true, label: 'Not selected' },
  { value: '1', id: 665 },
  { value: 1, id: 665, className: 'hidden' }, // TODO: remove this in the future when users migrated
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

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'dragonflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.dragonfly],

  render: [
    'smp:site',
    'occ:adCount',
    'occ:coCount',
    'occ:ovCount',
    'occ:scCount',
    'occ:laCount',
    'occ:exCount',
    'occ:emCount',
    // 'smp:siteOther',
  ],

  attrs: {
    site: {
      menuProps: { icon: landIcon, label: 'Site type' },
      pageProps: {
        attrProps: {
          input: 'radio',
          inputProps: { options: siteTypeOptions },
        },
      },
      remote: { id: 59, values: siteTypeOptions },
    },
    // siteOther: {
    //   menuProps: { label: 'Other Site Typee' },
    //   pageProps: {
    //     attrProps: {
    //       input: 'text',
    //     },
    //   },
    //   remote: { id: 60 },
    // },
  },
  occ: {
    skipAutoIncrement: true,

    attrs: {
      adCount: {
        menuProps: { icon: numberIcon, label: 'Adults' },
        pageProps: {
          headerProps: { title: 'Adults' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 34, values: numRanges },
      },
      coCount: {
        menuProps: { icon: numberIcon, label: 'Cop. pairs' },
        pageProps: {
          headerProps: { title: 'Cop. pairs' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 35, values: numRanges },
      },
      ovCount: {
        menuProps: { icon: numberIcon, label: 'Ovip. females' },
        pageProps: {
          headerProps: { title: 'Ovip. females' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 36, values: numRanges },
      },
      scCount: {
        menuProps: { icon: numberIcon, label: 'Ovip. scars' },
        pageProps: {
          headerProps: { title: 'Ovip. scars' },
          attrProps: {
            input: 'radio',
            info: 'This attribute should be recorded for Willow Emerald only.',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 842, values: numRanges },
      },
      laCount: {
        menuProps: { icon: numberIcon, label: 'Larvae' },
        pageProps: {
          headerProps: { title: 'Larvae' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 37, values: numRanges },
      },
      exCount: {
        menuProps: { icon: numberIcon, label: 'Exuviae' },
        pageProps: {
          headerProps: { title: 'Exuviae' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 38, values: numRanges },
      },
      emCount: {
        menuProps: { icon: numberIcon, label: 'Emergents' },
        pageProps: {
          headerProps: { title: 'Emergents' },
          attrProps: {
            input: 'radio',
            info: 'How many individuals of this type?',
            inputProps: { options: numRanges },
          },
        },
        remote: { id: 39, values: numRanges },
      },
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
          'Stage is missing'
        )
        .safeParse(attrs).error,
  },
};

export default survey;
