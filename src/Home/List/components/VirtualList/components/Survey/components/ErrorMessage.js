import React from 'react';
import { IonItemDivider, IonLabel } from '@ionic/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

function ErrorMessage({ sample }) {
  if (!sample.error.message) {
    return null;
  }

  return (
    <IonItemDivider color="danger">
      <IonLabel class="ion-text-wrap">
        <b>{`${t('Upload')}: `}</b> {t(sample.error.message)}
      </IonLabel>
    </IonItemDivider>
  );
}

ErrorMessage.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default observer(ErrorMessage);
