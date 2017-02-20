/** ****************************************************************************
 * Record Show controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import savedRecords from '../../common/saved_records';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show(recordID) {
    Log('Records:Show:Controller: showing');
    const recordModel = savedRecords.get(recordID);

    // Not found
    if (!recordModel) {
      Log('No record model found', 'e');
      radio.trigger('app:404:show', { replace: true });
      return;
    }

    // MAIN
    const mainView = new MainView({
      model: new Backbone.Model({ recordModel, appModel }),
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

  syncRecord(recordModel) {
    if (Device.isOnline()) {
      if (!userModel.hasLogIn()) {
        App.trigger('user:login');
        return;
      }

      recordModel.save(null, { remote: true })
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
