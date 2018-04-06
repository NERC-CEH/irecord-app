import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import JST from 'JST';
import radio from 'radio';
import HeaderView from './views/header_view';

const API = {
  show(options) {
    Log(`Common:Controller:${options.route}: showing.`);
    const MainView =
      options.mainView ||
      Marionette.View.extend({
        template: JST[options.route],
      });
    radio.trigger(
      'app:main',
      new MainView({
        model: options.model || new Backbone.Model(),
      })
    );

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: options.title || '',
      }),
    });
    radio.trigger('app:header', headerView);
  },
};

export { API as default };
