/* eslint-disable no-param-reassign, @typescript-eslint/no-use-before-define */
import { informationCircleOutline } from 'ionicons/icons';
import {
  ChoiceInputConf,
  GroupConf,
  NumberInputConf,
  TextConf,
} from '@flumens/tailwind/dist/Survey';
import { getChoiceTitle } from '@flumens/tailwind/dist/components/Block';
import { IonIcon } from '@ionic/react';
import Tooltip from 'common/Components/Tooltip';
import { groupsReverse as groups } from 'common/data/informalGroups';
import numberIcon from 'common/images/number.svg';
import appModel from 'common/models/app';
import { LockConfig } from 'Survey/common/Components/MenuAttr/Lock/types';
import {
  commentAttr,
  identifiersAttr,
  plantStageAttr,
  Survey,
  taxonAttr,
} from 'Survey/common/config';
import { defaultSensitivityPrecisionAttr, sexAttr } from './common';

/** @deprecated */
export const plantFungiNumberAttrOld = {
  id: 'number',
  remote: { id: 16 },
} as const;

export const plantFungiNumberAttr = {
  id: 'occAttr:16',
  type: 'numberInput',
  appearance: 'slider',
  validation: { max: 10000 },
  onChange: (value, _, { record }) => {
    record[plantFungiNumberAttr.id] = value;
    delete record[plantFungiNumberDAFORAttr.id];
    delete record[plantFungiNumberRangesAttr.id];
    return null;
  },
} as const satisfies NumberInputConf;

/** @deprecated */
export const plantFungiNumberDAFORAttrOld = {
  id: 'numberDAFOR',
  remote: {
    id: 2,
    values: [
      { value: 'Dominant', id: 1 },
      { value: 'Abundant', id: 2 },
      { value: 'Frequent', id: 3 },
      { value: 'Occasional', id: 4 },
      { value: 'Rare', id: 5 },
    ],
  },
} as const;

