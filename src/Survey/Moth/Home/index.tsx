import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Capacitor } from '@capacitor/core';
import {
  Page,
  useToast,
  Header,
  captureImage,
  device,
  useSample,
  useRemoteSample,
} from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import config from 'common/config';
import appModel from 'common/models/app';
import Media from 'common/models/media';
import Occurrence from 'common/models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import { Action } from 'Survey/common/Components/SpeciesList/BulkEdit';
import SurveyHeaderButton from 'Survey/common/Components/SurveyHeaderButton';
import TrainingBand from 'Survey/common/Components/TrainingBand';
import Main from './Main';

const shouldAutoID = () =>
  appModel.data.useSpeciesImageClassifier &&
  device.isOnline &&
  userModel.isLoggedIn() &&
  userModel.data.verified;

const MothHome = () => {
  const toast = useToast();
  const { navigate } = useContext(NavContext);

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  if (!sample) return null;

  const onBulkEdit = async (
    action: Action,
    modelIds: string[],
    value?: any
  ) => {
    if (action === 'delete') {
      modelIds.forEach(async modelId => {
        const occ = sample.occurrences.find(o => o.cid === modelId);
        if (occ) occ.destroy();
      });
      return;
    }

    if (action === 'stage') {
      modelIds.forEach(async modelId => {
        const occ = sample.occurrences.find(o => o.cid === modelId);
        if (occ) (occ as any).data.stage = value;
      });
      return;
    }

    if (action === 'sex') {
      modelIds.forEach(async modelId => {
        const occ = sample.occurrences.find(o => o.cid === modelId);
        if (occ) (occ as any).data.sex = value;
      });
      return;
    }

    if (action === 'comment') {
      modelIds.forEach(async modelId => {
        const occ = sample.occurrences.find(o => o.cid === modelId);
        if (occ) (occ as any).data.comment = value;
      });
      // return;
    }
  };

  const survey = sample.getSurvey();

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);
    navigate(`/home/surveys`, 'root');
  };

  const _processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    sample.save();

    navigate(`/home/surveys`, 'root');
  };

  const onFinish = async () =>
    !sample.metadata.saved ? _processDraft() : _processSubmission();

  const finishButton = (
    <SurveyHeaderButton sample={sample} onClick={onFinish} />
  );

  const onSubSampleDelete = async (subSample: Sample) => {
    await subSample.destroy();
  };

  async function onSpeciesImageAttach(shouldUseCamera: boolean) {
    const images = await captureImage({
      camera: shouldUseCamera,
      multiple: !shouldUseCamera,
    });

    if (!images) return;

    const imageArray = Array.isArray(images) ? images : [images];
    const surveyConfig = sample!.getSurvey();

    const occurrencesPromise = imageArray.map(async (img: any) => {
      const imageModel: any = await Media.getImageModel(
        isPlatform('hybrid') ? Capacitor.convertFileSrc(img) : img,
        config.dataPath,
        true
      );

      const occ = await surveyConfig.occ!.create!({
        Occurrence,
        images: [imageModel],
      });

      if (shouldAutoID()) {
        const processError = (error: any) =>
          !error.isHandled && console.error(error); // don't toast this to user
        occ.identify().catch(processError);
      }

      return occ;
    });

    const occurrences = await Promise.all(occurrencesPromise);
    sample!.occurrences.push(...occurrences);

    sample!.save();
  }

  const { training } = sample.data;
  const subheader = !!training && <TrainingBand />;

  return (
    <Page id="survey-complex-moth-edit">
      <Header
        title={`${survey.label}`}
        rightSlot={finishButton}
        defaultHref="/home/surveys"
        subheader={subheader}
      />
      <Main
        sample={sample}
        onBulkEdit={onBulkEdit}
        onDelete={onSubSampleDelete}
        attachSpeciesImages={onSpeciesImageAttach}
      />
    </Page>
  );
};

export default observer(MothHome);
