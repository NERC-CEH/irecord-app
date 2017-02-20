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
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show(recordID) {
    Log('Records:Show:Controller: showing');
    recordManager.get(recordID)
      .then((recordModel) => {
        // Not found
        if (!recordModel) {
          Log('No record model found', 'e');
          App.trigger('404:show', { replace: true });
          return;
        }

        // MAIN
        const mainView = new MainView({
          model: new Backbone.Model({ recordModel, appModel }),
        });

        radio.trigger('app:main', mainView);
      })
      .catch((err) => {
        Log(err, 'e');
      });

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

      recordModel.save({ remote: true })
        .catch((err) => {
          Log(err, 'e');
          radio.on('app:dialog:error', err);
        });
    } else {
      radio.on('app:dialog:error', {
        message: 'Looks like you are offline!',
      });
    }
  },
};

export { API as default };
