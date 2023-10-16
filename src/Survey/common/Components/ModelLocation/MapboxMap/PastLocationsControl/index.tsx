import { starOutline } from 'ionicons/icons';
import { MapContainer } from '@flumens';
import { IonButton, IonIcon } from '@ionic/react';
import './styles.scss';

type Props = { onClick: any };

const PastLocationsControl = ({ onClick }: Props) => {
  return (
    <MapContainer.Control>
      <IonButton
        onClick={onClick}
        shape="round"
        color="light"
        className="map-control-past-locations"
      >
        <IonIcon slot="icon-only" icon={starOutline} />
      </IonButton>
    </MapContainer.Control>
  );
};

export default PastLocationsControl;
