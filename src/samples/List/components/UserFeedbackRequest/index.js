import React from 'react';
import PropTypes from 'prop-types';
import userModel from 'user_model';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
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
        question: 'Enjoying iRecord App?',
        negativeOption: 'Not really',
        positiveOption: 'Yes!',
      },
      negativeFeedback: {
        question: 'Would you mind giving us some feedback?',
        negativeOption: 'No, thanks',
        positiveOption: 'OK, sure',
        link: `mailto:apps%40ceh.ac.uk?subject=iRecord%20App%20Support%20%26%20Feedback&body=%0A%0A%0AVersion%3A%20${
          CONFIG.version
        }%0ABrowser%3A ${window.navigator.appVersion}%0A`,
      },
      positiveFeedback: {
        question: `How about a rating on the ${storeName} then?`,
        negativeOption: 'No, thanks',
        positiveOption: 'OK, sure',
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
      Log('Recommendations: exiting review');
      return;
    }

    if (this.state.step === 'negativeFeedback') {
      Log('Recommendations: asking for feedback');
      return;
    }

    Log('Recommendations: asking for app review');

    window.LaunchReview.launch();
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

    return this.props.samplesLength > 10;
  }

  render() {
    if (!this.shouldAskForFeedback()) {
      return null;
    }

    const { positiveOption, negativeOption, question, link } = this.steps[
      this.state.step
    ];

    return (
      <div id="feedback-request">
        <h5>{question}</h5>
        <div className="buttons">
          <ion-button
            id="btn-negative"
            fill="clear"
            onClick={() => this.nextStep(false)}>
            {negativeOption}
          </ion-button>

          <ion-button
            id="btn-positive"
            href={link}
            onClick={() => this.nextStep(true)}>
            {positiveOption}
          </ion-button>
        </div>
      </div>
    );
  }
}

Component.propTypes = {
  samplesLength: PropTypes.number.isRequired,
  appModel: PropTypes.object.isRequired,
};

export default Component;
