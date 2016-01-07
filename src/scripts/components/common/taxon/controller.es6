define([
  'morel',
  'app',
  'common/user_model',
  'log',
  'common/record_manager',
  './main_view',
  'common/header_view',
  './taxon_search_engine'
], function (morel, app, user, log, recordManager, MainView, HeaderView, SE) {
  let API = {
    show: function (recordID){
      let that = this;
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
          API._showMainView(mainView);
        });
      } else {
        let mainView = new MainView();
        API._showMainView(mainView);

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

    _showMainView: function (mainView) {
      mainView.on('taxon:selected', API._onSelected, this);
      mainView.on('taxon:searched', function (searchPhrase) {
        let selection = SE.search(searchPhrase);
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      });

      app.regions.main.show(mainView);
    },

    _onSelected: function (species, edit) {
        var that = this;
        if (!this.id) {
          //create new sighting
          let occurrence = new morel.Occurrence({
            'taxon': species
          });

          let sample = new morel.Sample(null, {
            occurrences: [occurrence]
          });

          //add locked attributes
          user.appendAttrLocks(sample);

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
            record.occurrences.at(0).set('taxon', species);
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