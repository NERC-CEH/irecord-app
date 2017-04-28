/** ****************************************************************************
 * Surveys Edit controller.
 *****************************************************************************/
import Indicia from 'indicia';
import Backbone from 'backbone';
import radio from 'radio';
import Log from 'helpers/log';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show(sampleID) {
    // wait till savedSamples is fully initialized
    if (savedSamples.fetching) {
      const that = this;
      savedSamples.once('fetching:done', () => {
        API.show.apply(that, [sampleID]);
      });
      return;
    }

    Log('Surveys:Edit:Controller: showing.');

    const sample = savedSamples.get(sampleID);
    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // can't edit a saved one - to be removed when sample update
    // is possible on the server
    if (sample.getSyncStatus() === Indicia.SYNCED) {
      radio.trigger('samples:show', sampleID, { replace: true });
      return;
    }


    // MAIN
    const mainView = new MainView({
      model: new Backbone.Model({ sample, appModel }),
    });
    radio.trigger('app:main', mainView);

    // on finish sync move to show
    function checkIfSynced() {
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        radio.trigger('samples:show', sampleID, { replace: true });
      }
    }
    sample.on('request sync error', checkIfSynced);
    mainView.on('destroy', () => {
      // unbind when page destroyed
      sample.off('request sync error', checkIfSynced);
    });

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Survey',
      }),
    });
    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },
};

export { API as default };
