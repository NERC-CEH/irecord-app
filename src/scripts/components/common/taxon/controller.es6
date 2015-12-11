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
      this.id = recordID;

      if (recordID) {
        //check if the record has taxon specified
        recordManager.get(recordID, function (err, record) {
          let mainView

          if (!record.occurrences.at(0).get('taxon')) {
            mainView = new MainView();
          } else {
            mainView = new MainView({removeEditBtn: true});
          }
          mainView.on('taxon:selected', API._onSelected);
          app.regions.main.show(mainView);
        });
      } else {
        let mainView = new MainView();
        mainView.on('taxon:selected', API._onSelected, this);
        app.regions.main.show(mainView);

          //should be done in the view
        app.regions.main.$el.find('#taxon').select();
      }

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Species'
        })
      });
      app.regions.header.show(headerView);
    },

    _onSelected: function (taxon, edit) {
        var that = this;
        if (!this.id) {
          //create new sighting
          let occurrence = new morel.Occurrence({
            'taxon': taxon
          });

          let sample = new morel.Sample(null, {
            occurrences: [occurrence]
          });

          recordManager.set(sample, function () {
            if (edit) {
              app.trigger('records:edit', sample.cid, {replace: true});
            } else {
              //return to previous page
              window.history.back();
            }
          });
        } else {
          //edit existing one
          recordManager.get(this.id, function (err, record) {
            record.occurrences.at(0).set('taxon', taxon);
            recordManager.set(record, function (err) {
              if (edit) {
                app.trigger('records:edit', that.id, {replace: true});
              } else {
                //return to previous page
                window.history.back();
              }
            });
          });
        }

    }
  };

  return API;
});