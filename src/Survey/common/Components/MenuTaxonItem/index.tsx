import { FC } from 'react';
import { IonItem, IonLabel, IonBadge } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Occurrence from 'models/occurrence';
import { useRouteMatch } from 'react-router';
import clsx from 'clsx';
import './styles.scss';

interface Props {
  occ: Occurrence;
}

const MenuTaxonItem: FC<Props> = ({ occ }) => {
  const isDisabled = occ.isDisabled();
  const { url } = useRouteMatch();

  const species = occ.attrs.taxon || {};

  // taxon
  const scientificName = species.scientific_name;
  const commonName =
    species.found_in_name >= 0 && species.common_names[species.found_in_name];

  const empty = !commonName && !scientificName;

  const occPath = url.includes('/occ/') ? '' : `occ/${occ.cid}/`;

  return (
    <IonItem
      detail={!isDisabled}
      routerLink={!isDisabled ? `${url}/${occPath}taxon` : undefined}
      className={clsx('menu-attr-item menu-attr-item-taxon required', {
        // empty,
      })}
    >
      <IonLabel text-wrap slot="end">
        {empty && (
          <IonBadge color="warning">
            <T>Species missing</T>
          </IonBadge>
        )}
        {commonName && <IonLabel className="long">{commonName}</IonLabel>}
        <IonLabel className="long">
          <i>{scientificName}</i>
        </IonLabel>
      </IonLabel>
    </IonItem>
  );
};

export default MenuTaxonItem;
