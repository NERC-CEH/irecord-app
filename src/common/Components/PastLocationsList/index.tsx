import { createRef, useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { star, starOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useAlert, escape } from '@flumens';
import {
  IonList,
  IonItemOption,
  IonItem,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/react';
import { printLocation } from 'common/helpers/location';
import appModel from 'models/app';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
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

const PastLocations = ({ onSelect }: Props) => {
  const [editLocation, setEditLocation] = useState<Location>(null);

  const showDeletePopup = useShowDeletePopup();

  const deleteLocation = (locationId: LocationID) => {
    const onDelete = () => appModel.removeLocation(locationId);
    showDeletePopup(onDelete);
  };

  const locations = appModel.data.locations || [];

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
    updatedLocation.name = escape(name);
    updatedLocation.favourite = favourite;

    appModel.setLocation(updatedLocation);

    setEditLocation(null);
    listRef.current?.closeSlidingItems();
  };

  const getPastLocations = () => {
    if (!locations.length)
      return (
        <InfoBackgroundMessage>
          You have no previous locations.
        </InfoBackgroundMessage>
      );

    function getPastLocation(location: Location) {
      const locationStr = printLocation(location);
      const { id, name, favourite, source } = location;

      return (
        <IonItemSliding
          className={clsx('location', favourite && 'favourite')}
          key={id}
        >
          <IonItem
            detail
            detailIcon={favourite ? star : starOutline}
            onClick={() => selectLocation(id)}
            className="[--padding-top:0]!"
          >
            <div className="flex flex-col gap-1  w-full py-2">
              <div className="font-semibold line-clamp-1">{name}</div>
              <div className="flex gap-2 opacity-70 text-xs justify-between items-center">
                <div>{locationStr}</div>
                <div>
                  <T>source</T>: <T>{source}</T>
                </div>
              </div>
            </div>
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
    <div className="past-locations">
      <EditModal location={editLocation} onLocationSave={onSave} />

      <InfoBackgroundMessage name="showPastLocationsTip">
        Here you can select or swipe to edit your previous locations
      </InfoBackgroundMessage>

      {getPastLocations()}
    </div>
  );
};

export default observer(PastLocations);
