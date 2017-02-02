/** ****************************************************************************
 * Taxon controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Morel from 'morel';
import App from 'app';
import { Log } from 'helpers';
import recordManager from '../../record_manager';
import appModel from '../../models/app_model';
import userModel from '../../models/user_model';
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
        // Not found
        if (!recordModel) {
          Log('No record model found', 'e');
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

        if (!recordModel.getSubModel().get('taxon')) {
          mainView = new MainView({ model: userModel });
        } else {
          mainView = new MainView({ removeEditBtn: true, model: userModel });
        }
        API._showMainView(mainView, that);
      });
    } else {
      const mainView = new MainView({ model: userModel });
      API._showMainView(mainView, this);

      // should be done in the view
      App.regions.getRegion('main').$el.find('#taxon').select();
    }

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Species',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },

  _showMainView(mainView, that) {
    const sampleID = that.id;
    mainView.on('taxon:selected', (taxon, edit) => {
      API.updateTaxon(sampleID, taxon)
        .then((sample) => {
          if (edit) {
            const updatedSampleID = sample.cid;
            App.trigger('records:edit', updatedSampleID, { replace: true });
          } else {
            // return to previous page
            window.history.back();
          }
        })
        .catch((err) => {
          Log(err, 'e');
          App.regions.getRegion('dialog').error(err);
        });
    }, that);
    mainView.on('taxon:searched', (searchPhrase) => {
      SpeciesSearchEngine.search(searchPhrase, (selection) => {
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      });
    });

    App.regions.getRegion('main').show(mainView);
  },

  updateTaxon(sampleID, taxon) {
    if (!sampleID) {
      // create new sighting
      const occurrence = new Occurrence({
        taxon,
      });

      const sample = new Sample();
      sample.addSubModel(occurrence);

      // add locked attributes
      appModel.appendAttrLocks(sample);

      const promise = recordManager.set(sample)
        .then((savedSample) => {
          // check if location attr is not locked
          const locks = appModel.get('attrLocks');

          if (!locks.location) {
            // no previous location
            savedSample.startGPS();
          } else if (!locks.location.latitude || !locks.location.longitude) {
            // previously locked location was through GPS
            // so try again
            savedSample.startGPS();
          }
          return savedSample;
        });

      return promise;
    }

    // edit existing one
    return recordManager.get(sampleID).then((recordModel) => {
      recordModel.getSubModel().set('taxon', taxon);
      return recordModel.save();
    });
  },
};

export { API as default };
