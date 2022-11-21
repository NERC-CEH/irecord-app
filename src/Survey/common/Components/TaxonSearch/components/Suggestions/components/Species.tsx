import { FC } from 'react';
import { IonItem, IonButton, IonIcon } from '@ionic/react';
import { createOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { groups as informalGroups } from 'common/data/informalGroups';
import { Taxon } from 'models/occurrence';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';
import './styles.scss';

/**
 * Highlight the searched parts of taxa names.
 * @param name
 * @param searchPhrase
 * @returns {*}
 * @private
 */
function prettifyName(
  species: Taxon & { _dedupedScientificName?: string },
  searchPhrase?: string
) {
  const name = Number.isFinite(species.found_in_name)
    ? species.common_names[species.found_in_name as number]
    : species.scientific_name;

  if (!searchPhrase) return name;

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

type Props = {
  species: Taxon;
  searchPhrase?: string;
  onSelect: any;
  showEditButton?: boolean;
};

const Species: FC<Props> = ({
  species,
  searchPhrase,
  showEditButton,
  onSelect,
}) => {
  const prettyName = prettifyName(species, searchPhrase);
  const group = (informalGroups as any)[species.group];

  const onClickWrap = (e: any) => {
    const pressedEditShortcut = e.target.tagName === 'ION-BUTTON';
    onSelect(species, pressedEditShortcut);
  };

  const { probability } = species;

  return (
    <IonItem className="search-result" onClick={onClickWrap}>
      {probability && (
        <div className="probability">
          <ProbabilityBadge probability={probability} />
        </div>
      )}

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

export default Species;
