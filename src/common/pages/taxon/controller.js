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
  show(onSuccess, showEditButton) {
    SpeciesSearchEngine.init();

    // MAIN
    const mainView = new MainView({ showEditButton, model: userModel });
    mainView.on('taxon:selected', onSuccess, this);
    mainView.on('taxon:searched', (searchPhrase) => {
      SpeciesSearchEngine.search(searchPhrase, (selection) => {
        mainView.updateSuggestions(new Backbone.Collection(selection), searchPhrase);
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
};

export { API as default };
