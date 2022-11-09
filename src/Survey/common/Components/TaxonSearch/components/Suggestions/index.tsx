import { FC } from 'react';
import { IonList, IonItem, IonSpinner } from '@ionic/react';
import { hashCode } from 'helpers/UUID';
import { useTranslation, Trans as T } from 'react-i18next';
import { Taxon } from 'models/occurrence';
import Species from './components/Species';
import './styles.scss';

/**
 * Some common names might be identical so needs to add
 * a latin name next to it.
 * @param suggestions
 */
function deDuplicateSuggestions(suggestions: any) {
  let previous: any;
  const results: any = [];

  suggestions.forEach((taxon: any) => {
    const name =
      taxon.found_in_name >= 0
        ? taxon.common_names[taxon.found_in_name]
        : taxon.scientific_name;

    const nameNormalized = name.toLocaleLowerCase();

    let previousNameNormalized;
    if (previous) {
      const previousName =
        previous.found_in_name >= 0
          ? previous.common_names[previous.found_in_name]
          : previous.scientific_name;

      previousNameNormalized = previousName.toLocaleLowerCase();
    }

    const noCommonNames = !nameNormalized || !previousNameNormalized;
    const isUnique = noCommonNames || nameNormalized !== previousNameNormalized;

    if (isUnique) {
      results.push(taxon);
      previous = taxon;
      return;
    }

    const sameSpecies = previous.warehouse_id === taxon.warehouse_id;
    const sameScientificName =
      previous.scientific_name === taxon.scientific_name;
    if (!sameSpecies && !sameScientificName) {
      // need to qualify both the last pushed name and this entry with the
      // scientific name helps to disambiguate Silene pusilla and
      // Silene suecica with have been (wrongly) assigned the same
      // vernacular name
      if (!previous._dedupedScientificName) {
        previous._dedupedScientificName = previous.scientific_name;
      }

      results.push({
        ...taxon,
        ...{
          _dedupedScientificName: taxon.scientific_name,
        },
      });
    }
  });

  return results;
}

const getSearchInfo = (t: any) => (
  <IonItem className="empty">
    <span>
      <p>
        {t(
          'For quicker searching of the taxa you can use different shortcuts.'
        )}
        <br />
        <br />
        For{' '}
        <b>
          <i>Turdus merula</i>
        </b>
        :
        <br />
        <br />
        <b>
          <i>turdus me</i>
        </b>
        <br />
        <b>
          <i>turdus .la</i>
        </b>
        <br />
        <b>
          <i>tumer</i>
        </b>{' '}
        (2+3 characters)
        <br />
        <b>
          <i>merula</i>
        </b>
      </p>
    </span>
  </IonItem>
);

type Props = {
  searchPhrase: string;
  onSpeciesSelected: any;
  searchResults?: Taxon[];
  suggestedSpecies?: Taxon[];
  suggestionsAreLoading?: boolean;
  showEditButton?: boolean;
};

const Suggestions: FC<Props> = ({
  searchResults,
  showEditButton,
  searchPhrase,
  onSpeciesSelected,
  suggestedSpecies,
  suggestionsAreLoading,
}) => {
  const { t } = useTranslation();

  const getSuggestion = (species: Taxon) => {
    const key = hashCode(JSON.stringify(species));
    return (
      <Species
        key={key}
        species={species}
        showEditButton={showEditButton}
        searchPhrase={searchPhrase}
        onSelect={onSpeciesSelected}
      />
    );
  };

  const getSuggestedSpecies = (species: Taxon[]) => {
    const deDuped = deDuplicateSuggestions(species);

    return (
      <div>
        <h3>
          <T>Suggestions</T>:
        </h3>
        <IonList id="suggestions" lines="none">
          {deDuped.map(getSuggestion)}
        </IonList>
      </div>
    );
  };

  const getAllSuggestions = () => {
    if (!searchResults) {
      if (!suggestionsAreLoading && suggestedSpecies?.length)
        return getSuggestedSpecies(suggestedSpecies);

      if (suggestionsAreLoading)
        return (
          <div>
            <h3>
              <T>Suggestions loading</T>... <IonSpinner />
            </h3>
          </div>
        );

      return (
        <IonList id="suggestions" lines="none">
          {getSearchInfo(t)}
        </IonList>
      );
    }

    const noSpeciesFound = searchResults.length === 0;
    if (noSpeciesFound) {
      return (
        <IonItem className="empty">
          <span>
            <T>No species found with this name</T>
          </span>
        </IonItem>
      );
    }

    const deDuped = deDuplicateSuggestions(searchResults);
    return deDuped.map(getSuggestion);
  };

  return (
    <IonList id="suggestions" lines="none">
      {getAllSuggestions()}
    </IonList>
  );
};

export default Suggestions;
