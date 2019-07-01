import React from 'react';
import PropTypes from 'prop-types';
import Device from 'helpers/device';
import informalGroups from 'common/data/informal_groups.data';
import Log from 'helpers/log';

const onClick = (e, species, onSelect) => {
  Log('taxon: selected.', 'd');
  const edit = e.target.tagName === 'BUTTON';

  onSelect(species, edit);
};

/**
 * Highlight the searched parts of taxa names.
 * @param name
 * @param searchPhrase
 * @returns {*}
 * @private
 */
function prettifyName(species, searchPhrase) {
  const name =
    species.found_in_name >= 0
      ? species.common_names[species.found_in_name]
      : species.scientific_name;

  const searchPos = name.toLowerCase().indexOf(searchPhrase);
  if (!(searchPos >= 0)) {
    return name;
  }
  let deDupedName;
  if (species._dedupedScientificName) {
    deDupedName = (
      <small>
        <br />
        <i>{species._dedupedScientificName}</i>
      </small>
    );
  }
  return (
    <React.Fragment>
      {name.slice(0, searchPos)}
      <b>{name.slice(searchPos, searchPos + searchPhrase.length)}</b>
      {name.slice(searchPos + searchPhrase.length)}
      {deDupedName}
    </React.Fragment>
  );
}

const Species = ({ species, searchPhrase, showEditButton, onSelect }) => {
  const prettyName = prettifyName(species, searchPhrase);

  const group = informalGroups[species.group];

  return (
    <li
      className="table-view-cell"
      onClick={e => onClick(e, species, onSelect)}
    >
      <h3 className="taxon">{prettyName}</h3>
      <span className={`group ${!showEditButton ? 'right' : ''} `}>
        {t(group)}
      </span>
      {showEditButton && (
        <button className="edit-shortcut icon icon-edit icon-small" />
      )}
    </li>
  );
};

Species.propTypes = {
  species: PropTypes.object.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  showEditButton: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Species;
