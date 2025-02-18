import { createOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { IonItem, IonIcon } from '@ionic/react';
import { groups as informalGroups } from 'common/data/informalGroups';
import { Button } from 'common/flumens';
import appModel from 'common/models/app';
import { Taxon } from 'models/occurrence';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';
import './styles.scss';

/**
 * Highlight the searched parts of taxa names.
 */
function prettifyName(
  species: Taxon & { _dedupedScientificName?: string },
  searchPhrase?: string
) {
  const foundInCommonName = Number.isFinite(species.foundInName);
  const name = foundInCommonName
    ? species.commonNames[species.foundInName as number]
    : species.scientificName;

  if (!searchPhrase) return name;

  const searchPos = name.toLowerCase().indexOf(searchPhrase);
  if (!(searchPos >= 0)) {
    return name;
  }

  let secondaryName;
  if (appModel.attrs.searchNamesOnly) {
    if (species._dedupedScientificName)
      secondaryName = (
        <small>
          <i>{species._dedupedScientificName}</i>
        </small>
      );
  } else if (foundInCommonName) {
    secondaryName = (
      <small>
        <i>{species.scientificName}</i>
      </small>
    );
  } else {
    const commonName = species.commonNames || [];
    if (commonName) secondaryName = <small>{commonName}</small>;
  }

  return (
    <>
      <span>
        {name.slice(0, searchPos)}
        <b>{name.slice(searchPos, searchPos + searchPhrase.length)}</b>
        {name.slice(searchPos + searchPhrase.length)}
      </span>

      {secondaryName}
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
    <IonItem
      className="search-result relative overflow-hidden p-0 py-1 text-base [--background:none] [--inner-padding-end:0px] [--padding-start:0px]"
      onClick={() => onSelect(species)}
    >
      <div className="flex w-full items-center py-1">
        {probability && (
          <div className="probability">
            <ProbabilityBadge probability={probability} showInfo />
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