export const plantFungiNumberDAFORAttr = {
  id: 'occAttr:2',
  type: 'choiceInput',
  choices: [
    {
      isPlaceholder: true,
      title: (
        <>
          DAFOR{' '}
          <Tooltip className="p-0 ml-2">
            <p>
              DAFOR refers to a subjective abundance scale comprising the
              following ordered terms: <b>D</b>ominant / <b>A</b>bundant /{' '}
              <b>F</b>requent / <b>O</b>ccasional / <b>R</b>are.
            </p>
            <p>
              Assessed abundance should either relate to the scale of the survey
              (e.g. 1 or 2 km grid squares), or be clearly qualified in the
              record comments field.
            </p>
          </Tooltip>
        </>
      ),
    } as any,
    { title: 'Dominant', dataName: '1' },
    { title: 'Abundant', dataName: '2' },
    { title: 'Frequent', dataName: '3' },
    { title: 'Occasional', dataName: '4' },
    { title: 'Rare', dataName: '5' },
  ],
  onChange: (value, _, { record, history }) => {
    record[plantFungiNumberDAFORAttr.id] = value;
    delete record[plantFungiNumberAttr.id];
    delete record[plantFungiNumberRangesAttr.id];
    history.goBack();
    return null;
  },
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const plantFungiNumberRangesAttrOld = {
  id: 'number-ranges',
  remote: {
    id: 523,
    values: [
      { isPlaceholder: true, title: 'Ranges' },
      { value: '1', id: 665 },
      { value: '2-5', id: 666 },
      { value: '6-20', id: 667 },
      { value: '21-100', id: 668 },
      { value: '101-500', id: 669 },
      { value: '500+', id: 670 },
    ],
  },
} as const;

export const plantFungiNumberRangesAttr = {
  id: 'occAttr:523',
  type: 'choiceInput',
  choices: [
    { isPlaceholder: true, title: 'Ranges' } as any,
    { title: '1', dataName: '665' },
    { title: '2-5', dataName: '666' },
    { title: '6-20', dataName: '667' },
    { title: '21-100', dataName: '668' },
    { title: '101-500', dataName: '669' },
    { title: '500+', dataName: '670' },
  ],
  onChange: (value, _, { record, history }) => {
    record[plantFungiNumberRangesAttr.id] = value;
    delete record[plantFungiNumberAttr.id];
    delete record[plantFungiNumberDAFORAttr.id];
    history.goBack();
    return null;
  },
} as const satisfies ChoiceInputConf;

export const plantFungiNumberPageAttr = {
  id: 'numberPage',
  type: 'group',
  title: 'Abundance',
  prefix: <img src={numberIcon} alt="" className="size-6" />,
  container: 'page',
  valueTitle: ({ record }) =>
    record[plantFungiNumberAttr.id] ||
    getChoiceTitle(
      plantFungiNumberDAFORAttr,
      record[plantFungiNumberDAFORAttr.id]
    ) ||
    getChoiceTitle(
      plantFungiNumberRangesAttr,
      record[plantFungiNumberRangesAttr.id]
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
    plantFungiNumberAttr,
    plantFungiNumberDAFORAttr,
    plantFungiNumberRangesAttr,
  ],
  lock: {
    get: ({ record }) =>
      record[plantFungiNumberAttr.id] ||
      record[plantFungiNumberDAFORAttr.id] ||
      record[plantFungiNumberRangesAttr.id],

    set: ({ record, survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberDAFORAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberRangesAttr.id);

      if (record[plantFungiNumberAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          plantFungiNumberAttr.id,
          record[plantFungiNumberAttr.id]
        );
      }
      if (record[plantFungiNumberDAFORAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          plantFungiNumberDAFORAttr.id,
          record[plantFungiNumberDAFORAttr.id]
        );
      }
      if (record[plantFungiNumberRangesAttr.id]) {
        appModel.locks.set(
          survey,
          taxa,
          'occ',
          plantFungiNumberRangesAttr.id,
          record[plantFungiNumberRangesAttr.id]
        );
      }
    },

    isLocked: ({ record, survey, taxa }) => {
      if (record[plantFungiNumberAttr.id]) {
        return appModel.locks.isLocked(
          survey,
          taxa,
          'occ',
          plantFungiNumberAttr.id,
          record[plantFungiNumberAttr.id]
        );
      }
      if (record[plantFungiNumberDAFORAttr.id]) {
        return appModel.locks.isLocked(
          survey,
          taxa,
          'occ',
          plantFungiNumberDAFORAttr.id,
          record[plantFungiNumberDAFORAttr.id]
        );
      }
      if (record[plantFungiNumberRangesAttr.id]) {
        return appModel.locks.isLocked(
          survey,
          taxa,
          'occ',
          plantFungiNumberRangesAttr.id,
          record[plantFungiNumberRangesAttr.id]
        );
      }
      return false;
    },
    unset: ({ survey, taxa }) => {
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberDAFORAttr.id);
      appModel.locks.unset(survey, taxa, 'occ', plantFungiNumberRangesAttr.id);
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
  [plantStageAttr.id]: { block: plantStageAttr },
  [plantFungiNumberPageAttr.id]: { block: plantFungiNumberPageAttr },
  [plantFungiNumberAttr.id]: { block: plantFungiNumberAttr },
  [plantFungiNumberDAFORAttr.id]: { block: plantFungiNumberDAFORAttr },
  [plantFungiNumberRangesAttr.id]: { block: plantFungiNumberRangesAttr },
  [sexAttr.id]: { block: sexAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'plants-fungi',
  taxaGroups: [
    groups['flower. plant'],
    groups.clubmoss,
    groups.fern,
    groups.horsetail,
    groups.conifer,
    groups.stonewort,
    groups.fungus,

    // disabled because there is a bryophytes config
    // groups.moss,
    // groups.liverwort
  ],

  occ: {
    render: [
      plantFungiNumberPageAttr,
      plantStageAttr,
      sexAttr,
      identifiersAttr,
    ],
    skipAutoIncrement: true,

    attrs: occAttrs,
  },
};

export default survey;
