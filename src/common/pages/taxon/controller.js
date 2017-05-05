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
  show(options = {}) {
    SpeciesSearchEngine.init();

    // MAIN
    const mainView = new MainView({ showEditButton: options.showEditButton, model: userModel });
    mainView.on('taxon:selected', options.onSuccess, this);
    mainView.on('taxon:searched', (searchPhrase) => {
      SpeciesSearchEngine.search(searchPhrase, { informalGroups: options.informalGroups })
        .then((suggestions) => {
          const deDuped = API.deDuplicateSuggestions(suggestions);
          mainView.updateSuggestions(new Backbone.Collection(deDuped), searchPhrase);
        });
    });

    radio.trigger('app:main', mainView);
    // should be done in the view
    App.regions.getRegion('main').$el.find('#taxon').select();

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

  /**
   * Some common names might be identical so needs to add
   * a latin name next to it.
   * @param suggestions
   */
  deDuplicateSuggestions(suggestions) {
    let previous = null;
    const results = [];
    suggestions.forEach((taxon) => {
      if (!previous || (previous.common_name !== taxon.common_name)) {
        // not a dupe taxa
        results.push(taxon);
        previous = taxon;
      } else if (
        taxon.scientific_name.split(/\s+/).length ===
        previous.scientific_name.split(/\s+/).length
      ) {
        // need to qualify both the last pushed name and this entry with the
        // scientific name helps to disambiguate Silene pusilla and
        // Silene suecica with have been (wrongly) assigned the same
        // vernacular name
        const previousQualified = Object.assign({}, previous);
        previousQualified._deduped_common_name = `${previous.common_name} <small><i>(${previous.scientific_name})</i></small>`;
        // replace last result with qualified copy
        results[results.length - 1] = previousQualified; // eslint-disable-line

        const currentQualified = Object.assign({}, taxon);
        currentQualified._deduped_common_name = `${taxon.common_name} <small><i>(${taxon.scientific_name})</i></small>`;
        results[results.length] = currentQualified; // eslint-disable-line
      }
    });
    return results;
  },
};

export { API as default };
