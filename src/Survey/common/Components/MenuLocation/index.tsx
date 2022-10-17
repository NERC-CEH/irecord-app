import { FC } from 'react';
import Sample from 'models/sample';
import clsx from 'clsx';
import { IonItem, IonLabel, IonIcon, IonBadge } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import StringHelp from 'helpers/string';
import GridRefValue from './GridRefValue';
import Lock, { Props as MenuLocationWithLockProps } from './Lock';
import './styles.scss';

interface Props {
  sample: Sample;
  detailIcon?: any;
  className?: any;
  skipName?: boolean;
  label?: string;
}

const MenuLocation: FC<Props> & { WithLock: FC<MenuLocationWithLockProps> } = ({
  sample,
  className,
  skipName,
  label = 'Location',

  ...otherProps
}) => {
  const { url } = useRouteMatch();

  const { location } = sample.attrs;

  const hasLocation = location?.latitude;
  const locationName = location.name;

  const locationItem = hasLocation ? (
    <IonLabel className="location-value">
      <GridRefValue sample={sample} />
    </IonLabel>
  ) : (
    <IonBadge color="warning">
      <T>No location</T>
    </IonBadge>
  );

  const locationNameItem = locationName ? (
    <IonLabel className="location-name-value">
      {StringHelp.limit(locationName, 30)}
    </IonLabel>
  ) : (
    <IonBadge color="warning">
      <T>No site name</T>
    </IonBadge>
  );

  const isDisabled = sample.isDisabled();

  return (
    <IonItem
      detail={!isDisabled}
      routerLink={!isDisabled ? `${url}/location` : undefined}
      className={clsx(
        'menu-attr-item menu-attr-item-location required',
        className
      )}
      {...otherProps}
    >
      <IonIcon icon={locationOutline} slot="start" />

      <IonLabel className="location-label">
        <T>{label}</T>
      </IonLabel>

      <IonLabel slot="end">
        {locationItem}
        {!skipName && locationNameItem}
      </IonLabel>
    </IonItem>
  );
};

MenuLocation.WithLock = Lock;

export default MenuLocation;
