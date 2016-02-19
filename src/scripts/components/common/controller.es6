define([
  'marionette',
  'log',
  'app',
  'JST',
  'common/header_view'
], function (Marionette, Log, App, JST, HeaderView) {
  let API = {
    show: function (options) {
      App = options.App || App; //passed when showing 404

      let MainView = options.mainView || Marionette.ItemView.extend({
        template: JST[options.route]
      });
      App.regions.main.show(new MainView({
        model: new Backbone.Model(options.model || {})
      }));

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: options.title || ''
        })
      });
      App.regions.header.show(headerView);
    }
  };

  return API;
});