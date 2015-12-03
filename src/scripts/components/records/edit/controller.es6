define([
  'app',
  './main_view',
  './header_view',
  'common/record_manager',
  'helpers/date_extension',
  'helpers/string_extension'
], function (app, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;

      recordManager.get(recordID, function (err, record) {
        if (!record) {
          app.trigger('404:show');
          return;
        }
        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (record.metadata.saved) {
          app.trigger('records:show', recordID);
          return;
        }

        let occ = record.occurrences.getFirst();
        let templateData = new Backbone.Model({
          id: record.id,
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

        let headerView = new HeaderView({
          model: new Backbone.Model({
            title: 'Edit'
          })
        });
        app.regions.header.show(headerView);

        headerView.on('save', function (e) {
          record.metadata.saved = true;
          recordManager.set(record, function (err) {
            window.history.back();
          })
        });
      });
    }
  };

  return API;
});