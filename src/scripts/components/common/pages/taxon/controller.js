import Backbone from 'backbone';
import Morel from 'morel';
import App from '../../../../app';
import appModel from '../../app_model';
import recordManager from '../../record_manager';
import Sample from '../../sample';
import Occurrence from '../../occurrence';
import MainView from './main_view';
import HeaderView from '../../header_view';
import SpeciesSearchEngine from './taxon_search_engine';

const API = {
  show(recordID) {
    SpeciesSearchEngine.init();

    const that = this;
    this.id = recordID;

    if (recordID) {
      // check if the record has taxon specified
      recordManager.get(recordID, (err, recordModel) => {
        // Not found
        if (!recordModel) {
          App.trigger('404:show', { replace: true });
          return;
        }

        // can't edit a saved one - to be removed when record update
        // is possible on the server
        if (recordModel.getSyncStatus() === Morel.SYNCED) {
          App.trigger('records:show', recordID, { replace: true });
          return;
        }

        let mainView;

        if (!recordModel.occurrences.at(0).get('taxon')) {
          mainView = new MainView();
        } else {
          mainView = new MainView({ removeEditBtn: true });
        }
        API._showMainView(mainView, that);
      });
    } else {
      const mainView = new MainView();
      API._showMainView(mainView, this);

      // should be done in the view
      App.regions.main.$el.find('#taxon').select();
    }

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Species',
      }),
    });
    App.regions.header.show(headerView);

    // FOOTER
    App.regions.footer.hide().empty();
  },

  _showMainView(mainView, that) {
    mainView.on('taxon:selected', (species, edit) => {
      API._onSelected(species, edit, (err) => {
        if (err) {
          App.regions.dialog.error(err);
        }
    });
    }, that);
    mainView.on('taxon:searched', (searchPhrase) => {
      SpeciesSearchEngine.search(searchPhrase, (selection) => {
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      });
    });

    App.regions.main.show(mainView);
  },

  _onSelected(species, edit, callback) {
    const that = this;
    if (!this.id) {
      // create new sighting
      const occurrence = new Occurrence({
        taxon: species,
      });

      const sample = new Sample(null, {
        occurrences: [occurrence],
      });

      // add locked attributes
      appModel.appendAttrLocks(sample);

      recordManager.set(sample, (err) => {
        if (err) {
          callback && callback(err);
          return;
        }

        // check if location attr is not locked
        const locks = appModel.get('attrLocks');

        if (!locks.location) {
          // no previous location
          sample.startGPS();
        } else if (!locks.location.latitude || !locks.location.longitude) {
          // previously locked location was through GPS
          // so try again
          sample.startGPS();
        }

        if (edit) {
          App.trigger('records:edit', sample.cid, { replace: true });
        } else {
          // return to previous page
          window.history.back();
        }
      });
    } else {
      // edit existing one
      recordManager.get(this.id, (err, recordModel) => {
        if (err) {
          callback && callback(err);
          return;
        }
        recordModel.occurrences.at(0).set('taxon', species);
        recordModel.save((err) => {
          if (err) {
            callback && callback(err);
            return;
          }
          if (edit) {
            App.trigger('records:edit', that.id, { replace: true });
          } else {
            // return to previous page
            window.history.back();
          }
        });
      });
    }
  },
};

export { API as default };
