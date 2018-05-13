/** ****************************************************************************
 * Surveys List controller.
 **************************************************************************** */
import Indicia from 'indicia';
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import Factory from 'model_factory';
import appModel from 'app_model';
import savedSamples from 'saved_samples';
import MainView from './main_view';
import LoaderView from '../../common/views/loader_view';
import HeaderView from './header_view';
import gridAlertService from './gridAlertService';

const API = {
  show(options = {}) {
    Log('Surveys:List:Controller: showing.');
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      savedSamples.once('fetching:done', () => {
        API.show.apply(this);
      });
      radio.trigger('app:main', new LoaderView());
    } else {
      API.showMainView(options);
    }

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Surveys',
      }),
      appModel,
    });
    headerView.on('surveys', () => {
      radio.trigger('samples:list', { replace: true });
    });
    headerView.on('create', API.addSurvey);
    headerView.on('atlas:toggled', API.toggleGridAlertService);

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  showMainView(options) {
    const training = appModel.get('useTraining');

    // get subcollection
    const collection = savedSamples.subcollection({
      filter: model =>
        !model.metadata.complex_survey && model.metadata.training === training,
    });
    collection.comparator = savedSamples.comparator;
    collection.sort();

    const mainView = new MainView({
      collection,
      scroll: options.scroll,
      appModel,
    });

    mainView.on('childview:create', API.addSurvey);
    mainView.on('childview:sample:delete', childView => {
      API.sampleDelete(childView.model);
    });

    radio.trigger('app:main', mainView);
  },

  toggleGridAlertService(on) {
    if (!on) {
      gridAlertService.stop();
      return;
    }

    gridAlertService.start(location => {
      console.log(location.gridref);
      API.showGridNotification(location);
    });
  },

  showGridNotification(location) {
    const body = `<h1 style="text-align: center;">${location.gridref}</h1>`;

    radio.trigger('app:dialog', {
      title: 'Grid Square',
      body,
    });
  },

  sampleDelete(sample) {
    Log('Samples:List:Controller: deleting sample.');

    const syncStatus = sample.getSyncStatus();
    let body =
      "This record hasn't been saved to iRecord yet, " +
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
          class: 'btn-clear',
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
    API.addSurveySample()
      .then(sample => {
        radio.trigger('surveys:edit', sample.cid);
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  },

  /**
   * Creates a new survey.
   */
  addSurveySample() {
    return Factory.createSample('plant', null, null).then(sample =>
      sample.save().then(() => {
        savedSamples.add(sample);
        sample.startGPS();
        return sample;
      })
    );
  },
};

export { API as default };
