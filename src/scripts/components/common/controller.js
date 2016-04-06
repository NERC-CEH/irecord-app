import Backbone from 'backbone';
import Marionette from 'marionette';
import App from '../../app';
import log from '../../helpers/log';
import JST from '../../JST';
import HeaderView from './header_view';

const API = {
  show(options) {
    log(`Common:Controller:${options.route}: showing`);
    const app = options.App || App; // passed when showing 404

    const MainView = options.mainView || Marionette.ItemView.extend({
      template: JST[options.route],
    });
    app.regions.main.show(new MainView({
      model: options.model || new Backbone.Model(),
    }));

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: options.title || '',
      }),
    });
    app.regions.header.show(headerView);
  },
};

export { API as default };
