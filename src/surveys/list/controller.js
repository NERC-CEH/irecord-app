/** ****************************************************************************
 * Surveys List controller.
 *****************************************************************************/
import Indicia from 'indicia';
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import Sample from 'sample';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import CONFIG from 'config';
import MainView from './main_view';
import HeaderView from './header_view';

const API = {
  show() {
    Log('Surveys:List:Controller: showing.');

    // MAIN
    const mainView = new MainView({
      collection: savedSamples.subcollection({
        filter: model => model.metadata.complex_survey,
      }),
      appModel,
    });
    mainView.on('childview:create', API.addSurvey);
    mainView.on('childview:sample:delete', (childView) => {
      API.sampleDelete(childView.model);
    });
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
    headerView.on('create', API.addSurvey);

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  sampleDelete(sample) {
    Log('Samples:List:Controller: deleting sample.');

    const syncStatus = sample.getSyncStatus();
    let body = 'This record hasn\'t been saved to iRecord yet, ' +
      'are you sure you want to remove it from your device?';

    if (syncStatus === Indicia.SYNCED) {
      body = 'Are you sure you want to remove this record from your device?';
      body += '</br><i><b>Note:</b> it will remain on the server.</i>';
    }
    radio.trigger('app:dialog', {
      title: 'Delete',
      body,
      buttons: [
        {
          title: 'Cancel',
          onClick() {
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Delete',
          class: 'btn-negative',
          onClick() {
            sample.destroy();
            radio.trigger('app:dialog:hide');
            Analytics.trackEvent('List', 'sample remove');
          },
        },
      ],
    });
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
      metadata: {
        survey: 'plant',
        complex_survey: true,
      },
    });

    // append locked attributes
    // appModel.appendAttrLocks(sample);

    return sample.save().then(() => {
      savedSamples.add(sample);
      sample.startGPS();
      return sample;
    });
  },
};

export { API as default };
