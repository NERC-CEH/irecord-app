import { starOutline } from 'ionicons/icons';
import { MapContainer } from '@flumens';
import { IonIcon } from '@ionic/react';
import './styles.scss';

type Props = { onClick: any };

const PastLocationsControl = ({ onClick }: Props) => {
  return (
    <MapContainer.Control>
      <button
        onClick={onClick}
        className="map-control-past-locations"
        aria-label="past locations"
      >
        <IonIcon slot="icon-only" icon={starOutline} />
      </button>
    </MapContainer.Control>
  );
};

export default PastLocationsControl;
