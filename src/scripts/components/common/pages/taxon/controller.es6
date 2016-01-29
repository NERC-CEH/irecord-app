define([
  'morel',
  'log',
  'gps',
  'app',
  'common/app_model',
  'common/record_manager',
  'common/sample',
  'common/occurrence',
  './main_view',
  'common/header_view',
  './taxon_search_engine'
], function (Morel, Log, GPS, App, appModel, recordManager, Sample, Occurrence, MainView, HeaderView, SpeciesSearchEngine) {
  let API = {
    show: function (recordID){
      let that = this;
      this.id = recordID;

      if (recordID) {
        //check if the record has taxon specified
        recordManager.get(recordID, function (err, record) {
          let mainView;

          if (!record.occurrences.at(0).get('taxon')) {
            mainView = new MainView();
          } else {
            mainView = new MainView({removeEditBtn: true});
          }
          API._showMainView(mainView, that);
        });
      } else {
        let mainView = new MainView();
        API._showMainView(mainView, this);

          //should be done in the view
        App.regions.main.$el.find('#taxon').select();
      }

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Species'
        })
      });
      App.regions.header.show(headerView);
    },

    _showMainView: function (mainView, that) {
      mainView.on('taxon:selected', API._onSelected, that);
      mainView.on('taxon:searched', function (searchPhrase) {
        let selection = SpeciesSearchEngine.search(searchPhrase);
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      });

      App.regions.main.show(mainView);
    },

    _onSelected: function (species, edit) {
        var that = this;
        if (!this.id) {
          //create new sighting
          let occurrence = new Occurrence({
            'taxon': species
          });

          let sample = new Sample(null, {
            occurrences: [occurrence]
          });

          //add locked attributes
          appModel.appendAttrLocks(sample);

          recordManager.set(sample, function () {
            //check if location attr is not locked
            let locks = appModel.get('attrLocks');
            if (!locks.location) {
              sample.startGPS();
            }

            if (edit) {
              App.trigger('records:edit', sample.cid, {replace: true});
            } else {
              //return to previous page
              window.history.back();
            }
          });
        } else {
          //edit existing one
          recordManager.get(this.id, function (err, record) {
            record.occurrences.at(0).set('taxon', species);
            record.save(function (err) {
              if (edit) {
                App.trigger('records:edit', that.id, {replace: true});
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