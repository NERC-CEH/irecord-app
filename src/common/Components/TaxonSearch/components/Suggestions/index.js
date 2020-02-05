import React from 'react';
import { IonList, IonItem } from '@ionic/react';
import PropTypes from 'prop-types';
import { hashCode } from 'helpers/UUID';
import Species from './components/Species';

/**
 * Some common names might be identical so needs to add
 * a latin name next to it.
 * @param suggestions
 */
function deDuplicateSuggestions(suggestions) {
  let previous;
  const results = [];

  suggestions.forEach(taxon => {
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
        {t(
          'For quicker searching of the taxa you can use different shortcuts.'
        )}
        <br />
        <br />
        For
        {' '}
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
          <i>turme</i>
        </b>
        {' '}
        (3+2 characters)
        <br />
        <b>
          <i>merula</i>
        </b>
      </p>
    </span>
  </IonItem>
);

const Suggestions = ({
  searchResults,
  showEditButton,
  searchPhrase,
  onSpeciesSelected,
}) => {
  if (!searchResults) {
    return (
      <IonList id="suggestions" lines="none">
        {getSearchInfo()}
      </IonList>
    );
  }

  let suggestionsList;
  if (!searchResults.length) {
    suggestionsList = (
      <IonItem className="empty">
        <span>{t('No species found with this name')}</span>
      </IonItem>
    );
  } else {
    const deDuped = deDuplicateSuggestions(searchResults);

    suggestionsList = deDuped.map(species => {
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
    });
  }

  return (
    <IonList id="suggestions" lines="none">
      {suggestionsList}
    </IonList>
  );
};

Suggestions.propTypes = {
  searchResults: PropTypes.array,
  showEditButton: PropTypes.bool.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  onSpeciesSelected: PropTypes.func.isRequired,
};

export default Suggestions;
