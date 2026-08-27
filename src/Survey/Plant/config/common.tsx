import { arrowUpCircleOutline, peopleOutline } from 'ionicons/icons';
import { NumberInputConf, TextInputConf } from '@flumens/tailwind/dist/Survey';
import { IonIcon } from '@ionic/react';

export const altitudeAttr = {
  id: 'occAttr:577',
  title: 'Altitude',
  type: 'numberInput',
  prefix: <IonIcon icon={arrowUpCircleOutline} className="size-6" />,
  appearance: 'counter',
} as const satisfies NumberInputConf;

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
