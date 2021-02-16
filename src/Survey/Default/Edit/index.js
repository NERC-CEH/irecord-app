import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage, IonButton } from '@ionic/react';
import Log from 'helpers/log';
import Device from 'helpers/device';
import Footer from 'Components/PhotoPickerFooter';
import AppHeader, { AppHeaderBand } from 'Components/Header';
import { error, warn } from 'helpers/toast';
import showInvalidsMessage from 'helpers/invalidsMessage';
import Main from './Main';

@observer
class Controller extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.array.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
    userModel: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  state = {
    sample: this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    ),
  };

  onUpload = async () => {
    const { sample } = this.state;
    const { userModel, history } = this.props;
    try {
      const invalids = await sample.setToSend();
      if (invalids) {
        showInvalidsMessage(invalids);
        return;
      }
    } catch (e) {
      Log(e, 'e');
      return;
    }

    // should we sync?
    if (!Device.isOnline()) {
      warn(t('Looks like you are offline!'));
      return;
    }

    if (!userModel.hasLogIn()) {
      warn(t('Please log in first to upload the records.'));
      return;
    }
    const saved = await sample.saveRemote();

    // If no ID, then we assume the sample has not been saved to the backend
    if (!saved.id) {
      error(
        t(
          'Any issue occurred uploading, please try again. If the problem persists please contact ORKS.'
        )
      );
    } else {
      history.replace('/'); // go back doesn't work, not sure why?
    }
  };

  onAttrToggle = (attr, checked) => {
    const { sample } = this.state;

    const [occ] = sample.occurrences;

    const attrParts = attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];

    const model = attrType === 'smp' ? sample : occ;

    model.attrs[attrName] = checked;

    return sample.save();
  };

  render() {
    const { appModel, match } = this.props;
    const { sample } = this.state;
    const uploadButton = (
      <IonButton onClick={this.onUpload}>{t('Upload')}</IonButton>
    );
    const { activity } = sample.attrs;

    const activitySubheader = activity && (
      <AppHeaderBand title={`${t(activity.title)} Activity`} activity />
    );

    return (
      <IonPage id="survey-default-edit">
        <AppHeader
          title={t('Edit')}
          rightSlot={uploadButton}
          defaultHref="/home/surveys"
          subheader={activitySubheader}
        />
        <Main
          sample={sample}
          appModel={appModel}
          url={match.url}
          onAttrToggle={this.onAttrToggle}
        />
        <Footer model={sample.occurrences[0]} />
      </IonPage>
    );
  }
}

export default Controller;
