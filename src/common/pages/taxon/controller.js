/** ****************************************************************************
 * Taxon controller.
 *****************************************************************************/
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import userModel from 'user_model';
import MainView from './main_view';
import HeaderView from '../../views/header_view';
import SpeciesSearchEngine from './search/taxon_search_engine';

const API = {
  show(options = {}) {
    SpeciesSearchEngine.init();

    // MAIN
    API._showMainView(options);
    // should be done in the view
    App.regions.getRegion('main').$el.find('#taxon').select();

    // reset the view listener
    radio.on('taxon:search:reset', () => {
      API._showMainView(options);
    });

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

  _showMainView(options) {
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
  },

  /**
   * Some common names might be identical so needs to add
   * a latin name next to it.
   * @param suggestions
   */
  deDuplicateSuggestions(suggestions) {
    let previous = {};
    const results = [];
    suggestions.forEach((taxon) => {
      const commonName = taxon.common_name && taxon.common_name.toLocaleLowerCase();
      const previousCommonName = previous.common_name && previous.common_name.toLocaleLowerCase();

      if (!commonName || !previousCommonName || commonName !== previousCommonName) {
        // common names don't match - not a dupe taxa
        results.push(taxon);
        previous = taxon;
      } else if (
        taxon.scientific_name.split(/\s+/).length ===
        previous.scientific_name.split(/\s+/).length &&
        // don't add same species with the same name twice
        previous.warehouse_id !== taxon.warehouse_id
      ) {
        // need to qualify both the last pushed name and this entry with the
        // scientific name helps to disambiguate Silene pusilla and
        // Silene suecica with have been (wrongly) assigned the same
        // vernacular name
        const previousQualified = Object.assign({}, previous);
        if (!previousQualified._deduped_common_name) {
          previousQualified._deduped_common_name = `${previous.common_name} <small><i>(${previous.scientific_name})</i></small>`;
          // replace last result with qualified copy
          results[results.length - 1] = previousQualified; // eslint-disable-line
        }

        const currentQualified = Object.assign({}, taxon);
        currentQualified._deduped_common_name = `${taxon.common_name} <small><i>(${taxon.scientific_name})</i></small>`;
        results[results.length] = currentQualified; // eslint-disable-line
      }
    });
    return results;
  },
};

export { API as default };
