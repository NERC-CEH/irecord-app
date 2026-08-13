import { useRef } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  lockOpenOutline,
  lockClosedOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useToast, useAlert } from '@flumens';
import {
  IonLabel,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  isPlatform,
} from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import MenuLocation from '..';
import './styles.scss';

export type Props = {
  survey: string;
  taxa?: string;
  sample: Sample;
  label?: string;
};

const Lock = ({ survey, taxa, sample, label }: Props) => {
  const sliderRef = useRef<any>(null);
  const toast = useToast();
  const alert = useAlert();

  const { location, locationName } = sample.data;
  const isLocationLocked = appModel.locks.isLocked(
    survey,
    taxa,
    'smp',
    'location',
    location
  );
  const isLocationNameLocked = appModel.locks.isLocked(
    survey,
    taxa,
    'smp',
    'locationName',
    locationName
  );
  const isAnyLocked = isLocationLocked || isLocationNameLocked;
  // don't lock GPS because it varies more than a map or gridref
  const canLockLocation = !!location?.latitude;
  const canLockName = !!locationName;
  const gpsLocationSource = location?.source === 'gps';

  const toggleLocationLockWrap = () => {
    if (gpsLocationSource) {
      alert({
        header: "Can't lock location",
        message:
          'You can lock the location only if it was selected using a map or entered manually.',
        buttons: [{ text: 'OK, got it' }],
      });

      return;
    }
    sliderRef.current.close();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (isLocationLocked) {
      appModel.locks.unset(survey, taxa, 'smp', 'location');
      return;
    }

    if (!canLockLocation) return;

    const clonedLocation = JSON.parse(JSON.stringify(location));

    toast.success(
      'The attribute value was locked and will be pre-filled for subsequent records.',
      {
        color: 'secondary',
        position: 'bottom',
      }
    );

    appModel.locks.set(survey, taxa, 'smp', 'location', clonedLocation);
  };

  const toggleNameLockWrap = () => {
    sliderRef.current.close();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

    if (isLocationNameLocked) {
      appModel.locks.unset(survey, taxa, 'smp', 'locationName');
      return;
    }

    const { locationName: name } = sample.data;
    if (!name) return;

    toast.success(
      'The attribute value was locked and will be pre-filled for subsequent records.',
      {
        color: 'secondary',
        position: 'bottom',
      }
    );

    appModel.locks.set(survey, taxa, 'smp', 'locationName', name);
  };

  const { isDisabled } = sample;

  const allowLocking = canLockName || canLockLocation;

  const locationColor = gpsLocationSource ? 'medium' : 'secondary';

  return (
    <IonItemSliding
      ref={sliderRef}
      disabled={isDisabled || !allowLocking}
      className="menu-attr-item-location-with-lock"
    >
      <MenuLocation
        sample={sample}
        detailIcon={isAnyLocked ? lockClosedOutline : chevronForwardOutline}
        className={clsx(
          { locked: isAnyLocked },
          isLocationNameLocked && 'location-name-value-locked',
          isLocationLocked && 'location-value-locked'
        )}
        label={label}
      />

      <IonItemOptions side="end">
        {canLockLocation && (
          <IonItemOption
            className={clsx('lock', isLocationLocked && 'locked')}
            color={locationColor}
            onClick={toggleLocationLockWrap}
          >
            <div className="label-wrap">
              <IonIcon
                icon={isLocationLocked ? lockOpenOutline : lockClosedOutline}
              />
              <IonLabel>Location</IonLabel>
            </div>
          </IonItemOption>
        )}

        {canLockName && (
          <IonItemOption
            className={clsx('lock', isLocationNameLocked && 'locked')}
            color="secondary"
            onClick={toggleNameLockWrap}
          >
            <div className="label-wrap">
              <IonIcon
                icon={
                  isLocationNameLocked ? lockOpenOutline : lockClosedOutline
                }
              />
              <IonLabel>Name</IonLabel>
            </div>
          </IonItemOption>
        )}
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(Lock);
