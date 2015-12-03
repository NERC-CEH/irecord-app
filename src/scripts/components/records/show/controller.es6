define([
  'app',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let API = {
    show: function (id){
      recordManager.get(id, function (err, record) {
        if (!record) {
          app.trigger('404:show');
          return;
        }
        let occ = record.occurrences.getFirst();
        let templateData = {
          date: record.get('date').print(),
          taxon: occ.get('taxon'),
          number: occ.get('number'),
          stage: occ.get('stage'),
          comment: occ.get('comment').limit(20)
        }
        let mainView = new MainView({
          model: templateData
        });
        app.regions.main.show(mainView);
      });

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Record'
        })
      });
      app.regions.header.show(headerView);
    }
  };

  return API;
});