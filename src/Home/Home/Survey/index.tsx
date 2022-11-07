import { FC, useContext } from 'react';
import { useAlert, useToast } from '@flumens';
import { observer } from 'mobx-react';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavContext,
  IonBadge,
} from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import { useTranslation, Trans as T } from 'react-i18next';
import VerificationStatus from 'common/Components/VerificationStatus';
import VerificationListStatus from 'common/Components/VerificationListStatus';
import OnlineStatus from './components/OnlineStatus';
import Attributes from './components/Attributes';
import Location from './components/Location';
import './styles.scss';

function useSurveyDeletePrompt(sample: Sample) {
  const alert = useAlert();

  const promptSurveyDelete = () => {
    let body =
      "This record hasn't been uploaded to the database yet. " +
      'Are you sure you want to remove it from your device?';

    const isSynced = sample.metadata.syncedOn;
    if (isSynced) {
      body =
        'Are you sure you want to remove this record from your device?' +
        '</br><i><b>Note:</b> it will remain in the database.</i>';
    }
    alert({
      header: 'Delete',
      message: body,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => sample.destroy(),
        },
      ],
    });
  };

  return promptSurveyDelete;
}

type Props = {
  sample: Sample;
  uploadIsPrimary?: boolean;
  style?: any;
};

const Survey: FC<Props> = ({ sample, style, uploadIsPrimary }) => {
  const { navigate } = useContext(NavContext);
  const { t } = useTranslation();
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(sample);
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const survey = sample.getSurvey();

  const { synchronising } = sample.remote;

  const href = !synchronising
    ? `/survey/${survey.name}/${sample.cid}`
    : undefined;

  const deleteSurveyWrap = () => deleteSurvey();

  function getInfo() {
    if (survey.name !== 'default') {
      return (
        <div className="survey-info">
          <div className="details">
            <div className="survey-name">{`${survey.label} Survey`}</div>

            <div className="core">
              <Location sample={sample} />
            </div>
          </div>
        </div>
      );
    }

    const [occ] = sample.occurrences;
    if (!occ) return <div />;

    const taxon = occ.getPrettyName();

    const isDefaultSurvey = occ.attrs.taxon && survey.name === 'default'; // photo-first sample check

    return (
      <div className="survey-info">
        <div className="details">
          {taxon ? (
            <div className="species">{taxon}</div>
          ) : (
            <IonBadge className="species" color="warning">
              <T>Species missing</T>
            </IonBadge>
          )}

          <div className="core">
            <Location sample={sample} />
          </div>

          <div className="attributes">
            <Attributes
              occ={occ}
              isDefaultSurvey={isDefaultSurvey}
              sample={sample}
            />
          </div>
        </div>
      </div>
    );
  }

  const onUpload = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
    navigate(`/home/surveys`, 'root');
  };

  const getAvatar = () => {
    const [occ] = sample.occurrences;
    if (!occ) return null;

    const media = occ.media.length && occ.media[0];
    let img: any = media && media.attrs.thumbnail;
    img = img ? <img src={img} /> : '';

    return <div className="photo">{img}</div>;
  };

  const getSpeciesCount = () => {
    const speciesCount = sample.occurrences.length || sample.samples.length;

    return (
      <div className="count">
        <div className="count-wrapper">
          <div className="number">{speciesCount}</div>
          <div className="label">Species</div>
        </div>
      </div>
    );
  };

  const isDefaultSurvey = survey.name === 'default';

  const { activity, training } = sample.attrs;

  const verificationStatus =
    survey.name === 'default' ? (
      <VerificationStatus occ={sample.occurrences[0]} />
    ) : (
      <VerificationListStatus sample={sample} />
    );

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem routerLink={href} detail={false}>
        <div className="survey-info-container">
          {activity && <div className="activity-band" />}
          {training && <div className="training-band" />}

          {isDefaultSurvey ? getAvatar() : getSpeciesCount()}

          {getInfo()}

          <OnlineStatus
            sample={sample}
            onUpload={onUpload}
            uploadIsPrimary={uploadIsPrimary}
          />

          {verificationStatus}
        </div>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={deleteSurveyWrap}>
          {t('Delete')}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(Survey);
