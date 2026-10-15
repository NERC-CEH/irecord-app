import { object } from 'zod';
import { ChoiceInputConf } from '@flumens/tailwind/dist/Survey';
import { groupsReverse as groups } from 'common/data/informalGroups';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'models/app';
import Occurrence, { MachineInvolvement, type Data } from 'models/occurrence';
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
export const mammalStageAttrOld = {
  id: 'stage',
  remote: {
    id: 873,
    values: [
      { value: 'Not Recorded', id: 17668 },
      { value: 'Adult', id: 17665 },
      { value: 'Immature', id: 17666 },
      { value: 'Dead - roadkill', id: 21693 },
      { value: 'Other', id: 17667 },
      { value: 'Dead - other', id: 21694 },
    ],
  },
} as const;

export const mammalStageAttr = {
  id: 'occAttr:873',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '17668' },
    { title: 'Adult', dataName: '17665' },
    { title: 'Immature', dataName: '17666' },
    { title: 'Dead - roadkill', dataName: '21693' },
    { title: 'Other', dataName: '17667' },
    { title: 'Dead - other', dataName: '21694' },
  ],
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
  [mammalStageAttr.id]: { block: mammalStageAttr },
  [sexAttr.id]: { block: sexAttr },
};

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'mammals',
  taxaGroups: [groups.mammal],

  occ: {
    render: [numberPageAttr, mammalStageAttr, sexAttr, identifiersAttr],

    attrs: occAttrs,

    getDefaultValues: ({ data, isListSurvey }) =>
      isListSurvey &&
      data[numberAttr.id] == null &&
      data[numberRangesAttr.id] == null
        ? { [numberAttr.id]: 1 }
        : {},

    async create({ images, taxon, isListSurvey }) {
      const occurrence = new Occurrence<Data>({
        data: {
          machineInvolvement: MachineInvolvement.NONE,
          taxon,
        },
        media: images,
      });

      const locks = appModel.locks.getAll(
        isListSurvey ? 'list' : 'default',
        survey.taxa
      );
      Object.assign(occurrence.data, locks.occ);

      Object.assign(
        occurrence.data,
        survey.occ?.getDefaultValues?.({ data: occurrence.data, isListSurvey })
      );

      return occurrence;
    },

    verify: attrs =>
      object({
        taxon: object({}, { error: 'Species is missing.' }).nullable(),
      }).safeParse(attrs).error,
  },
};

export default survey;
