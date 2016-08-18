/** *****************************************************************************
 * Statistics List controller.
 ******************************************************************************/

import Backbone from 'backbone';
import Log from '../../../helpers/log';
import Analytics from '../../../helpers/analytics';
import App from '../../../app';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
import RefreshView from './refresh_view';
import userModel from '../../common/models/user_model';

const API = {
  show() {
    Log('User:Statistics:Controller: showing');

    // HEADER
    const refreshView = new RefreshView();

    const headerView = new HeaderView({
      rightPanel: refreshView,
      model: new Backbone.Model({
        title: 'Statistics',
      }),
    });

    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();

    // MAIN
    const mainView = new MainView({
      model: userModel,
    });

    App.regions.main.show(mainView);

    refreshView.on('refreshClick', () => {
      Log('User:Statistics:Controller: refresh clicked');
      if (!userModel.hasLogIn()) {
        App.trigger('user:login');
        return;
      }
      API.refresh();
    });
  },

  refresh() {
    userModel.syncStats(true);
    Analytics.trackEvent('Statistics', 'refresh');
  },
};

export { API as default };
