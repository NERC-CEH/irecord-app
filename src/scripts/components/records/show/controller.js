import Backbone from 'backbone';
import App from '../../../app';
import appModel from '../../common/app_model';
import userModel from '../../common/user_model';
import recordManager from '../../common/record_manager';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

const API = {
  show(id) {
    recordManager.get(id, (err, recordModel) => {
      // Not found
      if (!recordModel) {
        App.trigger('404:show', { replace: true });
        return;
      }

      // MAIN
      const mainView = new MainView({
        model: new Backbone.Model({ recordModel, appModel }),
      });

      mainView.on('sync:init', () => {
        API.syncRecord(recordModel);
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
    if (window.navigator.onLine) {
      if (!userModel.hasLogIn()) {
        App.trigger('user:login');
        return;
      }

      recordManager.sync(recordModel, (err) => {
        if (err) {
          App.regions.dialog.error(err);
          return;
        }
      });
    } else {
      App.regions.dialog.error({
        message: 'Looks like you are offline!',
      });
    }
  },
};

export { API as default };
