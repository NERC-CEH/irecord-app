import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonList, IonIcon, useIonViewDidEnter } from '@ionic/react';
import appModel from 'models/app';
import { lockClosedOutline } from 'ionicons/icons';
import { Main, useAlert } from '@flumens';
import Sample from 'models/sample';
import { useRouteMatch } from 'react-router';
import { Trans as T } from 'react-i18next';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import lockScreenshot from './lock.png';

import './styles.scss';

interface Props {
  sample: Sample;
}

const useAttributeLockingTip = (sample: Sample) => {
  const alert = useAlert();

  const showTip = () => {
    const { shownLockingSwipeTip } = appModel.attrs;
    if (shownLockingSwipeTip) return;

    const [occ] = sample.occurrences;
    const hasLockableAttributes =
      occ && (occ.attrs.comment || occ.attrs.stage || occ.attrs.sex);

    if (!hasLockableAttributes) return;

    appModel.attrs.shownLockingSwipeTip = true;

    alert({
      header: 'Tip: Locks for data entry',
      message: (
        <div className="attr-lock-tip">
          <T>
            If you have added some information for one of the attributes
            attached to your record, you can 'lock' that information so that it
            is automatically added to the next record as well.
            <p>
              Swipe an attribute to the left and tap on the{' '}
              <IonIcon icon={lockClosedOutline} /> button.
            </p>
            <img src={lockScreenshot} alt="" />
          </T>
        </div>
      ),
      buttons: [{ text: 'OK, got it' }],
    });
  };

  useIonViewDidEnter(showTip);
};

const EditMain: FC<Props> = ({ sample }) => {
  useAttributeLockingTip(sample);

  const { url } = useRouteMatch();

  const [occ] = sample.occurrences;

  const { activity } = sample.attrs;

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      <IonList lines="full">
        {isDisabled && (
          <div className="rounded">
            <VerificationMessage occurrence={occ} />
          </div>
        )}

        {isDisabled && (
          <div className="rounded">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {activity && (
          <div className="rounded">
            <MenuAttr.WithLock model={sample} attr="activity" />
          </div>
        )}

        <div className="rounded">
          <PhotoPicker model={occ} />
        </div>

        <div className="rounded">
          <MenuTaxonItem occ={occ} />
          <MenuLocation.WithLock sample={sample} />
          <MenuAttr.WithLock model={sample} attr="date" />
          <MenuAttr.WithLock
            model={occ}
            attr="comment"
            itemProps={{
              routerLink: `${url}/occ/${occ.cid}/comment`,
            }}
          />
          <MenuDynamicAttrs model={sample} />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditMain);
