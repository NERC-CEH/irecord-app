/** ****************************************************************************
 * Sample Show controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import savedSamples from '../../common/saved_samples';
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

    Log('Samples:Show:Controller: showing');
    const sample = savedSamples.get(sampleID);

    // Not found
    if (!sample) {
      Log('No sample model found', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      model: new Backbone.Model({ sample, appModel }),
    });

    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Record',
      }),
    });
    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  syncSample(sample) {
    if (Device.isOnline()) {
      if (!userModel.hasLogIn()) {
        radio.trigger('user:login');
        return;
      }

      sample.save(null, { remote: true })
        .catch((err) => {
          Log(err, 'e');
          radio.trigger('app:dialog:error', err);
        });
    } else {
      radio.trigger('app:dialog:error', {
        message: 'Looks like you are offline!',
      });
    }
  },
};

export { API as default };
