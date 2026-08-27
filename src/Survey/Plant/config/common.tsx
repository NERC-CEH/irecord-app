/* eslint-disable no-param-reassign */
import {
  arrowUpCircleOutline,
  pencilOutline,
  peopleOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { z } from 'zod';
import { InfoButton } from '@flumens';
import {
  ChoiceInputConf,
  NumberInputConf,
  TextInputConf,
} from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';
import numberIcon from 'common/images/number.svg';

const abundanceRegex = /^(\d+|[DAFORdafor]|[Ll][Aa]|[Ll][Ff])$/;

export const abundanceSchema = z
  .unknown()
  .refine(
    value => value === '' || abundanceRegex.test(`${value}`),
    'Abundance must be a count, D, A, F, O, R, LA or LF.'
  )
  .nullish();

export const abundanceAttr = {
  id: 'occAttr:610',
  title: 'Abundance',
  prefix: <IonIcon src={numberIcon} className="size-6" />,
  type: 'textInput',
  container: 'page',
  description: (
    <T>
      Abundance (DAFOR, LA, LF or count).
      <InfoButton label="READ MORE" header="Info" color="tertiary">
        <p>
          DAFOR refers to a subjective abundance scale comprising the following
          ordered terms: <b>D</b>ominant / <b>A</b>
          bundant / <b>F</b>requent / <b>O</b>ccasional / <b>R</b>
          are. The prefix "Locally" can also be used with the Abundant and
          Frequent classes (e.g. LA = Locally Abundant).
        </p>
        <p>
          Assessed abundance should either relate to the scale of the survey
          (e.g. 1 or 2 km grid squares), or be clearly qualified in the record
          comments field.
        </p>
      </InfoButton>
    </T>
  ),
  validation: { pattern: abundanceRegex.source },
  onChange: (val, op, { record }) => {
    record[abundanceAttr.id] = val.toUpperCase();
  },
} as const satisfies TextInputConf;

export const altitudeAttr = {
  id: 'occAttr:577',
  title: 'Altitude',
  type: 'numberInput',
  prefix: <IonIcon icon={arrowUpCircleOutline} className="size-6" />,
  appearance: 'counter',
} as const satisfies NumberInputConf;

export const statusAttr = {
  id: 'occAttr:507',
  title: 'Status',
  prefix: <IonIcon src={pencilOutline} className="size-6" />,
  type: 'choiceInput',
  appearance: 'button',
  choices: [
    { title: 'Not Recorded', dataName: '' },
    { title: 'Native - origin unknown', dataName: '17548' },
    { title: 'Introduced - accidental', dataName: '17549' },
    { title: 'Introduced - accidental - regenerating', dataName: '17550' },
    { title: 'Introduced - intentional', dataName: '17551' },
    { title: 'Introduced - intentional - regenerating', dataName: '17552' },
    { title: 'Introduced - origin unknown', dataName: '17553' },
    {
      title: 'Introduced - origin unknown - regenerating',
      dataName: '17554',
    },

    // hidden choices for legacy records
    { title: 'Native', dataName: '5709', className: 'hidden' },
    { title: 'Unknown', dataName: '5710', className: 'hidden' },
    { title: 'Introduced', dataName: '6775', className: 'hidden' },
    { title: 'Introduced - planted', dataName: '5711', className: 'hidden' },
    { title: 'Introduced - surviving', dataName: '10662', className: 'hidden' },
    { title: 'Introduced - casual', dataName: '10663', className: 'hidden' },
    {
      title: 'Introduced - established',
      dataName: '5712',
      className: 'hidden',
    },
    { title: 'Introduced - invasive', dataName: '5713', className: 'hidden' },
  ],
} as const satisfies ChoiceInputConf;

const plantOccIdentifiersAttr = {
  id: 'occAttr:125',
  title: 'Identified by',
  prefix: <IonIcon icon={peopleOutline} className="size-6" />,
  type: 'textInput',
  container: 'page',
  multiple: true,
  placeholder: 'Name',
  description:
    'If another person identified the species for you, please enter their name here.',
} as const satisfies TextInputConf;

export default plantOccIdentifiersAttr;
