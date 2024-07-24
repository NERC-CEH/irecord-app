import { FC } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { atCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { IonItem, IonLabel, IonIcon, IonBadge } from '@ionic/react';
import Occurrence from 'models/occurrence';
import './styles.scss';

interface Props {
  occ: Occurrence;
  label?: string;
}

const MenuTypeItem: FC<Props> = ({ occ, label = 'Type' }) => {
  const isDisabled = occ.isDisabled();
  const { url } = useRouteMatch();

  const { type } = occ.attrs;

  const empty = type === '' || type === undefined;

  const occPath = url.includes('/occ/') ? '' : `occ/${occ.cid}/`;

  return (
    <IonItem
      detail={!isDisabled}
      routerLink={!isDisabled ? `${url}/${occPath}type` : undefined}
      className={clsx('menu-attr-item menu-attr-item-type required', {
        // empty,
      })}
    >
      <IonIcon icon={atCircleOutline} slot="start" />

      <IonLabel className="type-label">
        <T>{label}</T>
      </IonLabel>

      <IonLabel text-wrap slot="end">
        <div className="flex w-full flex-col items-end">
          {empty && (
            <IonBadge color="warning">
              <T>Type missing</T>
            </IonBadge>
          )}
          <IonLabel className="long">
            <i>{type}</i>
          </IonLabel>
        </div>
      </IonLabel>
    </IonItem>
  );
};

export default observer(MenuTypeItem);
