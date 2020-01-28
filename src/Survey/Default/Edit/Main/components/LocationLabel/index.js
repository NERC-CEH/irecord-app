import React from 'react';
import PropTypes from 'prop-types';
import { IonLabel } from '@ionic/react';
import { observer } from 'mobx-react';
import './styles.scss';

function getLocationName(sample, locks) {
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
    <IonLabel
      slot="end"
      className={`location long ${locks['smp:locationName'] ? 'lock' : ''}`}
    >
      {locationName}
    </IonLabel>
  );
}

function getLocation(sample, locks) {
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
    <IonLabel
      slot="end"
      className={`location long ${locks['smp:location'] ? 'lock' : ''}`}
    >
      {locationPretty}
    </IonLabel>
  );
}

function LocationLabel({ sample, locks }) {
  return (
    <>
      {getLocation(sample, locks)}
      {getLocationName(sample, locks)}
    </>
  );
}

LocationLabel.propTypes = {
  sample: PropTypes.object.isRequired,
  locks: PropTypes.object.isRequired,
};
export default observer(LocationLabel);
