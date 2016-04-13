/** ****************************************************************************
 * Record Show controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from '../../../app';
import Device from '../../../helpers/device';
import Log from '../../../helpers/log';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

const API = {
  show(id) {
    Log('Records:Show:Controller: showing');
    recordManager.get(id, (err, recordModel) => {
      if (err) {
        Log(err, 'e');
      }

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

      App.regions.main.show(mainView);
    });

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Record',
      }),
    });
    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();
  },

  syncRecord(recordModel) {
    if (Device.isOnline()) {
      if (!userModel.hasLogIn()) {
        App.trigger('user:login');
        return;
      }

      recordModel.save(null, {
        remote: true,
        success: () => {},
        error: (err) => {
          Log(err, 'e');
          App.regions.dialog.error(err);
        },
      });
    } else {
      App.regions.dialog.error({
        message: 'Looks like you are offline!',
      });
    }
  },
};

export { API as default };
