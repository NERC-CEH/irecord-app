import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonSearchbar, useIonViewDidEnter } from '@ionic/react';
import { Taxon } from 'models/occurrence';
import searchSpecies, { Options } from 'helpers/taxonSearch';
import Suggestions from './components/Suggestions';

export { default as TaxonSearchFilters } from './components/TaxonSearchFilters';

const MIN_SEARCH_LENGTH = 2;

type Props = {
  onSpeciesSelected: any;
  recordedTaxa?: any[];
  selectedFilters?: number[];
  namesFilter?: Options['namesFilter'];
  resetOnSelect?: boolean;
  showEditButton?: boolean;
  suggestedSpecies?: Taxon[];
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

  const inputEl = useRef<any>();

  const [searchResults, setSearchResults] = useState<Taxon[]>();
  const [searchPhrase, setSearchPhrase] = useState('');

  const annotateRecordedTaxa = (newSearchResults: any) =>
    newSearchResults.map((result: any) =>
      recordedTaxa?.includes(result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );

  const onInputKeystroke = async (e: any) => {
    let newSearchPhrase = e.target.value;

    const isValidSearch =
      typeof newSearchPhrase === 'string' &&
      newSearchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      setSearchResults(undefined);
      setSearchPhrase('');
      return;
    }

    newSearchPhrase = newSearchPhrase.toLowerCase();

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

  const onSpeciesSelectedWrap = (species: any, editButtonPressed?: boolean) => {
    onSpeciesSelected(species, editButtonPressed);
    if (resetOnSelect && !editButtonPressed) {
      setSearchResults(undefined);
      setSearchPhrase('');
      inputEl.current.value = '';
      inputEl.current.setFocus();
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
