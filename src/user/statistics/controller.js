/** *****************************************************************************
 * Statistics List controller.
 ******************************************************************************/

import Backbone from 'backbone';
import Log from 'helpers/log';
import Analytics from 'helpers/analytics';
import radio from 'radio';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';
import RefreshView from './refresh_view';
import userModel from 'user_model';

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

    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');

    // MAIN
    const mainView = new MainView({
      model: userModel,
    });

    radio.trigger('app:main', mainView);

    refreshView.on('refreshClick', () => {
      Log('User:Statistics:Controller: refresh clicked');
      API.refresh();
    });
  },

  refresh() {
    userModel.syncStats(true);
    Analytics.trackEvent('Statistics', 'refresh');
  },
};

export { API as default };
