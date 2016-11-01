/** ****************************************************************************
 * Record Show controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from 'app';
import { Log, Device } from 'helpers';
import appModel from '../../common/models/app_model';
import userModel from '../../common/models/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

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

      App.regions.getRegion('main').show(mainView);
    });

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Record',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
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
          App.regions.getRegion('dialog').error(err);
        },
      });
    } else {
      App.regions.getRegion('dialog').error({
        message: 'Looks like you are offline!',
      });
    }
  },
};

export { API as default };
