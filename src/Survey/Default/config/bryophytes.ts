import { clipboardOutline } from 'ionicons/icons';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import landIcon from 'common/images/land.svg';
import { Survey } from 'Survey/common/config';

const habitatOptions = [
  { value: null, isDefault: true, label: 'Not selected' },
  { value: 'Arable land, gardens or parks', id: 1598 },
  { value: 'Bogs and fens', id: 1538 },
  { value: 'Coast', id: 1522 },
  { value: 'Grassland', id: 1550 },
  { value: 'Heathland, scrub, hedges', id: 1562 },
  { value: 'Industrial and urban', id: 1604 },
  { value: 'Inland water', id: 1530 },
  { value: 'Mixed habitats', id: 1616 },
  { value: 'Unvegetated or sparsely vegetated habitats', id: 1586 },
  { value: 'Woodland', id: 1574 },
];

const habitatAttr = {
  id: 'habitat',
  menuProps: { icon: landIcon },
  pageProps: {
    attrProps: {
      input: 'radio',
      inputProps: { options: habitatOptions },
    },
  },
  remote: { id: 208, values: habitatOptions },
} as const;

const microscopicallyCheckedAttr = {
  id: 'microscopicallyChecked',
  menuProps: {
    label: 'Microscopically Checked',
    icon: clipboardOutline,
    type: 'toggle',
  },
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 470 },
} as const;

const fruitAttr = {
  id: 'fruit',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 471 },
  menuProps: { icon: clipboardOutline, type: 'toggle' },
} as const;

const maleAttr = {
  id: 'male',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 475 },
  menuProps: { icon: genderIcon, type: 'toggle' },
} as const;

const femaleAttr = {
  id: 'female',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 476 },
  menuProps: { icon: genderIcon, type: 'toggle' },
} as const;

const bulbilsAttr = {
  id: 'bulbils',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 472 },
  menuProps: { icon: clipboardOutline, type: 'toggle' },
} as const;

const gemmaeAttr = {
  id: 'gemmae',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 473 },
  menuProps: { icon: clipboardOutline, type: 'toggle' },
} as const;

const tubersAttr = {
  id: 'tubers',
  pageProps: { attrProps: { input: 'toggle' } },
  remote: { id: 474 },
  menuProps: { icon: clipboardOutline, type: 'toggle' },
} as const;

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'bryophytes',
  taxaGroups: [groups.moss, groups.liverwort],

  render: [
    'smp:habitat',
    'occ:microscopicallyChecked',
    'occ:fruit',
    'occ:male',
    'occ:female',
    'occ:bulbils',
    'occ:gemmae',
    'occ:tubers',
  ],

  attrs: {
    [habitatAttr.id]: habitatAttr,
  },

  occ: {
    skipAutoIncrement: true,

    attrs: {
      sex: null as any, // disable for bulk-editing
      stage: null as any, // disable for bulk-editing

      [microscopicallyCheckedAttr.id]: microscopicallyCheckedAttr,
      [fruitAttr.id]: fruitAttr,
      [maleAttr.id]: maleAttr,
      [femaleAttr.id]: femaleAttr,
      [bulbilsAttr.id]: bulbilsAttr,
      [gemmaeAttr.id]: gemmaeAttr,
      [tubersAttr.id]: tubersAttr,
    },
  },
};

export default survey;
