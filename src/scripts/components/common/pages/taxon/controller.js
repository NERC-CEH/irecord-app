/** ****************************************************************************
 * Taxon controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Morel from 'morel';
import App from '../../../../app';
import Log from '../../../../helpers/log';
import appModel from '../../models/app_model';
import userModel from '../../models/user_model';
import recordManager from '../../record_manager';
import Sample from '../../models/sample';
import Occurrence from '../../models/occurrence';
import MainView from './main_view';
import HeaderView from '../../views/header_view';
import SpeciesSearchEngine from './search/taxon_search_engine';

const API = {
  show(recordID) {
    SpeciesSearchEngine.init();

    const that = this;
    this.id = recordID;

    if (recordID) {
      // check if the record has taxon specified
      recordManager.get(recordID, (getError, recordModel) => {
        if (getError) {
          App.regions.dialog.error(getError);
          return;
        }

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
      const mainView = new MainView({ model: userModel});
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
    const sampleID = that.id;
    mainView.on('taxon:selected', (taxon, edit) => {
      API.updateTaxon(sampleID, taxon, (err, sample) => {
        if (err) {
          Log(err, 'e');
          App.regions.dialog.error(err);
          return;
        }

        if (edit) {
          const updatedSampleID = sample.id || sample.cid;
          App.trigger('records:edit', updatedSampleID, { replace: true });
        } else {
          // return to previous page
          window.history.back();
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

  updateTaxon(sampleID, taxon, callback) {
    if (!sampleID) {
      // create new sighting
      const occurrence = new Occurrence({
        taxon,
      });

      const sample = new Sample();
      sample.addOccurrence(occurrence);

      // add locked attributes
      appModel.appendAttrLocks(sample);

      recordManager.set(sample, (saveError) => {
        if (saveError) {
          callback(saveError);
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

        callback(null, sample);
      });
    } else {
      // edit existing one
      recordManager.get(sampleID, (getError, recordModel) => {
        if (getError) {
          callback(getError);
          return;
        }

        recordModel.occurrences.at(0).set('taxon', taxon);
        recordModel.save(null, {
          success: (sample) => {
            callback(null, sample);
          },
          error: (saveError) => {
            callback(saveError);
          },
        });
      });
    }
  },
};

export { API as default };
