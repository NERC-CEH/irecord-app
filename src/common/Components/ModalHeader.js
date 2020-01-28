import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import PropTypes from 'prop-types';

const ModalHeader = ({ title, onClose }) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onClose}>
            <IonIcon slot="icon-only" name="close" />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

ModalHeader.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ModalHeader;
