import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { IonItem } from '@ionic/react';
import { Badge } from 'common/flumens';
import Occurrence from 'models/occurrence';

interface Props {
  occ: Occurrence;
}

const MenuTaxonItem = ({ occ }: Props) => {
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
      className="menu-attr-item menu-attr-item-taxon required"
    >
      <div
        slot="end"
        className="flex w-full !max-w-none flex-col items-end py-2"
      >
        {empty && <Badge color="warning">Species missing</Badge>}
        {commonName && <div className="long">{commonName}</div>}
        <div className="long">
          <i>{scientificName}</i>
        </div>
      </div>
    </IonItem>
  );
};

export default observer(MenuTaxonItem);
