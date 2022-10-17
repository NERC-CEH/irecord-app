import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import { IonSearchbar, withIonLifeCycle } from '@ionic/react';
import SpeciesSearchEngine from './utils/taxon_search_engine';
import Suggestions from './components/Suggestions';
import './styles.scss';

export { default as TaxonSearchFilters } from './components/TaxonSearchFilters';

const MIN_SEARCH_LENGTH = 2;

function getDefaultState() {
  return {
    searchResults: null,
    searchPhrase: '',
  };
}

class TaxonSearch extends Component {
  static propTypes = {
    onSpeciesSelected: PropTypes.func.isRequired,
    recordedTaxa: PropTypes.array,
    informalGroups: PropTypes.array,
    namesFilter: PropTypes.string,
    resetOnSelect: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.inputEl = createRef();
    this.state = getDefaultState();
  }

  annotateRecordedTaxa = searchResults => {
    const recordedTaxa = this.props.recordedTaxa || [];
    return searchResults.map(result =>
      recordedTaxa.includes(result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );
  };

  onInputKeystroke = async e => {
    const { informalGroups, namesFilter } = this.props;

    let searchPhrase = e.target.value;

    const isValidSearch =
      typeof searchPhrase === 'string' &&
      searchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      this.setState(getDefaultState());
      return;
    }

    searchPhrase = searchPhrase.toLowerCase();

    // search
    const searchResults = await SpeciesSearchEngine.search(searchPhrase, {
      informalGroups,
      namesFilter,
    });

    const annotatedSearchResults = this.annotateRecordedTaxa(searchResults);

    this.setState({
      searchResults: annotatedSearchResults,
      searchPhrase,
    });
  };

  onInputClear = () => {
    this.setState(getDefaultState());
  };

  onSpeciesSelected = (species, editButtonPressed) => {
    this.props.onSpeciesSelected(species, editButtonPressed);
    if (this.props.resetOnSelect && !editButtonPressed) {
      this.setState(getDefaultState());
      this.inputEl.current.value = '';
      this.inputEl.current.setFocus();
    }
  };

  ionViewDidEnter() {
    if (this.inputEl.current) {
      this.inputEl.current.setFocus();
    }
  }

  render() {
    return (
      <>
        <IonSearchbar
          id="taxon"
          ref={this.inputEl}
          placeholder={t('Species name')}
          debounce="300"
          onIonChange={this.onInputKeystroke}
          onIonClear={this.onInputClear}
          showCancelButton="never"
        />

        <Suggestions
          searchResults={this.state.searchResults}
          searchPhrase={this.state.searchPhrase}
          onSpeciesSelected={this.onSpeciesSelected}
          showEditButton={this.props.showEditButton}
        />
      </>
    );
  }
}

export default withIonLifeCycle(TaxonSearch);
