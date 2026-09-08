import { createRef, useEffect } from 'react';
import { Trans as T, useTranslation } from 'react-i18next';
import { Main, useOnHideModal } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonToggle,
  IonInput,
  useIonModal,
} from '@ionic/react';
import type { FullLocation } from 'models/app/pastLocExt';

type Props = {
  location: FullLocation | null;
  onLocationSave: (name?: string, favourite?: boolean) => void;
};

const EditModal = ({ location, onLocationSave }: Props) => {
  const { t } = useTranslation();
  const inputRef = createRef<HTMLIonInputElement>();

  const toggleRef = createRef<HTMLIonToggleElement>();

  const closeModal = () => {
    onLocationSave();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dismissModal();
  };

  useOnHideModal(closeModal);

  const save = () => {
    onLocationSave(
      String(inputRef.current?.value || ''),
      toggleRef.current?.checked
    );
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dismissModal();
  };

  const { name, favourite } = location || {};

  const form = (
    <IonList className="location-edit-form">
      <div className="rounded-list">
        <IonItem>
          <IonLabel className="mr-2">{t('Name')}</IonLabel>
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

  const [presentModal, dismissModal] = useIonModal(
    <>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={closeModal}>
              <T>Close</T>
            </IonButton>
          </IonButtons>
          <IonTitle>{t('Edit Location')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={save}>
              <T>Save</T>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Main fullscreen>{form}</Main>
    </>
  );

  useEffect(() => {
    if (location) presentModal();
  }, [location]);

  return null;
};

export default EditModal;
