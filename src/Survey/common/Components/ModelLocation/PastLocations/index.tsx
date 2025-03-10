import { closeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonContent,
  isPlatform,
  IonButton,
  IonButtons,
  IonIcon,
  IonTitle,
} from '@ionic/react';
import Sample from 'models/sample';
import PastLocationsList from 'Components/PastLocationsList';
import './styles.scss';

const SNAP_POSITIONS = [0, 0.35, 0.6, 1];
const DEFAULT_SNAP_POSITION = 0.35;

type Props = {
  model: Sample;
  isOpen: boolean;
  onClose: any;
};

const PastLocations = ({ model, isOpen, onClose }: Props) => {
  const onSelectPastLocation = (location: any) => {
    if (model.isGPSRunning()) model.stopGPS();
    onClose();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    Object.assign(model.data.location, location);
    model.save();
  };

  return (
    <IonModal
      id="bottom-sheet-tracks"
      isOpen={isOpen}
      backdropDismiss={false}
      backdropBreakpoint={0.5}
      breakpoints={SNAP_POSITIONS}
      initialBreakpoint={DEFAULT_SNAP_POSITION}
      canDismiss
      onIonModalWillDismiss={onClose}
    >
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>
            <T>Past Locations</T>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon slot="icon-only" icon={closeOutline} color="medium" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PastLocationsList onSelect={onSelectPastLocation} />
      </IonContent>
    </IonModal>
  );
};

export default PastLocations;
