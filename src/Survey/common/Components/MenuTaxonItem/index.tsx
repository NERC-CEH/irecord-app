import { FC } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { IonItem, IonLabel, IonBadge } from '@ionic/react';
import Occurrence from 'models/occurrence';
import './styles.scss';

interface Props {
  occ: Occurrence;
}

const MenuTaxonItem: FC<Props> = ({ occ }) => {
  const isDisabled = occ.isDisabled();
  const { url } = useRouteMatch();

  const { taxon } = occ.attrs;

  const scientificName = taxon?.scientific_name;
  const commonName =
    taxon && Number.isFinite(taxon.found_in_name)
      ? taxon.common_names[taxon.found_in_name as number]
      : '';

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
        <div className="flex w-full flex-col items-end">
          {empty && (
            <IonBadge color="warning">
              <T>Species missing</T>
            </IonBadge>
          )}
          {commonName && <IonLabel className="long">{commonName}</IonLabel>}
          <IonLabel className="long">
            <i>{scientificName}</i>
          </IonLabel>
        </div>
      </IonLabel>
    </IonItem>
  );
};

export default observer(MenuTaxonItem);
