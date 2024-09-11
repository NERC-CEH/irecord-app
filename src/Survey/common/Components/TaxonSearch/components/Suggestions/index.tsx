import { Trans as T } from 'react-i18next';
import { hashCode } from '@flumens';
import { IonList, IonItem, IonSpinner } from '@ionic/react';
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

const getSearchInfo = () => (
  <IonItem className="empty">
    <span>
      <p>
        <T>
          Type in a species name (English or scientific name, or a genus or
          family etc.).
        </T>
        <br />
        <br />
        <T>
          To find a species from its scientific name you can use shortcuts, e.g.
          to find
          <b>
            <i> Bellis perrenis</i>
          </b>{' '}
          (Daisy) you can type:
        </T>
        <br />
        <br />
        <b>
          <i>bellis p</i>
        </b>
        <br />
        <b>
          <i>bellis .ni</i>
        </b>
        <br />
        <b>
          <i> beper </i>
        </b>{' '}
        <T>(2 letters of genus + 3 of species)</T>
        <br />
        <b>
          <i>perennis</i>
        </b>
        <br />
        <br />
        <T>
          Once you have added the name, you can add a photo, and the app will
          suggest an identification based on the photo.
        </T>
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

const Suggestions = ({
  searchResults,
  showEditButton,
  searchPhrase,
  onSpeciesSelected,
  suggestedSpecies,
  suggestionsAreLoading,
}: Props) => {
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
      <>
        <div>{/* quick hack to fix odd css style */}</div>
        <h3>
          <T>Suggestions</T>:
        </h3>
        {deDuped.map(getSuggestion)}
      </>
    );
  };

  const getAllSuggestions = () => {
    if (!searchResults) {
      if (!suggestionsAreLoading && suggestedSpecies?.length)
        return getSuggestedSpecies(suggestedSpecies);

      if (suggestionsAreLoading)
        return (
          <h3>
            <T>Loading suggestions</T>... <IonSpinner />
          </h3>
        );

      return getSearchInfo();
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
