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
import PropTypes from 'prop-types';
import React from 'react';
import AppMain from 'Components/Main';

export default class EditModal extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    onLocationSave: PropTypes.func.isRequired,
  };

  inputRef = React.createRef();

  toggleRef = React.createRef();

  closeModal = () => {
    this.props.onLocationSave();
  };

  save = () => {
    const { onLocationSave } = this.props;
    onLocationSave(this.inputRef.current.value, this.toggleRef.current.checked);
  };

  render() {
    const { location } = this.props;
    const { name, favourite } = location;

    const form = (
      <IonList>
        <IonItem>
          <IonLabel>{t('Name')}</IonLabel>
          <IonInput
            id="location-name"
            type="text"
            placeholder={t('Your location name')}
            value={name}
            ref={this.inputRef}
          />
        </IonItem>
        <IonItem>
          <IonLabel>{t('Favourite')}</IonLabel>
          <IonToggle
            slot="end"
            id="favourite-btn"
            checked={favourite}
            ref={this.toggleRef}
          />
        </IonItem>
      </IonList>
    );

    return (
      <IonModal isOpen>
        <IonHeader translucent>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={this.closeModal}>Close</IonButton>
            </IonButtons>
            <IonTitle>{t('Edit Location')}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={this.save}>Save</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <AppMain fullscreen>{form}</AppMain>
      </IonModal>
    );
  }
}
