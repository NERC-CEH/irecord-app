import { FC, useState, useRef } from 'react';
import {
  IonIcon,
  IonButton,
  IonModal,
  IonContent,
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonHeader,
  IonToolbar,
  isPlatform,
} from '@ionic/react';
import {
  ModelLocation as ModelLocationOrig,
  useToast,
  HandledError,
} from '@flumens';
import Sample from 'models/sample';
import appModel from 'models/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { starOutline } from 'ionicons/icons';
import L from 'leaflet';
import config from 'common/config';
import { GPS_DISABLED_ERROR_MESSAGE } from 'helpers/GPS';
import locationNameIcon from 'common/images/location-name.svg';
import PastLocationsList from 'Components/PastLocationsList';
import './styles.scss';

type Props = {
  sample: Sample;
  subSample?: Sample;
  locationNameProps?: any;
};

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

const ModelLocation: FC<Props> = ({ sample, subSample, ...otherProps }) => {
  const toast = useToast();
  const [showPastLocations, setShowPastLocations] = useState(false);
  const model = subSample || sample;

  const buttonRef = useRef<any>(null);
  const fixFavBtnClickMapPropagation = () =>
    buttonRef.current && L.DomEvent.disableClickPropagation(buttonRef.current);
  useIonViewDidEnter(fixFavBtnClickMapPropagation);

  const fixOpenModalWhenLeavingPage = () => setShowPastLocations(false);
  useIonViewWillLeave(fixOpenModalWhenLeavingPage);

  const setLocation = async (loc: any, reset = false) => {
    let location = loc;

    if (model.isGPSRunning()) model.stopGPS(); // we don't need the GPS running and overwriting the selected location

    if (!reset) {
      // extend old location to preserve its previous attributes like name or id
      const oldLocation = model.attrs.location || {};
      location = { ...oldLocation, ...location };
    }

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    model.attrs.location = location;

    if (location.latitude) appModel.setLocation(location);

    const onError = (error: any) => console.log(error);
    return model.save().catch(onError);
  };

  const onSelectPastLoaction = (location: any) => {
    if (sample.isGPSRunning()) sample.stopGPS();
    setShowPastLocations(false);

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    // eslint-disable-next-line no-param-reassign
    model.attrs.location = location;
    model.save();
  };

  async function onGPSClick() {
    try {
      await ModelLocationOrig.utils.onGPSClick(model);
    } catch (error: any) {
      if (error.message === GPS_DISABLED_ERROR_MESSAGE) {
        toast.error(new HandledError(GPS_DISABLED_ERROR_MESSAGE));
        return;
      }

      toast.error(error);
    }
  }

  return (
    <>
      <ModelLocationOrig
        model={model} // eslint-disable-line
        mapProviderOptions={config.map}
        useGridRef
        useGridMap
        onGPSClick={onGPSClick}
        backButtonProps={{ text: 'Back' }}
        setLocation={setLocation}
        locationNameProps={{
          onChange: ModelLocationOrig.utils.onLocationNameChange,
          suggestLocations: appModel.attrs.locations || [],
          placeholder: 'Site name eg nearby village',
          icon: locationNameIcon,
          geocodingParams: {
            access_token: config.map.mapboxApiKey,
            types: 'locality,place,district,neighborhood,region,postcode',
            country: 'GB',
          },
        }}
        className="with-past-locations"
        {...otherProps}
      >
        <div className="leaflet-control-button leaflet-control past-locations-control">
          <div className="leaflet-buttons-control-button">
            <IonButton
              ref={buttonRef}
              onClick={(e: any) => {
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                e.preventDefault();
                e.stopPropagation();

                setShowPastLocations(true);
              }}
              fill="clear"
              color="dark"
            >
              <IonIcon src={starOutline} />
            </IonButton>
          </div>
        </div>

        <IonModal
          id="bottom-sheet"
          isOpen={showPastLocations}
          backdropDismiss={false}
          backdropBreakpoint={0.5}
          breakpoints={SNAP_POSITIONS}
          initialBreakpoint={DEFAULT_SNAP_POSITION}
          canDismiss
          onIonModalWillDismiss={() => {
            setShowPastLocations(false);
          }}
        >
          <IonHeader class="ion-no-border">
            <IonToolbar />
          </IonHeader>
          <IonContent>
            <PastLocationsList onSelect={onSelectPastLoaction} />
          </IonContent>
        </IonModal>
      </ModelLocationOrig>
    </>
  );
};

(ModelLocation as any).WithoutName = (props: Props) => (
  <ModelLocation {...props} locationNameProps={{}} />
);

export default ModelLocation;
