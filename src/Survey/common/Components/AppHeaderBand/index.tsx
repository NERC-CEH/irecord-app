import { FC } from 'react';
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  isPlatform,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import clsx from 'clsx';
import './styles.scss';

type Props = {
  title?: string;
  activity?: boolean;
  training?: boolean;
};

const AppHeaderBand: FC<Props> = ({ title: titleProp, activity, training }) => {
  const title = !training ? titleProp : 'Training Mode';

  const isAndroid = isPlatform('android');

  return (
    <IonToolbar className={clsx('app-header-band', { activity, training })}>
      {isAndroid && (
        <IonButtons slot="start">
          <IonBackButton text="back" defaultHref="">
            {/* Placeholder only */}
          </IonBackButton>
        </IonButtons>
      )}

      <IonTitle size="small">
        <span>
          <T>{title}</T>
        </span>
      </IonTitle>

      {isAndroid && <IonButtons>{/* Placeholder only */}</IonButtons>}
    </IonToolbar>
  );
};

export default AppHeaderBand;
