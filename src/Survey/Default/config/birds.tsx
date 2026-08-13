import { clipboardOutline } from 'ionicons/icons';
import { ChoiceInputConf } from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import { groupsReverse as groups } from 'common/data/informalGroups';
import { inferAttrConfigTypes, OccurrenceData } from 'common/flumens';
import progressIcon from 'common/images/progress-circles.svg';
import appModel from 'common/models/app';
import Occurrence, { MachineInvolvement } from 'common/models/occurrence';
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
export const breedingAttrOld = {
  id: 'breeding',
  remote: {
    id: 823,
    values: [
      { value: null, isDefault: true, label: 'Not recorded' },
      { value: '00: Migration, Flying or Summering (M/F/U)', id: 17588 },
      { value: '01: Nesting habitat (H)', id: 17589 },
      { value: '02: Singing male (S)', id: 17590 },
      { value: '03: Pair in suitable habitat (P)', id: 17591 },
      { value: '04: Permanent territory (T)', id: 17592 },
      { value: '05: Courtship and display (D)', id: 17593 },
      { value: '06: Visiting probable nest site (N)', id: 17594 },
      { value: '07: Agitated behaviour (A)', id: 17595 },
      { value: '08: Brood patch on incubating adult (I)', id: 17596 },
      { value: '09: Nest building (B)', id: 17597 },
      { value: '10: Distraction display (DD)', id: 17598 },
      { value: '11: Used nest or eggshells (UN)', id: 17599 },
      { value: '12: Recently fledged (FL)', id: 17600 },
      { value: '13: Occupied nest (ON)', id: 17601 },
      { value: '14: Faecal sac or food (FF)', id: 17602 },
      { value: '15: Nest with eggs (NE)', id: 17603 },
      { value: '16: Nest with young (NY)', id: 17604 },
    ],
  },
} as const;

export const breedingAttr = {
  id: 'occAttr:823',
  title: 'Breeding',
  prefix: <IonIcon src={clipboardOutline} className="size-6" />,
  type: 'choiceInput',
  container: 'page',
  appearance: 'list',
  choices: [
    { dataName: '', title: 'Not recorded' },

    { isPlaceholder: true, title: 'Non-breeding' },
    { title: '00: Migration, Flying or Summering (M/F/U)', dataName: '17588' },

    { isPlaceholder: true, title: 'Possible breeding' },
    { title: '01: Nesting habitat (H)', dataName: '17589' },
    { title: '02: Singing male (S)', dataName: '17590' },

    { isPlaceholder: true, title: 'Probable breeding' },
    { title: '03: Pair in suitable habitat (P)', dataName: '17591' },
    { title: '04: Permanent territory (T)', dataName: '17592' },
    { title: '05: Courtship and display (D)', dataName: '17593' },
    { title: '06: Visiting probable nest site (N)', dataName: '17594' },
    { title: '07: Agitated behaviour (A)', dataName: '17595' },
    { title: '08: Brood patch on incubating adult (I)', dataName: '17596' },
    { title: '09: Nest building (B)', dataName: '17597' },

    { isPlaceholder: true, title: 'Confirmed breeding' } as any,
    { title: '10: Distraction display (DD)', dataName: '17598' },
    { title: '11: Used nest or eggshells (UN)', dataName: '17599' },
    { title: '12: Recently fledged (FL)', dataName: '17600' },
    { title: '13: Occupied nest (ON)', dataName: '17601' },
    { title: '14: Faecal sac or food (FF)', dataName: '17602' },
    { title: '15: Nest with eggs (NE)', dataName: '17603' },
    { title: '16: Nest with young (NY)', dataName: '17604' },
  ],
} as const satisfies ChoiceInputConf;

/** @deprecated */
export const birdStageAttrOld = {
  id: 'stage',
  remote: {
    id: 872,
    values: [
      { value: 'Not Recorded', id: 17664 },
      { value: 'Adult', id: 17658 },
      { value: 'Immature', id: 17659 },
      { value: 'Chick', id: 17660 },
      { value: 'Egg', id: 17661 },
      { value: 'Nest', id: 17662 },
      { value: 'Other', id: 17663 },
    ],
  },
} as const;

export const birdStageAttr = {
  id: 'occAttr:872',
  title: 'Stage',
  prefix: <img src={progressIcon} alt="" className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '17664' },
    { title: 'Adult', dataName: '17658' },
    { title: 'Immature', dataName: '17659' },
    { title: 'Chick', dataName: '17660' },
    { title: 'Egg', dataName: '17661' },
    { title: 'Nest', dataName: '17662' },
    { title: 'Other', dataName: '17663' },
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
  [birdStageAttr.id]: { block: birdStageAttr },
  [breedingAttr.id]: { block: breedingAttr },
  [sexAttr.id]: { block: sexAttr },
};

export type OccData = OccurrenceData & inferAttrConfigTypes<typeof occAttrs>;

const survey: Partial<Survey> & { taxa: string } = {
  taxa: 'birds',
  taxaGroups: [groups.bird],

  occ: {
    render: [
      numberPageAttr,
      birdStageAttr,
      breedingAttr,
      sexAttr,
      identifiersAttr,
    ],

    attrs: occAttrs,

    async create({ images, taxon, isListSurvey }) {
      const occurrence = new Occurrence<OccData>({
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

      if (
        isListSurvey &&
        !occurrence.data[numberAttr.id] &&
        !occurrence.data[numberRangesAttr.id]
      ) {
        occurrence.data[numberAttr.id] = 1;
      }
      return occurrence;
    },
  },
};

export default survey;
