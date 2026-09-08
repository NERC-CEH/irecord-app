import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IonSearchbar,
  useIonViewDidEnter,
  type SearchbarCustomEvent,
} from '@ionic/react';
import type { ClassifierSuggestion, Taxon } from 'models/occurrence';
import searchSpecies, { Options, SearchResults } from 'helpers/taxonSearch';
import Suggestions from './components/Suggestions';

export { default as TaxonSearchFilters } from './components/TaxonSearchFilters';

const MIN_SEARCH_LENGTH = 2;

type Props = {
  onSpeciesSelected: (
    species: Taxon | ClassifierSuggestion,
    editButtonPressed?: boolean
  ) => void;
  recordedTaxa?: number[];
  selectedFilters?: number[];
  namesFilter?: Options['namesFilter'];
  resetOnSelect?: boolean;
  showEditButton?: boolean;
  suggestedSpecies?: ClassifierSuggestion[];
  suggestionsAreLoading?: boolean;
};

const TaxonSearch = ({
  onSpeciesSelected,
  recordedTaxa,
  selectedFilters: informalGroups,
  namesFilter,
  resetOnSelect,
  showEditButton,
  suggestedSpecies,
  suggestionsAreLoading,
}: Props) => {
  const { t } = useTranslation();

  const inputEl = useRef<HTMLIonSearchbarElement>(null);

  const [searchResults, setSearchResults] = useState<Taxon[]>();
  const [searchPhrase, setSearchPhrase] = useState('');

  const annotateRecordedTaxa = (newSearchResults: SearchResults) =>
    newSearchResults.map((result: Taxon) =>
      recordedTaxa?.includes(result.warehouseId)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );

  const onInputKeystroke = async (e: SearchbarCustomEvent) => {
    const inputValue = e.target.value;

    const isValidSearch =
      typeof inputValue === 'string' && inputValue.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      setSearchResults(undefined);
      setSearchPhrase('');
      return;
    }

    const newSearchPhrase = inputValue.toLowerCase();

    // search
    const newSearchResults = await searchSpecies(newSearchPhrase, {
      informalGroups,
      namesFilter,
    });

    const annotatedSearchResults = annotateRecordedTaxa(newSearchResults);
    setSearchResults(annotatedSearchResults);
    setSearchPhrase(newSearchPhrase);
  };

  const onInputClear = () => {
    setSearchResults(undefined);
    setSearchPhrase('');
  };

  const onSpeciesSelectedWrap = (
    species: Taxon | ClassifierSuggestion,
    editButtonPressed?: boolean
  ) => {
    onSpeciesSelected(species, editButtonPressed);
    if (resetOnSelect && !editButtonPressed) {
      setSearchResults(undefined);
      setSearchPhrase('');
      if (inputEl.current) {
        inputEl.current.value = '';
        inputEl.current.setFocus();
      }
    }
  };

  useIonViewDidEnter(() => {
    if (inputEl.current) {
      inputEl.current.setFocus();
    }
  });

  return (
    <>
      <IonSearchbar
        id="taxon"
        ref={inputEl}
        placeholder={t('Species name')}
        debounce={300}
        onIonInput={onInputKeystroke}
        onIonClear={onInputClear}
        showCancelButton="never"
      />

      <Suggestions
        searchResults={searchResults}
        suggestedSpecies={suggestedSpecies}
        suggestionsAreLoading={suggestionsAreLoading}
        searchPhrase={searchPhrase}
        onSpeciesSelected={onSpeciesSelectedWrap}
        showEditButton={!!showEditButton}
      />
    </>
  );
};

export default TaxonSearch;
