import { clipboardOutline } from 'ionicons/icons';
import landIcon from 'common/images/land.svg';
import genderIcon from 'common/images/gender.svg';
import { groupsReverse as groups } from 'common/data/informalGroups';
import { Survey } from './';

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

const survey: Partial<Survey> & { group: string } = {
  group: 'bryophytes',
  taxonGroups: [groups.moss, groups.liverwort],
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
    habitat: {
      menuProps: { icon: landIcon },
      pageProps: {
        attrProps: {
          input: 'radio',
          inputProps: { options: habitatOptions },
        },
      },
      remote: { id: 208, values: habitatOptions },
    },
  },

  occ: {
    skipAutoIncrement: true,

    attrs: {
      microscopicallyChecked: {
        menuProps: {
          label: 'Microscopically Checked',
          icon: clipboardOutline,
          type: 'toggle',
        },
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 470 },
      },

      fruit: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 471 },
        menuProps: { icon: clipboardOutline, type: 'toggle' },
      },

      male: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 475 },
        menuProps: { icon: genderIcon, type: 'toggle' },
      },

      female: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 476 },
        menuProps: { icon: genderIcon, type: 'toggle' },
      },

      bulbils: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 472 },
        menuProps: { icon: clipboardOutline, type: 'toggle' },
      },

      gemmae: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 473 },
        menuProps: { icon: clipboardOutline, type: 'toggle' },
      },

      tubers: {
        pageProps: { attrProps: { input: 'toggle' } },
        remote: { id: 474 },
        menuProps: { icon: clipboardOutline, type: 'toggle' },
      },
    },
  },
};

export default survey;
