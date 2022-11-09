import { useRef, FC, useState } from 'react';
import { IonSearchbar, useIonViewDidEnter } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import searchSpecies from './utils';
import Suggestions from './components/Suggestions';
// import { Taxon } from 'models/occurrence';
import './styles.scss';

export { default as TaxonSearchFilters } from './components/TaxonSearchFilters';

const MIN_SEARCH_LENGTH = 2;

type Props = {
  onSpeciesSelected: any;
  recordedTaxa?: any[];
  informalGroups?: number[];
  namesFilter?: string | null;
  resetOnSelect?: boolean;
  showEditButton?: boolean;
  // suggestedSpecies?: Taxon[];
};

const TaxonSearch: FC<Props> = ({
  onSpeciesSelected,
  recordedTaxa,
  informalGroups,
  namesFilter,
  resetOnSelect,
  showEditButton,
  // suggestedSpecies,
}) => {
  const { t } = useTranslation();

  const inputEl = useRef<any>();

  const [searchResults, setSearchResults] = useState(null);
  const [searchPhrase, setSearchPrase] = useState('');

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
      setSearchResults(null);
      setSearchPrase('');
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
    setSearchPrase(newSearchPhrase);
  };

  const onInputClear = () => {
    setSearchResults(null);
    setSearchPrase('');
  };

  const onSpeciesSelectedWrap = (species: any, editButtonPressed?: boolean) => {
    onSpeciesSelected(species, editButtonPressed);
    if (resetOnSelect && !editButtonPressed) {
      setSearchResults(null);
      setSearchPrase('');
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
        onIonChange={onInputKeystroke}
        onIonClear={onInputClear}
        showCancelButton="never"
      />

      <Suggestions
        searchResults={searchResults}
        searchPhrase={searchPhrase}
        onSpeciesSelected={onSpeciesSelectedWrap}
        showEditButton={!!showEditButton}
      />
    </>
  );
};

export default TaxonSearch;
