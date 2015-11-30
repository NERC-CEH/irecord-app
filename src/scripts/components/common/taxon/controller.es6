define([
  'morel',
  'app',
  'log',
  'common/record_manager',
  './main_view',
  'common/header_view'
], function (morel, app, log, recordManager, MainView, HeaderView) {
  let id = null;
  let API = {
    show: function (recordID){
      id = recordID;

      if (recordID) {
        //check if the record has taxon specified
        recordManager.get(recordID, function (err, record) {
          let mainView

          if (!record.occurrences.getFirst().get('taxon')) {
            mainView = new MainView();
          } else {
            mainView = new MainView({removeEditBtn: true});
          }

          app.regions.main.show(mainView);
        });
      } else {
        let mainView = new MainView();
        app.regions.main.show(mainView);
        app.regions.main.$el.find('#taxon').select();
      }

      let headerView = new HeaderView({
        model: new Backbone.Model({
          pageName: 'Species'
        })
      });
      app.regions.header.show(headerView);
    }
  };

  app.on('common:taxon:selected', function (taxon, edit) {
    if (!id) {
      //create new sighting
      let occurrence = new morel.Occurrence({
        attributes: {
          'taxon': taxon
        }
      });

      let sample = new morel.Sample({
        occurrences: [occurrence]
      });

      recordManager.set(sample, function () {
        if (edit) {
          app.trigger('records:edit', sample.id, {replace: true});
        } else {
          //return to previous page
          window.history.back();
        }
      });
    } else {
      //edit existing one
      recordManager.get(id, function (err, record) {
        record.occurrences.getFirst().set('taxon', taxon);
        recordManager.set(record, function (err) {
          if (edit) {
            app.trigger('records:edit', id, {replace: true});
          } else {
            //return to previous page
            window.history.back();
          }
        });
      });
    }
  });

  return API;
});