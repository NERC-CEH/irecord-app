import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { IonItem } from '@ionic/react';
import { Badge } from 'common/flumens';
import Occurrence from 'models/occurrence';

interface Props {
  occ: Occurrence;
}

const MenuTaxonItem = ({ occ }: Props) => {
  const { isDisabled } = occ;
  const { url } = useRouteMatch();

  const { taxon } = occ.data;

  const scientificName =
    taxon?.scientificName ||
    // backwards compatible
    (taxon as any)?.scientific_name;

  let commonName = '';

  if (taxon && Number.isFinite(taxon.foundInName)) {
    commonName = taxon.commonNames[taxon.foundInName as number];
  }

  if ((taxon as any)?.commonName) {
    // in case pulling from warehouse, it is different format
    commonName = (taxon as any).commonName;
  }

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
