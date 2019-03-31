/** ****************************************************************************
 * Taxon controller.
 **************************************************************************** */
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import userModel from 'user_model';
import appModel from 'app_model';
import Log from 'helpers/log';
import MainView from './main_view';
import HeaderView from './header_view';
import SpeciesSearchEngine from './search/taxon_search_engine';
import FiltersView from './filters_view';

const API = {
  show(options = {}) {
    SpeciesSearchEngine.init();

    // MAIN
    API._showMainView(options);
    // should be done in the view
    App.regions
      .getRegion('main')
      .$el.find('#taxon')
      .select();

    // reset the view listener
    radio.on('taxon:search:reset', () => {
      API._showMainView(options, true);
    });

    // HEADER
    API._showHeaderView(options);

    // FOOTER
    radio.trigger('app:footer:hide');
  },

  _showHeaderView(options) {
    const disableFilters = options.informalGroups;
    const headerView = new HeaderView({ model: appModel, disableFilters });

    headerView.on('filter', () => {
      const filtersView = new FiltersView({ model: appModel });
      filtersView.on('filter:taxon', filter => {
        if (!filter) {
          Log('Taxon:Controller: No filter provided', 'e');
          return;
        }
        Log('Taxon:Controller: Filter set');
        appModel.toggleTaxonFilter(filter);

        // reset header
        API._showHeaderView(options);
      });

      filtersView.on('filter:name', filter => {
        Log('Taxon:Controller: Filter for name set');
        appModel.set('searchNamesOnly', filter);
        appModel.save();

        // reset header
        API._showHeaderView(options);
      });

      radio.trigger('app:dialog', {
        title: 'Filter',
        body: filtersView,
        buttons: [
          {
            title: 'Close',
            onClick() {
              radio.trigger('app:dialog:hide');
            },
          },
        ],
      });
    });

    radio.trigger('app:header', headerView);
  },

  _showMainView(options, reset) {
    const mainView = new MainView({
      model: userModel,
      showEditButton: options.showEditButton,
      hideFavourites: options.informalGroups,
      reset,
    });
    mainView.on('taxon:selected', options.onSuccess, this);
    mainView.on('taxon:searched', searchPhrase => {
      let namesFilter;
      if (options.scientificOnly) {
        namesFilter = 'scientific';
      } else {
        namesFilter = appModel.get('searchNamesOnly');
      }

      // get taxa group filters
      let informalGroups = options.informalGroups;
      if (!informalGroups) {
        // user saved ones
        informalGroups = appModel.get('taxonGroupFilters');
      }

      // search
      SpeciesSearchEngine.search(searchPhrase, {
        informalGroups,
        namesFilter,
      }).then(suggestions => {
        const deDuped = API.deDuplicateSuggestions(suggestions);
        mainView.updateSuggestions(
          new Backbone.Collection(deDuped),
          searchPhrase
        );
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
    suggestions.forEach(taxon => {
      const commonName =
        taxon.common_name && taxon.common_name.toLocaleLowerCase();
      const previousCommonName =
        previous.common_name && previous.common_name.toLocaleLowerCase();

      if (
        !commonName ||
        !previousCommonName ||
        commonName !== previousCommonName
      ) {
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
          previousQualified._deduped_common_name = `${
            previous.common_name
          } <small><i>(${previous.scientific_name})</i></small>`;
          // replace last result with qualified copy
          results[results.length - 1] = previousQualified; // eslint-disable-line
        }

        const currentQualified = Object.assign({}, taxon);
        currentQualified._deduped_common_name = `${
          taxon.common_name
        } <small><i>(${taxon.scientific_name})</i></small>`;
        results[results.length] = currentQualified; // eslint-disable-line
      }
    });
    return results;
  },
};

export { API as default };
