import clsx from 'clsx';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { Badge, limit } from 'common/flumens';
import Sample from 'models/sample';
import GridRefValue from './GridRefValue';
import Lock from './Lock';

type Props = {
  sample: Sample;
  detailIcon?: any;
  className?: any;
  skipName?: boolean;
  isRequired?: boolean;
  label?: string;
};

const MenuLocation = ({
  sample,
  className,
  skipName,
  label = 'Location',
  isRequired = true,
  ...otherProps
}: Props) => {
  const { url } = useRouteMatch();

  const { location, locationName } = sample.data;

  const hasLocation = location?.latitude;

  const locationItem = hasLocation ? (
    <div className="location-value">
      <GridRefValue sample={sample} />
    </div>
  ) : (
    isRequired && <Badge color="warning">No location</Badge>
  );

  const { isDisabled } = sample;

  const noLocationNameBadge = !isDisabled ? (
    <Badge color="warning">No site name</Badge>
  ) : undefined;

  const locationNameItem = locationName ? (
    <div className="location-name-value">{limit(locationName, 25)}</div>
  ) : (
    noLocationNameBadge
  );

  return (
    <IonItem
      detail={!isDisabled}
      routerLink={!isDisabled ? `${url}/location` : undefined}
      className={clsx('menu-attr-item required', className)}
      {...otherProps}
    >
      <IonIcon icon={locationOutline} slot="start" />

      <IonLabel>
        <T>{label}</T>
      </IonLabel>

      <div className="flex flex-col items-end gap-1 py-2 text-nowrap text-(--form-value-color)">
        {locationItem}
        {!skipName && locationNameItem}
      </div>
    </IonItem>
  );
};

MenuLocation.WithLock = Lock;

export default MenuLocation;
