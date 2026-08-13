/* eslint-disable no-param-reassign */
import { eyeOffOutline, informationCircleOutline } from 'ionicons/icons';
import type {
  ChoiceInputConf,
  NumberInputConf,
  YesNoInputConf,
} from '@flumens';
import type { GroupConf, TextConf } from '@flumens/tailwind/dist/Survey';
import { getChoiceTitle } from '@flumens/tailwind/dist/components/Block';
import { IonIcon } from '@ionic/react';
import genderIcon from 'common/images/gender.svg';
import numberIcon from 'common/images/number.svg';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'common/models/app';
import { LockConfig } from 'Survey/common/Components/MenuAttr/Lock/types';

export const toChoice = ({ value, id, label }: any) => ({
  title: label || value,
  dataName: id ? `${id}` : '',
});

export const toChoices = (options: any[]) =>
  options.filter(option => !option.isPlaceholder).map(toChoice);

/** @deprecated */
export const numberAttrOld = {
  id: 'number',
  remote: { id: 16 },
} as const;

export const numberAttr = {
  id: 'occAttr:16',
  type: 'numberInput',
  container: 'inline',
  appearance: 'slider',
  validation: { max: 10000 },
  onChange: (val, _, { record }) => {
    record[numberAttr.id] = val;
    delete record[numberRangesAttr.id]; // eslint-disable-line @typescript-eslint/no-use-before-define
  },
} as const satisfies NumberInputConf;

/** @deprecated */
export const numberRangesAttrOld = {
  id: 'number-ranges',
  remote: {
    id: 523,
    values: [
      { value: null, isDefault: true, label: 'Present' },
      { value: '1', id: 665 },
      { value: '2-5', id: 666 },
      { value: '6-20', id: 667 },
      { value: '21-100', id: 668 },
      { value: '101-500', id: 669 },
      { value: '500+', id: 670 },
    ],
  },
} as const;

export const numberRangesAttr = {
  id: 'occAttr:523',
  type: 'choiceInput',
  choices: [
    { isPlaceholder: true, title: 'Ranges' } as any,
    { title: 'Present', dataName: '' },
    { title: '1', dataName: '665' },
    { title: '2-5', dataName: '666' },
    { title: '6-20', dataName: '667' },
    { title: '21-100', dataName: '668' },
    { title: '101-500', dataName: '669' },
    { title: '500+', dataName: '670' },
  ],
  onChange: (val, _, { record, history }) => {
    record[numberRangesAttr.id] = val;
    delete record[numberAttr.id]; // eslint-disable-line @typescript-eslint/no-use-before-define
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
    record[numberAttr.id] ||
    getChoiceTitle(numberRangesAttr, record[numberRangesAttr.id]),
  blocks: [
    {
      type: 'text',
      id: 'infoMessage',
      prefix: <IonIcon src={informationCircleOutline} className="size-6" />,
      color: 'tertiary',
      className: 'w-full',
      content: 'How many individuals of this species did you see?',
    } as TextConf,
    numberAttr,
    numberRangesAttr,
  ],
  lock: {
    get: ({ record }) => record[numberAttr.id] || record[numberRangesAttr.id],

    set: ({ record, survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', numberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', numberRangesAttr.id);

      if (record[numberAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          numberAttr.id,
          record[numberAttr.id]
        );
      }
      if (record[numberRangesAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          numberRangesAttr.id,
          record[numberRangesAttr.id]
        );
      }
    },

    isLocked: ({ record, survey, taxa }) =>
      record[numberAttr.id]
        ? appModel.locks.isLocked(
            survey,
            taxa,
            'occ',
            numberAttr.id,
            record[numberAttr.id]
          )
        : appModel.locks.isLocked(
            survey,
            taxa,
            'occ',
            numberRangesAttr.id,
            record[numberRangesAttr.id]
          ),

    unset: ({ survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', numberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', numberRangesAttr.id);
    },
  },
} as const satisfies GroupConf & { lock?: LockConfig };

/** @deprecated */
export const stageAttrOld = {
  id: 'stage',
  remote: {
    id: 106,
    values: [
      { label: 'Not Recorded', value: null, isDefault: true },
      { value: 'Adult', id: 1950 },
      { value: 'Pre-adult', id: 1951 },
      { value: 'Other', id: 1952 },
    ],
  },
} as const;

export const stageAttr = {
  id: 'occAttr:106',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'Adult', dataName: '1950' },
    { title: 'Pre-adult', dataName: '1951' },
    { title: 'Other', dataName: '1952' },
  ],
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const sexAttrOld = {
  id: 'sex',
  remote: {
    id: 105,
    values: [
      { label: 'Not Recorded', value: null, isDefault: true },
      { value: 'Male', id: 1947 },
      { value: 'Female', id: 1948 },
      { value: 'Mixed', id: 3482 },
    ],
  },
} as const;

export const sexAttr = {
  id: 'occAttr:105',
  title: 'Sex',
  prefix: <img src={genderIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'Male', dataName: '1947' },
    { title: 'Female', dataName: '1948' },
    { title: 'Mixed', dataName: '3482' },
  ],
} as const satisfies ChoiceInputConf;

export const defaultSensitivityPrecisionAttr = {
  id: 'sensitivityPrecision',
  title: 'Sensitive',
  prefix: <IonIcon src={eyeOffOutline} className="size-6" />,
  type: 'yesNoInput',
  choices: [{ dataName: '' }, { dataName: '1000' }],
} as const satisfies YesNoInputConf;
