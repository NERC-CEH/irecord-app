import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage, IonButton } from '@ionic/react';
import Factory from 'model_factory';
import Log from 'helpers/log';
import Device from 'helpers/device';
import AppHeader, { AppHeaderBand } from 'Components/Header';
import { warn } from 'helpers/toast';
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
    surveySample: this.props.savedSamples.find(
      ({ cid }) => cid === this.props.match.params.id
    ),
  };

  onUpload = async () => {
    const { surveySample } = this.state;
    const { userModel, history } = this.props;
    try {
      const invalids = await surveySample.setToSend();
      if (invalids) {
        showInvalidsMessage(invalids);
        return;
      }
    } catch (e) {
      Log(e, 'e');
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

    surveySample.saveRemote();
    history.replace('/'); // go back doesn't work, not sure why?
  };

  async componentDidMount() {
    const { match, history } = this.props;
    const isNew = !match.params.id;
    if (!this.state.surveySample && isNew) {
      const newSurveySample = await this.getNewSample();
      const url = match.url.replace('/new', '');
      history.replace(`${url}/${newSurveySample.cid}/edit`);
    }
  }

  async getNewSample() {
    Log('Creating new survey');
    const { savedSamples } = this.props;
    const sample = await Factory.createSample({
      complex: true,
    });
    sample.save();
    savedSamples.push(sample);
    return sample;
  }

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const speciesListSortedByTime = appModel.get('speciesListSortedByTime');
    appModel.set('speciesListSortedByTime', !speciesListSortedByTime);
    appModel.save();
  };

  onSubSampleDelete = async subSample => {
    await subSample.destroy();
  };

  render() {
    const { appModel, history, match } = this.props;
    const { surveySample } = this.state;

    if (!surveySample) {
      return null;
    }

    const survey = surveySample.getSurvey();

    const speciesListSortedByTime = appModel.get('speciesListSortedByTime');
    const uploadButton = (
      <IonButton onClick={this.onUpload}>{t('Upload')}</IonButton>
    );

    return (
      <IonPage id="survey-complex-default-edit">
        <AppHeader
          title={survey.label}
          rightSlot={uploadButton}
          defaultHref="/home/surveys"
          subheader={<AppHeaderBand title={t('Survey')} />}
        />
        <Main
          surveySample={surveySample}
          appModel={appModel}
          speciesListSortedByTime={speciesListSortedByTime}
          onToggleSpeciesSort={this.toggleSpeciesSort}
          onDelete={this.onSubSampleDelete}
          history={history}
          url={match.url}
        />
      </IonPage>
    );
  }
}

export default Controller;
