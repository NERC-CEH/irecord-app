import React from 'react';
import PropTypes from 'prop-types';
import userModel from 'user_model';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
} from '@ionic/react';
import { observer } from 'mobx-react';
import './styles.scss';

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 'initial' };

    const storeName = Device.isIOS() ? 'App Store' : 'Play Store';
    this.steps = {
      initial: {
        question: t('Enjoying the app?'),
        negativeOption: t('Not really'),
        positiveOption: t('Yes!'),
      },
      negativeFeedback: {
        question: t('Would you mind giving us some feedback?'),
        negativeOption: t('No, thanks'),
        positiveOption: t('OK, sure'),
        link: `mailto:apps%40ceh.ac.uk?subject=iRecord%20App&body=%0A%0A%0AVersion%3A%20${CONFIG.version}%0ABrowser%3A ${window.navigator.appVersion}%0A`,
      },
      positiveFeedback: {
        question: t(`How about a rating on the ${storeName} then?`),
        negativeOption: t('No, thanks'),
        positiveOption: t('OK, sure'),
      },
    };
  }

  nextStep(userActionIsPositive) {
    if (this.state.step === 'initial') {
      if (!userActionIsPositive) {
        this.setState({ step: 'negativeFeedback' });
        return;
      }

      this.setState({ step: 'positiveFeedback' });
      return;
    }

    this.props.appModel.set('feedbackGiven', true);
    this.props.appModel.save();

    if (!userActionIsPositive) {
      return;
    }

    if (this.state.step === 'negativeFeedback') {
      return;
    }

    window.LaunchReview.isRatingSupported()
      ? window.LaunchReview.rating()
      : window.LaunchReview.launch();
  }

  shouldAskForFeedback() {
    if (this.props.appModel.get('feedbackGiven')) {
      return false;
    }

    if (this.props.appModel.get('useTraining')) {
      return false;
    }

    if (!userModel.hasLogIn()) {
      return false;
    }

    return this.props.samplesLength > 5;
  }

  render() {
    if (!this.shouldAskForFeedback()) {
      return null;
    }

    const { positiveOption, negativeOption, question, link } = this.steps[
      this.state.step
    ];

    return (
      <IonCard id="feedback-request">
        <IonCardHeader>
          <IonCardTitle>{question}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonButton
            id="btn-negative"
            fill="clear"
            onClick={() => this.nextStep(false)}
          >
            {negativeOption}
          </IonButton>

          <IonButton
            id="btn-positive"
            href={link}
            onClick={() => this.nextStep(true)}
          >
            {positiveOption}
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }
}

Component.propTypes = {
  samplesLength: PropTypes.number.isRequired,
  appModel: PropTypes.object.isRequired,
};

export default Component;
