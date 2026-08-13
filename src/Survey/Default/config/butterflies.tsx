/* eslint-disable no-param-reassign */
import { informationCircleOutline } from 'ionicons/icons';
import { object, string } from 'zod';
import {
  ChoiceInputConf,
  GroupConf,
  NumberInputConf,
  TextConf,
} from '@flumens/tailwind/dist/Survey';
import { getChoiceTitle } from '@flumens/tailwind/dist/components/Block';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'common/models/app';
import { LockConfig } from 'Survey/common/Components/MenuAttr/Lock/types';
import {
  commentAttr,
  identifiersAttr,
  Survey,
  taxonAttr,
} from 'Survey/common/config';
import { defaultSensitivityPrecisionAttr } from './common';

/** @deprecated */
export const butterflySexAttrOld = {
  id: 'sex',
  remote: {
    id: 105,
    values: [
      { value: null, isDefault: true, label: 'Not Recorded' },
      { value: 'Male', id: 1947 },
      { value: 'Female', id: 1948 },
      { value: 'Mixed', id: 3482 },
    ],
  },
} as const;

export const butterflySexAttr = {
  id: 'occAttr:105',
  title: 'Sex',
  prefix: <img src={genderIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { dataName: '', title: 'Not Recorded' },
    { title: 'Male', dataName: '1947' },
    { title: 'Female', dataName: '1948' },
    { title: 'Mixed', dataName: '3482' },
  ],
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const butterflyStageAttrOld = {
  id: 'stage',
  remote: {
    id: 293,
    values: [
      { value: 'Adult', id: 3929 },
      { value: 'Egg', id: 3932 },
      { value: 'Larva', id: 3931 },
      { value: 'Larval web', id: 14079 },
      { value: 'Pupa', id: 3930 },
    ],
  },
} as const;

export const butterflyStageAttr = {
  id: 'occAttr:293',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Adult', dataName: '3929' },
    { title: 'Egg', dataName: '3932' },
    { title: 'Larva', dataName: '3931' },
    { title: 'Larval web', dataName: '14079' },
    { title: 'Pupa', dataName: '3930' },
  ],
  validation: { required: true },
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const butterflyNumberAttrOld = {
  id: 'number',
  remote: { id: 16 },
} as const;

export const butterflyNumberAttr = {
  id: 'occAttr:16',
  type: 'numberInput',
  appearance: 'slider',
  validation: { max: 10000 },
  onChange: (val, _, { record }) => {
    record[butterflyNumberAttr.id] = val;
    delete record[butterflyNumberRangesAttr.id]; // eslint-disable-line @typescript-eslint/no-use-before-define
  },
} as const satisfies NumberInputConf;

/** @deprecated */
export const butterflyNumberRangesAttrOld = {
  id: 'number-ranges',
  remote: {
    id: 203,
    values: [
      { value: null, isDefault: true, label: 'Not Recorded' },
      { value: '1', id: 2402 },
      { value: '2-9', id: 2404 },
      { value: '10-29', id: 2406 },
      { value: '30-99', id: 2408 },
      { value: '100+', id: 2410 },
    ],
  },
} as const;

export const butterflyNumberRangesAttr = {
  id: 'occAttr:203',
  type: 'choiceInput',
  choices: [
    { isPlaceholder: true, title: 'Ranges' } as any,
    { dataName: '', title: 'Not Recorded' },
    { title: '1', dataName: '2402' },
    { title: '2-9', dataName: '2404' },
    { title: '10-29', dataName: '2406' },
    { title: '30-99', dataName: '2408' },
    { title: '100+', dataName: '2410' },
  ],
  onChange: (val, _, { record, history }) => {
    record[butterflyNumberRangesAttr.id] = val;
    delete record[butterflyNumberAttr.id]; // eslint-disable-line @typescript-eslint/no-use-before-define
    history.goBack();
  },
} as const satisfies ChoiceInputConf;

export const numberPageAttr = {
  id: 'numberPage',
  type: 'group',
  title: 'Abundance',
  prefix: <img src={numberIcon} alt="" className="size-6" />,
  container: 'page',
  valueTitle: ({ record }) =>
    record[butterflyNumberAttr.id] ||
    getChoiceTitle(
      butterflyNumberRangesAttr,
      record[butterflyNumberRangesAttr.id]
    ),
  blocks: [
    {
      type: 'text',
      id: 'infoMessage',
      prefix: <IonIcon src={informationCircleOutline} className="size-6" />,
      color: 'tertiary',
      className: 'w-full',
      content: 'How many individuals of this species did you see?',
    } as TextConf,
    butterflyNumberAttr,
    butterflyNumberRangesAttr,
  ],
  lock: {
    get: ({ record }) =>
      record[butterflyNumberAttr.id] || record[butterflyNumberRangesAttr.id],

    set: ({ record, survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', butterflyNumberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', butterflyNumberRangesAttr.id);

      if (record[butterflyNumberAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          butterflyNumberAttr.id,
          record[butterflyNumberAttr.id]
        );
      }
      if (record[butterflyNumberRangesAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          butterflyNumberRangesAttr.id,
          record[butterflyNumberRangesAttr.id]
        );
      }
    },

    isLocked: ({ record, survey, taxa }) =>
      record[butterflyNumberAttr.id]
        ? appModel.locks.isLocked(
            survey,
            taxa,
            'occ',
            butterflyNumberAttr.id,
            record[butterflyNumberAttr.id]
          )
        : appModel.locks.isLocked(
            survey,
            taxa,
            'occ',
            butterflyNumberRangesAttr.id,
            record[butterflyNumberRangesAttr.id]
          ),

    unset: ({ survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', butterflyNumberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', butterflyNumberRangesAttr.id);
    },
  },
} as const satisfies GroupConf & { lock?: LockConfig };

const occAttrs = {
  [taxonAttr.id]: taxonAttr,
  [identifiersAttr.id]: { block: identifiersAttr },
  [commentAttr.id]: { block: commentAttr },
  [defaultSensitivityPrecisionAttr.id]: {
    block: defaultSensitivityPrecisionAttr,
  },
  [butterflySexAttr.id]: { block: butterflySexAttr },
  [butterflyStageAttr.id]: { block: butterflyStageAttr },
  [butterflyNumberAttr.id]: { block: butterflyNumberAttr },
  [butterflyNumberRangesAttr.id]: { block: butterflyNumberRangesAttr },
  [numberPageAttr.id]: { block: numberPageAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'butterflies',
  taxaPriority: 2, // must be higher than arthropods
  taxaGroups: [groups.butterfly],

  occ: {
    render: [
      numberPageAttr,
      butterflyStageAttr,
      butterflySexAttr,
      identifiersAttr,
    ],

    attrs: occAttrs,

    verify: (attrs: any) =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
        [butterflyStageAttr.id]: string({
          error: 'Stage is missing.',
        }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
