import { observer } from 'mobx-react';
import { lockClosedOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, useAlert } from '@flumens';
import { IonList, IonIcon, useIonViewDidEnter } from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttrs from 'Survey/common/Components/MenuDynamicAttrs';
import MenuLocation from 'Survey/common/Components/MenuLocation';
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

const EditMain = ({ sample }: Props) => {
  useAttributeLockingTip(sample);

  const { url } = useRouteMatch();

  const [occ] = sample.occurrences;

  const { groupId } = sample.attrs;

  const isDisabled = sample.isDisabled();

  return (
    <Main>
      <IonList lines="full" className="mb-2 flex flex-col gap-4">
        {isDisabled && (
          <div className="rounded-list">
            <VerificationMessage occurrence={occ} />
          </div>
        )}

        {isDisabled && (
          <div className="rounded-list">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {groupId && (
          <div className="rounded-list">
            <MenuAttr.WithLock model={sample} attr="groupId" />
          </div>
        )}

        <div className="rounded-list">
          <PhotoPicker model={occ} />
        </div>

        <div className="rounded-list">
          <MenuTaxonItem occ={occ} />
          <MenuLocation.WithLock sample={sample} />
          <MenuAttr.WithLock model={sample} attr="date" />
          <MenuAttr.WithLock model={sample} attr="recorder" />
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
