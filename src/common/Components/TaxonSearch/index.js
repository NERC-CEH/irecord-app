import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Device from 'helpers/device';
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

export default class index extends Component {
  static propTypes = {
    onSpeciesSelected: PropTypes.func.isRequired,
    recordedTaxa: PropTypes.array,
    informalGroups: PropTypes.array,
    namesFilter: PropTypes.string,
    showEditButton: PropTypes.bool,
    resetOnSelect: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.inputEl = React.createRef();
    this.onInputKeystroke = this.onInputKeystroke.bind(this);
    this.onInputClear = this.onInputClear.bind(this);
    this.onFocus = this.onFocus.bind(this);
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

  onInputClear() {
    this.setState(getDefaultState());
  }

  onFocus() {
    this.clearFocusSetUp();

    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
    }
  }

  clearFocusSetUp() {
    this.inputEl.current.removeEventListener('ionFocus', this.onFocus);
    this.focus = clearInterval(this.focus);
  }

  componentDidMount() {
    this.inputEl.current.addEventListener('ionInput', this.onInputKeystroke);
    this.inputEl.current.addEventListener('ionClear', this.onInputClear);
    this.inputEl.current.addEventListener('ionFocus', this.onFocus);

    this.focus = setInterval(() => {
      this.inputEl.current.setFocus();
    }, 150);
  }

  componentWillUnmount() {
    this.inputEl.current.removeEventListener('ionInput', this.onInputKeystroke);
    this.inputEl.current.removeEventListener('ionClear', this.onInputClear);
    this.clearFocusSetUp();
  }

  onSpeciesSelected = (species, editButtonPressed) => {
    this.props.onSpeciesSelected(species, editButtonPressed);
    if (this.props.resetOnSelect && !editButtonPressed) {
      this.setState(getDefaultState());
      this.inputEl.current.value = '';
      this.inputEl.current.setFocus();
    }
  };

  render() {
    const { showEditButton } = this.props;
    return (
      <>
        <ion-searchbar
          id="taxon"
          ref={this.inputEl}
          placeholder={t('Species name')}
          autocorrect="off"
          autocomplete="off"
          debounce="300"
        />

        <Suggestions
          searchResults={this.state.searchResults}
          searchPhrase={this.state.searchPhrase}
          showEditButton={showEditButton}
          onSpeciesSelected={this.onSpeciesSelected}
        />
      </>
    );
  }
}
