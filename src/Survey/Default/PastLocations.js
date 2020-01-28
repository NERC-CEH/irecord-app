import React from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import AppMain from 'Components/Main';
import { observer } from 'mobx-react';
import AppHeader from 'Components/Header';
import PastLocationsList from 'Components/PastLocationsList';

@observer
class Container extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
  };

  state = {
    sample: this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    ),
  };

  render() {
    const { appModel } = this.props;
    const { sample } = this.state;

    const onSelect = location => {
      if (sample.isGPSRunning()) {
        sample.stopGPS();
      }
      sample.attrs.location = location;
      this.context.goBack();
    };

    return (
      <IonPage id="survey-default-edit-past-locations">
        <AppHeader title={t('Past Locations')} />
        <AppMain>
          <PastLocationsList appModel={appModel} onSelect={onSelect} />
        </AppMain>
      </IonPage>
    );
  }
}

export default Container;
