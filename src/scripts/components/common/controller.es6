define([
  'marionette',
  'app',
  'JST',
  'log',
  'common/header_view'
], function (Marionette, app, JST, log, HeaderView) {
  let API = {
    show: function (options) {
      app = options.app || app; //passed when showing 404

      let MainView = Marionette.ItemView.extend({
        template: JST[options.route]
      });
      app.regions.main.show(new MainView({
        model: new Backbone.Model(options.model || {})
      }));

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: options.title || ''
        })
      });
      app.regions.header.show(headerView);
    }
  };

  return API;
});