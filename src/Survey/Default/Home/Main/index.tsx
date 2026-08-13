import { observer } from 'mobx-react';
import { lockClosedOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, useAlert } from '@flumens';
import { IonList, IonIcon, useIonViewDidEnter } from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import {
  commentAttr,
  dateAttr,
  defaultSensitivityPrecisionAttr,
  groupIdAttr,
  recorderAttr,
} from 'Survey/Default/config';
import DisabledRecordMessage from 'Survey/common/Components/DisabledRecordMessage';
import MenuAttr from 'Survey/common/Components/MenuAttr';
import MenuDynamicAttr from 'Survey/common/Components/MenuDynamicAttr';
import MenuLocation from 'Survey/common/Components/MenuLocation';
import MenuTaxonItem from 'Survey/common/Components/MenuTaxonItem';
import PhotoPicker from 'Survey/common/Components/PhotoPicker';
import VerificationMessage from 'Survey/common/Components/VerificationMessage';
import useSensitivityTip from 'Survey/common/Components/hooks';
import lockScreenshot from './lock.png';
import './styles.scss';

type Props = {
  sample: Sample;
};

const useAttributeLockingTip = (sample: Sample) => {
  const alert = useAlert();

  const showTip = () => {
    const { shownLockingSwipeTip } = appModel.data;
    if (shownLockingSwipeTip) return;

    const [occ] = sample.occurrences;
    const hasStageOrSex = sample
      .getSurvey()
      .occ?.render?.some(
        (attr: any) =>
          ['Stage', 'Sex'].includes(attr.title) && (occ?.data as any)?.[attr.id]
      );
    const hasLockableAttributes = occ && (occ.data.comment || hasStageOrSex);

    if (!hasLockableAttributes) return;

    appModel.data.shownLockingSwipeTip = true;

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
  const survey = sample.getSurvey();
  const showSensitivityWarning = useSensitivityTip();

  const surveyConfig = sample.getSurvey();

  const { url } = useRouteMatch();

  const [occ] = sample.occurrences;
  if (!occ) return null;

  const { groupId } = sample.data;

  const { isDisabled } = sample;

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full" className="mb-2 flex! flex-col gap-4">
        {isDisabled && (
          <div className="rounded-list mb-2">
            <VerificationMessage occurrence={occ} />
          </div>
        )}

        {isDisabled && (
          <div className="rounded-list mb-2">
            <DisabledRecordMessage sample={sample} />
          </div>
        )}

        {/* Only showing if pre-selected */}
        {groupId && (
          <div className="rounded-list">
            <MenuAttr.WithLock
              model={sample}
              block={groupIdAttr}
              survey={survey.name}
              taxa="all"
            />
          </div>
        )}

        <div className="rounded-list">
          <PhotoPicker model={occ} />
        </div>

        <div className="rounded-list">
          <MenuTaxonItem occ={occ} />
          <MenuLocation.WithLock
            sample={sample}
            survey={survey.name}
            taxa="all"
          />
          <MenuAttr.WithLock
            model={sample}
            block={dateAttr}
            survey={survey.name}
            taxa="all"
          />
          <MenuAttr.WithLock
            model={sample}
            block={recorderAttr}
            survey={survey.name}
            taxa="all"
          />

          {surveyConfig.render?.map((attr: any) => (
            <MenuDynamicAttr
              key={attr.id}
              model={sample}
              block={attr}
              survey={survey.name}
              taxa={survey.taxa}
            />
          ))}
          {surveyConfig.occ?.render?.map((attr: any) => (
            <MenuDynamicAttr
              key={attr.id}
              model={occ}
              block={attr}
              useSeparateOccPage
              survey={survey.name}
              taxa={survey.taxa}
            />
          ))}
          <MenuAttr.WithLock
            model={occ}
            block={defaultSensitivityPrecisionAttr}
            onChange={(val, _, { record }) => {
              Object.assign(record, {
                [defaultSensitivityPrecisionAttr.id]: val,
              });
              showSensitivityWarning(!!val);
            }}
            survey={survey.name}
            taxa="all"
          />
          <MenuAttr.WithLock
            model={occ}
            block={commentAttr}
            link={`${url}/occ/${occ.cid}/comment`}
            survey={survey.name}
            taxa="all"
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditMain);
