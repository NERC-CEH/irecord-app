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
        let templateData = new Backbone.Model({
          taxon: occ.get('taxon'),
          date: record.get('date').print(),
          number: occ.get('number') && occ.get('number').limit(20),
          stage: occ.get('stage') && occ.get('stage').limit(20),
          comment: occ.get('comment') && occ.get('comment').limit(20)
        });

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