import { createRef, FC } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  IonToggle,
  IonInput,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Main } from '@flumens';

type Location = any;

type Props = {
  location?: Location;
  onLocationSave: any;
};

const EditModal: FC<Props> = ({ location, onLocationSave }) => {
  const { t } = useTranslation();
  const inputRef = createRef<any>();

  const toggleRef = createRef<any>();

  const closeModal = () => onLocationSave();

  const save = () =>
    onLocationSave(inputRef.current.value, toggleRef.current.checked);

  const { name, favourite } = location || {};

  const form = (
    <IonList className="location-edit-form">
      <div className="rounded">
        <IonItem>
          <IonLabel>{t('Name')}</IonLabel>
          <IonInput
            id="location-name"
            type="text"
            placeholder={t('Your location name')}
            value={name}
            ref={inputRef}
          />
        </IonItem>
        <IonItem>
          <IonLabel>{t('Favourite')}</IonLabel>
          <IonToggle
            slot="end"
            id="favourite-btn"
            checked={favourite}
            ref={toggleRef}
          />
        </IonItem>
      </div>
    </IonList>
  );

  return (
    <IonModal isOpen={!!location}>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={closeModal}>Close</IonButton>
          </IonButtons>
          <IonTitle>{t('Edit Location')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Main fullscreen>{form}</Main>
    </IonModal>
  );
};

export default EditModal;
