import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import Device from 'helpers/device';
import JST from 'JST';
import './styles.scss';

const MainView = Marionette.View.extend({
  template: JST['samples/list/recommendation'],

  events: {
    // eslint-disable-next-line
    'click #btn-negative': function() {
      this.nextStep(false);
    },
    // eslint-disable-next-line
    'click #btn-positive': function() {
      this.nextStep(true);
    },
  },

  nextStep(userActionIsPositive) {
    const appModel = this.options.appModel;

    if (!this.step) {
      if (!userActionIsPositive) {
        this.step = 'negativeFeedback';
        this.render();
        return;
      }

      this.step = 'positiveFeedback';
      this.render();
      return;
    }

    appModel.set('feedbackGiven', true).save();
    this.triggerMethod('recommendation:done');

    if (!userActionIsPositive) {
      Log('Recommendations: exiting review');
      return;
    }

    if (this.step === 'negativeFeedback') {
      Log('Recommendations: asking for feedback');
      return;
    }

    Log('Recommendations: asking for app review');

    window.LaunchReview.launch();
  },

  serializeData() {
    const storeName = Device.isIOS() ? 'App Store' : 'Play Store';
    const steps = {
      initial: {
        question: 'Enjoying iRecord App?',
        negativeOption: 'Not really',
        positiveOption: 'Yes!',
      },
      negativeFeedback: {
        question: 'Would you mind giving us some feedback?',
        negativeOption: 'No, thanks',
        positiveOption: 'OK, sure',
        link: true,
      },
      positiveFeedback: {
        question: `How about a rating on the ${storeName} then?`,
        negativeOption: 'No, thanks',
        positiveOption: 'OK, sure',
      },
    };
    return steps[this.step || 'initial'];
  },
});

export { MainView as default };
