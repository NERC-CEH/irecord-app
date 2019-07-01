import React from 'react';
import PropTypes from 'prop-types';
import Species from './components/Species';
import './styles.scss';

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

const searchInfo = (
  <p id="taxa-shortcuts-info">
    {t(
      'For quicker searching of the taxa you can use different shortcuts. For example, to find'
    )}
    {' '}
    <i>Puffinus baroli</i> 
    {' '}
    {t('you can type in the search bar')}
    :
    <br />
    <br />
    <i>puffinus ba</i>
    <br />
    <i>puffinus .oli</i>
    <br />
    <i>. baroli</i>
  </p>
);

const Suggestions = ({
  searchResults,
  showEditButton,
  searchPhrase,
  onSpeciesSelected,
}) => {
  if (!searchResults) {
    return <div id="suggestions">{searchInfo}</div>;
  }

  let suggestionsList;
  if (!searchResults.length) {
    suggestionsList = (
      <li className="table-view-cell empty">
        {t('No species found with this name')}
      </li>
    );
  } else {
    const deDuped = deDuplicateSuggestions(searchResults);

    suggestionsList = deDuped.map(species => {
      const key = `${species.warehouse_id}-${species.found_in_name}-${
        species.isFavourite
      }`;
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
    <div id="suggestions">
      <ul className="table-view">{suggestionsList}</ul>
    </div>
  );
};

Suggestions.propTypes = {
  searchResults: PropTypes.array,
  showEditButton: PropTypes.bool.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  onSpeciesSelected: PropTypes.func.isRequired,
};

export default Suggestions;
