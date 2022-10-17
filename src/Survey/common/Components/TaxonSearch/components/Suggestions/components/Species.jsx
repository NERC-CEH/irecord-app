import PropTypes from 'prop-types';
import { IonItem, IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import informalGroups from 'common/data/informal_groups.data.json';
import './styles.scss';

const onClick = (e, species, onSelect) => {
  const pressedEditShortcut = e.target.tagName === 'ION-BUTTON';
  onSelect(species, pressedEditShortcut);
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
        <i>{species._dedupedScientificName}</i>
      </small>
    );
  }
  return (
    <>
      <span>
        {name.slice(0, searchPos)}
        <b>{name.slice(searchPos, searchPos + searchPhrase.length)}</b>
        {name.slice(searchPos + searchPhrase.length)}
      </span>
      {deDupedName}
    </>
  );
}

const Species = ({ species, searchPhrase, showEditButton, onSelect }) => {
  const prettyName = prettifyName(species, searchPhrase);
  const group = informalGroups[species.group];

  return (
    <IonItem
      className="search-result"
      onClick={e => onClick(e, species, onSelect)}
    >
      <div className="taxon">{prettyName}</div>
      <span className={`group ${!showEditButton ? 'right' : ''} `}>
        <T>{group}</T>
      </span>
      {showEditButton && (
        <IonButton
          className="edit-shortcut"
          slot="end"
          fill="clear"
          color="medium"
        >
          <IonIcon slot="icon-only" icon={createOutline} mode="md" />
        </IonButton>
      )}
    </IonItem>
  );
};

Species.propTypes = {
  species: PropTypes.object.isRequired,
  searchPhrase: PropTypes.string.isRequired,
  showEditButton: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

export default Species;
