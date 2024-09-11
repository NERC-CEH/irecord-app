import { createOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { IonItem, IonIcon } from '@ionic/react';
import { groups as informalGroups } from 'common/data/informalGroups';
import { Button } from 'common/flumens';
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

const Species = ({
  species,
  searchPhrase,
  showEditButton,
  onSelect,
}: Props) => {
  const prettyName = prettifyName(species, searchPhrase);
  const group = (informalGroups as any)[species.group];

  const { probability } = species;

  return (
    <IonItem className="search-result" onClick={() => onSelect(species)}>
      <div className="flex w-full items-center">
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
          <Button
            className="right-0 w-1/5 max-w-[80px] rounded-none border-0 border-l border-solid border-l-gray-300"
            slot="end"
            fill="clear"
            onPress={() => onSelect(species, true)}
          >
            <IonIcon slot="icon-only" icon={createOutline} mode="md" />
          </Button>
        )}
      </div>
    </IonItem>
  );
};

export default Species;
