/** ****************************************************************************
 * Surveys List controller.
 *****************************************************************************/
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import Sample from 'sample';
import savedSamples from 'saved_samples';
import CONFIG from 'config';
import MainView from './main_view';
import HeaderView from './header_view';

const API = {
  show() {
    Log('Surveys:List:Controller: showing.');

    // MAIN
    const mainView = new MainView();
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Surveys',
      }),
    });
    headerView.on('surveys', () => {
      radio.trigger('samples:list', { replace: true });
    });
    headerView.on('surveys:add', API.addSurvey);

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  addSurvey() {
    API.addSurveySample(CONFIG.indicia.surveys.plant)
      .then((sample) => {
        radio.trigger('surveys:edit', sample.cid);
      })
      .catch((err) => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  /**
   * Creates a new survey.
   */
  addSurveySample(survey) {
    if (!survey) {
      return Promise.reject(new Error('Survey options are missing.'));
    }

    const sample = new Sample(null, {
      survey_id: survey.survey_id,
      input_form: survey.input_form,
      metadata: {
        survey: true,
      },
    });

    // append locked attributes
    // appModel.appendAttrLocks(sample);

    return sample.save().then(() => {
      savedSamples.add(sample);
      return sample;
    });
  },
};

export { API as default };
