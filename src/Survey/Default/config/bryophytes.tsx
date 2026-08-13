import { clipboardOutline } from 'ionicons/icons';
import { ChoiceInputConf, YesNoInputConf } from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import landIcon from 'common/images/land.svg';
import {
  commentAttr,
  identifiersAttr,
  Survey,
  taxonAttr,
} from 'Survey/common/config';
import { defaultSensitivityPrecisionAttr } from './common';

/** @deprecated */
export const habitatAttrOld = {
  id: 'habitat',
  remote: {
    id: 208,
    values: [
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
    ],
  },
} as const;

export const habitatAttr = {
  id: 'smpAttr:208',
  title: 'Habitat',
  prefix: <img src={landIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { dataName: '', title: 'Not selected' },
    { title: 'Arable land, gardens or parks', dataName: '1598' },
    { title: 'Bogs and fens', dataName: '1538' },
    { title: 'Coast', dataName: '1522' },
    { title: 'Grassland', dataName: '1550' },
    { title: 'Heathland, scrub, hedges', dataName: '1562' },
    { title: 'Industrial and urban', dataName: '1604' },
    { title: 'Inland water', dataName: '1530' },
    { title: 'Mixed habitats', dataName: '1616' },
    { title: 'Unvegetated or sparsely vegetated habitats', dataName: '1586' },
    { title: 'Woodland', dataName: '1574' },
  ],
} as const satisfies ChoiceInputConf;

const toggleAttr = (id: string, title: string, prefix: React.ReactNode) =>
  ({ id, title, prefix, type: 'yesNoInput' }) as const satisfies YesNoInputConf;

const clipboardPrefix = <IonIcon src={clipboardOutline} className="size-6" />;
const genderPrefix = <img src={genderIcon} alt="" className="size-6" />;

/** @deprecated */
export const microscopicallyCheckedAttrOld = {
  id: 'microscopicallyChecked',
  remote: { id: 470 },
} as const;
export const microscopicallyCheckedAttr = toggleAttr(
  'occAttr:470',
  'Microscopically Checked',
  clipboardPrefix
);

/** @deprecated */
export const fruitAttrOld = { id: 'fruit', remote: { id: 471 } } as const;
export const fruitAttr = toggleAttr('occAttr:471', 'Fruit', clipboardPrefix);

/** @deprecated */
export const maleAttrOld = { id: 'male', remote: { id: 475 } } as const;
export const maleAttr = toggleAttr('occAttr:475', 'Male', genderPrefix);

/** @deprecated */
export const femaleAttrOld = { id: 'female', remote: { id: 476 } } as const;
export const femaleAttr = toggleAttr('occAttr:476', 'Female', genderPrefix);

/** @deprecated */
export const bulbilsAttrOld = { id: 'bulbils', remote: { id: 472 } } as const;
export const bulbilsAttr = toggleAttr(
  'occAttr:472',
  'Bulbils',
  clipboardPrefix
);

/** @deprecated */
export const gemmaeAttrOld = { id: 'gemmae', remote: { id: 473 } } as const;
export const gemmaeAttr = toggleAttr('occAttr:473', 'Gemmae', clipboardPrefix);

/** @deprecated */
export const tubersAttrOld = { id: 'tubers', remote: { id: 474 } } as const;
export const tubersAttr = toggleAttr('occAttr:474', 'Tubers', clipboardPrefix);

const attrs = {
  [habitatAttr.id]: { block: habitatAttr },
};

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [identifiersAttr.id]: { block: identifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  sex: null as any, // disable for bulk-editing
  stage: null as any, // disable for bulk-editing

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
