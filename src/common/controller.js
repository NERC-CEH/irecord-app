import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import { Log } from 'helpers';
import JST from 'JST';
import App from 'app';
import HeaderView from './views/header_view';

const API = {
  show(options) {
    Log(`Common:Controller:${options.route}: showing`);
    const app = options.App || App; // passed when showing 404

    const MainView = options.mainView || Marionette.View.extend({
      template: JST[options.route],
    });
    app.regions.getRegion('main').show(new MainView({
      model: options.model || new Backbone.Model(),
    }));

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: options.title || '',
      }),
    });
    app.regions.getRegion('header').show(headerView);
  },
};

export { API as default };
