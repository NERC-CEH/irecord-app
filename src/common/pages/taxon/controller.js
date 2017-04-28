/** ****************************************************************************
 * Taxon controller.
 *****************************************************************************/
import Backbone from 'backbone';
import Indicia from 'indicia';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import Sample from 'sample';
import Occurrence from 'occurrence';
import MainView from './main_view';
import HeaderView from '../../views/header_view';
import SpeciesSearchEngine from './search/taxon_search_engine';

const API = {
  show(sampleID) {
    SpeciesSearchEngine.init();

    const that = this;
    this.id = sampleID;

    if (sampleID) {
      // wait till savedSamples is fully initialized
      if (savedSamples.fetching) {
        savedSamples.once('fetching:done', () => {
          API.show.apply(that, [sampleID]);
        });
        return;
      }

      // check if the sample has taxon specified
      const sample = savedSamples.get(sampleID);
      // Not found
      if (!sample) {
        Log('No sample model found.', 'e');
        radio.trigger('app:404:show', { replace: true });
        return;
      }

      // can't edit a saved one - to be removed when sample update
      // is possible on the server
      if (sample.getSyncStatus() === Indicia.SYNCED) {
        radio.trigger('samples:show', sampleID, { replace: true });
        return;
      }

      let mainView;

      if (!sample.getOccurrence().get('taxon')) {
        mainView = new MainView({ model: userModel });
      } else {
        mainView = new MainView({ removeEditBtn: true, model: userModel });
      }
      API._showMainView(mainView, that);
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
    radio.trigger('app:header', headerView);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  _showMainView(mainView, that) {
    const sampleID = that.id;
    mainView.on('taxon:selected', (taxon, edit) => {
      API.updateTaxon(sampleID, taxon)
        .then((sample) => {
          if (edit) {
            const updatedSampleID = sample.cid;
            radio.trigger('samples:edit', updatedSampleID, { replace: true });
          } else {
            // return to previous page
            window.history.back();
          }
        })
        .catch((err) => {
          Log(err, 'e');
          radio.trigger('app:dialog:error', err);
        });
    }, that);
    mainView.on('taxon:searched', (searchPhrase) => {
      SpeciesSearchEngine.search(searchPhrase, (selection) => {
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
      });
    });

    radio.trigger('app:main', mainView);
  },

  updateTaxon(sampleID, taxon) {
    if (!sampleID) {
      // create new sighting
      const occurrence = new Occurrence({
        taxon,
      });

      const sample = new Sample(null, {
        metadata: {
          survey: 'general',
        },
      });
      sample.addOccurrence(occurrence);

      // add locked attributes
      appModel.appendAttrLocks(sample);

      const promise = sample.save()
        .then((savedSample) => {
          savedSamples.add(sample);

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
    const sample = savedSamples.get(sampleID);
    sample.getOccurrence().set('taxon', taxon);
    return sample.save();
  },
};

export { API as default };
