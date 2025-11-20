import { useState, ReactNode } from 'react';
import clsx from 'clsx';
import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Button } from '@flumens';
import { IonContent, IonPopover, IonIcon } from '@ionic/react';
import './styles.scss';

type Props = {
  children: ReactNode;
  className?: string;
};

const Tooltip = ({ children, className }: Props) => {
  const [infoState, setShowInfo] = useState<any>({
    showInfo: false,
    event: undefined,
  });

  const showInfo = (e: any) => setShowInfo({ showInfo: true, event: e });
  const hideInfo = () => setShowInfo({ showInfo: false, event: undefined });

  return (
    <Button
      fill="clear"
      onPress={showInfo}
      className={clsx('inline-block py-0', className)}
      skipTranslation
    >
      <IonIcon src={informationCircleOutline} />
      <IonPopover
        className="info-popover [--width:300px]"
        event={infoState.event}
        isOpen={infoState.showInfo}
        onDidDismiss={hideInfo}
      >
        <IonContent>
          <T>{children}</T>
        </IonContent>
      </IonPopover>
    </Button>
  );
};

export default Tooltip;
