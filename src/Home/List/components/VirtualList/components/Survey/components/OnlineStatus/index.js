import React from 'react';
import PropTypes from 'prop-types';
import { IonSpinner, IonLabel, IonChip } from '@ionic/react';

import { observer } from 'mobx-react';
import './styles.scss';

const Component = observer(props => {
  const { sample } = props;
  const { saved } = sample.metadata;

  if (!saved) {
    return (
      <IonLabel slot="end" class="survey-status">
        <IonChip color="dark" class="ion-text-wrap">
          {t('Draft')}
        </IonChip>
      </IonLabel>
    );
  }

  if (!sample.remote.synchronising) {
    return null;
  }

  return <IonSpinner class="survey-status" slot="end" />;
});

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
