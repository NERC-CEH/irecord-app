import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import AppMain from 'Components/Main';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import PastLocationsList from 'Components/PastLocationsList';

const Container = observer(({ appModel }) => {
  return (
    <IonPage>
      <AppHeader title={t('Past Locations')} />
      <AppMain>
        <PastLocationsList appModel={appModel} />
      </AppMain>
    </IonPage>
  );
});

Container.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Container;
