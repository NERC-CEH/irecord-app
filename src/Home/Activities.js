import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import { observer } from 'mobx-react';
import ActivitiesList from 'Components/ActivitiesList';
import AppMain from 'Components/Main';

@observer
class Container extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
  };

  render() {
    const { userModel, appModel } = this.props;

    const onSelect = activityID => {
      appModel.setAttrLock(
        'smp',
        'activity',
        userModel.getActivity(activityID)
      );
    };

    return (
      <IonPage>
        <AppMain>
          <ActivitiesList
            userModel={userModel}
            appModel={appModel}
            onSelect={onSelect}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Container;
