import { useState } from 'react';
import { IonContent, IonPopover } from '@ionic/react';
import Badge from './Badge';

interface Props {
  probability?: number;
  className?: string;
  showInfo?: boolean;
}

const ProbabilityBadge = ({ probability, className, showInfo }: Props) => {
  const [infoState, setShowInfo] = useState<any>({
    showInfo: false,
    event: undefined,
  });

  const onShowInfo = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInfo({ showInfo: true, event: e });
  };

  const hideInfo = () => setShowInfo({ showInfo: false, event: undefined });

  return (
    <>
      <Badge
        probability={probability}
        className={className}
        onClick={showInfo ? onShowInfo : undefined}
      />

      <IonPopover
        className="info-popover [--width:200px]"
        event={infoState.event}
        isOpen={infoState.showInfo}
        onDidDismiss={hideInfo}
        size="auto"
      >
        <IonContent className="[--background:white] [--overflow:hidden]">
          <div className="pl-2 [&>*]:my-4 [&>*]:flex [&>*]:items-center [&>*]:gap-2">
            <div>
              <Badge probability={1} /> Higher classifier confidence.
            </div>
            <div>
              <Badge probability={0.5} /> Moderate classifier confidence.
            </div>
            <div>
              <Badge probability={0.2} />
              Lower classifier confidence.
            </div>
          </div>
        </IonContent>
      </IonPopover>
    </>
  );
};

export default ProbabilityBadge;
