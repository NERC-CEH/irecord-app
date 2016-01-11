define([
  'app',
  'common/user_model',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, userModel, MainView, HeaderView, recordManager) {
  let API = {
    show: function (id){
      recordManager.get(id, function (err, record) {
        if (!record) {
          app.trigger('404:show');
          return;
        }
        let occ = record.occurrences.at(0);

        let specie = occ.get('taxon');
        let taxon = userModel.get('useScientificNames') ?
          specie.taxon : specie.common_name || specie.taxon;

        let templateData = new Backbone.Model({
          taxon: taxon,
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