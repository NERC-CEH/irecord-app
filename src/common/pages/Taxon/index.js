import React from 'react';
import appModel from 'app_model';
import Device from 'helpers/device';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import SpeciesSearchEngine from './utils/taxon_search_engine';
import Suggestions from './components/Suggestions';
import './styles.scss';

const MIN_SEARCH_LENGTH = 2;

@observer
class Controller extends React.Component {
  constructor(props) {
    super(props);

    SpeciesSearchEngine.init();

    this.inputEl = React.createRef();
    this.onInputKeystroke = this.onInputKeystroke.bind(this);
    this.onInputClear = this.onInputClear.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = this.getDefaultState();
  }

  getDefaultState() {
    return {
      searchResults: this.props.favouriteSpecies,
      searchPhrase: '',
    };
  }

  async onInputKeystroke(e) {
    const { informalGroups } = this.props;

    let searchPhrase = e.target.value;

    const isValidSearch =
      typeof searchPhrase === 'string' &&
      searchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      this.setState(this.getDefaultState());
      return;
    }

    searchPhrase = searchPhrase.toLowerCase();

    const userSavedGroups = appModel.get('taxonGroupFilters');
    const informalGroupsSelected = informalGroups || userSavedGroups;

    const namesFilter = appModel.get('searchNamesOnly');

    // search
    const searchResults = await SpeciesSearchEngine.search(searchPhrase, {
      informalGroups: informalGroupsSelected,
      namesFilter,
    });

    this.setState({
      searchResults,
      searchPhrase,
    });
  }

  onInputClear() {
    this.setState(this.getDefaultState());
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

  render() {
    const { showEditButton, onSuccess } = this.props;

    const onSpeciesSelected = (taxon, editButtonClicked) => {
      onSuccess(taxon, editButtonClicked);
    };

    return (
      <React.Fragment>
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
          onSpeciesSelected={onSpeciesSelected}
        />
      </React.Fragment>
    );
  }
}

Controller.propTypes = {
  showEditButton: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  favouriteSpecies: PropTypes.array,
  informalGroups: PropTypes.array,
};

export default Controller;
