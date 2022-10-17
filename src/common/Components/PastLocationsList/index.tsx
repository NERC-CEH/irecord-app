import { FC, createRef, useState } from 'react';
import { observer } from 'mobx-react';
import {
  IonList,
  IonItemOption,
  IonItem,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from '@ionic/react';
import { star, starOutline, informationCircleOutline } from 'ionicons/icons';
import { useAlert, InfoMessage } from '@flumens';
import appModel from 'models/app';
import StringHelp from 'helpers/string';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import clsx from 'clsx';
import EditModal from './EditModal';
import './styles.scss';

/**
 * Sort the past locations placing favourites to the top.
 */
const sortFavLocationsToTop = (a: Location, b: Location) =>
  a.favourite === b.favourite ? 0 : a.favourite ? -1 : 1; // eslint-disable-line

function useShowDeletePopup() {
  const alert = useAlert();

  const showDeletePopup = (onDelete: any) =>
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete the saved location?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: onDelete,
        },
      ],
    });

  return showDeletePopup;
}

type Location = any;
type LocationID = any;

type Props = {
  onSelect?: any;
};

const PastLocations: FC<Props> = ({ onSelect }) => {
  const [editLocation, setEditLocation] = useState<Location>(null);

  const showDeletePopup = useShowDeletePopup();

  const deleteLocation = (locationId: LocationID) => {
    const onDelete = () => appModel.removeLocation(locationId);
    showDeletePopup(onDelete);
  };

  const locations = appModel.attrs.locations || [];

  const listRef = createRef<any>();

  const selectLocation = (locationId: LocationID) => {
    if (!onSelect) return;

    const location = locations.find(loc => loc.id === locationId);
    const locationCopy = { ...location };
    delete locationCopy.id;
    delete locationCopy.favourite;
    delete locationCopy.date;
    onSelect(locationCopy);
  };

  const onEdit = (locationId: LocationID) => {
    listRef.current.closeSlidingItems();

    const location = locations.find(({ id }) => id === locationId);
    setEditLocation({ ...location });
  };

  const onSave = (name: string, favourite: boolean) => {
    if (!name) {
      setEditLocation(null);
      return;
    }

    const updatedLocation = { ...editLocation };
    updatedLocation.name = StringHelp.escape(name);
    updatedLocation.favourite = favourite;

    appModel.setLocation(updatedLocation);

    setEditLocation(null);
    listRef.current && listRef.current.closeSlidingItems();
  };

  const getPastLocations = () => {
    if (!locations.length)
      return (
        <InfoBackgroundMessage>
          You have no previous locations.
        </InfoBackgroundMessage>
      );

    function getPastLocation(location: Location) {
      const locationStr = appModel.printLocation(location);
      const { id, name, favourite, source, latitude, longitude } = location;

      const lat = parseFloat(latitude).toFixed(3);
      const lon = parseFloat(longitude).toFixed(3);
      return (
        <IonItemSliding
          className={clsx('location', favourite && 'favourite')}
          key={id}
        >
          <IonItem
            detail
            detailIcon={favourite ? star : starOutline}
            onClick={() => selectLocation(id)}
          >
            <IonLabel className="details" position="stacked" mode="ios">
              <IonLabel slot="start">
                {name ? <strong>{name}</strong> : ''}
              </IonLabel>
              <IonLabel slot="start">{locationStr}</IonLabel>
              <IonLabel slot="start" className="location-raw">
                {`${lat}, ${lon}`}
              </IonLabel>
            </IonLabel>

            <IonLabel slot="end" position="stacked" mode="ios">
              <span className="location-source">
                <T>source</T>: <T>{source}</T>
              </span>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => deleteLocation(id)}>
              <T>Delete</T>
            </IonItemOption>
            <IonItemOption onClick={() => onEdit(id)}>
              <T>Edit</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    }

    const formattedLocations = [...locations]
      .sort(sortFavLocationsToTop)
      .map(getPastLocation.bind(this));

    return (
      <IonList id="user-locations" ref={listRef}>
        {formattedLocations}
      </IonList>
    );
  };

  return (
    <>
      <EditModal location={editLocation} onLocationSave={onSave} />

      <InfoMessage className="blue" icon={informationCircleOutline}>
        Here you can select or swipe to edit your previous locations
      </InfoMessage>

      {getPastLocations()}
    </>
  );
};

export default observer(PastLocations);
