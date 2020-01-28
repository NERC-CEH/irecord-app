import React from 'react';
import PropTypes from 'prop-types';
import { IonLabel } from '@ionic/react';
import { observer } from 'mobx-react';

function getLocationName(sample) {
  const location = sample.attrs.location || {};
  const locationName = location.name;

  if (!locationName) {
    return (
      <IonLabel slot="end" className="descript long error">
        {t('Name missing')}
      </IonLabel>
    );
  }

  return (
    <IonLabel slot="end" className="location long">
      {locationName}
    </IonLabel>
  );
}

function getLocation(sample) {
  const locationPretty = sample.printLocation();
  const isLocating = sample.isGPSRunning();
  if (isLocating) {
    return (
      <IonLabel slot="end" className="long warn">
        {t('Locating')}
        ...
      </IonLabel>
    );
  }

  if (!locationPretty) {
    return (
      <IonLabel slot="end" className="long error">
        {t('Location missing')}
      </IonLabel>
    );
  }

  return (
    <IonLabel slot="end" className="location long ">
      {locationPretty}
    </IonLabel>
  );
}

function LocationLabel({ sample, hideName }) {
  return (
    <>
      {getLocation(sample)}
      {!hideName && getLocationName(sample)}
    </>
  );
}

LocationLabel.propTypes = {
  sample: PropTypes.object.isRequired,
  hideName: PropTypes.bool,
};
export default observer(LocationLabel);
