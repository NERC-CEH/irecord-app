import React from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import AppMain from 'Components/Main';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import ActivitiesList from 'Components/ActivitiesList';

@observer
class Container extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
  };

  state = {
    sample: this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    ),
  };

  render() {
    const { appModel, userModel } = this.props;
    const { sample } = this.state;

    const onSelect = async activityID => {
      const activity = userModel.getActivity(activityID);
      sample.attrs.activity = activity;
      sample.samples.forEach(subSample => {
        subSample.attrs.activity = activity; // eslint-disable-line
      })
      await sample.save();
      this.context.goBack();
    };

    return (
      <IonPage id="survey-default-edit-activity">
        <AppHeader title={t('Activity')} />
        <AppMain>
          <ActivitiesList
            userModel={userModel}
            appModel={appModel}
            onSelect={onSelect}
            sample={sample}
          />
        </AppMain>
      </IonPage>
    );
  }
}

export default Container;
