import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Badge, useAlert, useToast } from '@flumens';
import {
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavContext,
} from '@ionic/react';
import VerificationListStatus from 'common/Components/VerificationListStatus';
import VerificationStatus from 'common/Components/VerificationStatus';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Attributes from './components/Attributes';
import Location from './components/Location';
import OnlineStatus from './components/OnlineStatus';
import './styles.scss';

function useSurveyDeletePrompt(sample: Sample) {
  const alert = useAlert();

  const promptSurveyDelete = () => {
    let body = (
      <T>
        This record hasn't been uploaded to the database yet. Are you sure you
        want to remove it from your device?
      </T>
    );

    const isSynced = sample.syncedAt;
    if (isSynced) {
      body = (
        <T>
          Are you sure you want to remove this record from your device?
          <p>
            <b>Note:</b> it will remain in the database.
          </p>
        </T>
      );
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

const Survey = ({ sample, style, uploadIsPrimary }: Props) => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const deleteSurvey = useSurveyDeletePrompt(sample);
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const survey = sample.getSurvey();

  const { synchronising } = sample.remote;

  const href = !synchronising
    ? `/survey/${survey.name}/${sample.id || sample.cid}`
    : undefined;

  const deleteSurveyWrap = () => deleteSurvey();

  function getInfo() {
    const [occ] = sample.occurrences;

    if (survey.name !== 'default' || !occ) {
      return (
        <div className="survey-info">
          <div className="flex w-full flex-col justify-center">
            <div className="text-base font-semibold capitalize">
              <T>{survey.label || 'Record'}</T>
            </div>

            <div className="overflow-hidden text-ellipsis">
              <Location sample={sample} />
            </div>
          </div>
        </div>
      );
    }

    const taxon = occ.getPrettyName();

    return (
      <div className="survey-info">
        <div className="flex w-full max-w-full flex-col justify-center">
          {taxon ? (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold">
              {taxon}
            </div>
          ) : (
            <Badge color="warning" size="small">
              Species missing
            </Badge>
          )}

          <Location sample={sample} />

          <Attributes occ={occ} />
        </div>
      </div>
    );
  }

  const onUpload = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
    navigate(`/home/surveys`, 'root');
  };

  const getAvatar = () => {
    let img: any;

    const [occ] = sample.occurrences;
    if (occ) {
      const media = occ.media.length && occ.media[0];
      img = media && media.getURL();
      img = img ? <img src={img} /> : '';
    }

    return <div className="photo">{img}</div>;
  };

  const getSpeciesCount = () => {
    const speciesCount = sample.occurrences.length || sample.samples.length;

    return (
      <div className="count">
        <div className="count-wrapper">
          <div className="number">{speciesCount}</div>
          <div className="label">
            <T>Species</T>
          </div>
        </div>
      </div>
    );
  };

  const isDefaultSurvey = survey.name === 'default';

  const { groupId, training } = sample.data;

  const verificationStatus =
    survey.name === 'default' ? (
      <VerificationStatus occ={sample.occurrences[0]} />
    ) : (
      <VerificationListStatus sample={sample} />
    );

  const allowDeletion = sample.isStored;

  const openItem = () => {
    if (sample.remote.synchronising) return; // fixes button onPressUp and other accidental navigation
    navigate(href!);
  };

  return (
    <IonItemSliding className="survey-list-item" style={style}>
      <IonItem onClick={openItem} detail={false}>
        <div className="survey-info-container">
          {groupId && <div className="activity-band" />}
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
      {allowDeletion && (
        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={deleteSurveyWrap}>
            <T>Delete</T>
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  );
};

export default observer(Survey);
