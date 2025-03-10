import { useContext } from 'react';
import { observer } from 'mobx-react';
import {
  Page,
  useToast,
  Header,
  captureImage,
  device,
  useSample,
  useRemoteSample,
} from '@flumens';
import { NavContext } from '@ionic/react';
import config from 'common/config';
import appModel from 'common/models/app';
import Media from 'common/models/media';
import Occurrence from 'common/models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import SurveyHeaderButton from 'Survey/common/Components/SurveyHeaderButton';
import TrainingBand from 'Survey/common/Components/TrainingBand';
import Main from './Main';

const MothHome = () => {
  const toast = useToast();
  const { navigate } = useContext(NavContext);

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  if (!sample) return null;

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
      const imageModel: any = await Media.getImageModel(img, config.dataPath);

      const { useSpeciesImageClassifier } = appModel.data;
      const shouldAutoID =
        useSpeciesImageClassifier &&
        device.isOnline &&
        userModel.isLoggedIn() &&
        userModel.data.verified;
      if (shouldAutoID) {
        const processError = (error: any) =>
          !error.isHandled && console.error(error); // don't toast this to user
        imageModel.identify().catch(processError);
      }

      return surveyConfig.occ!.create!({
        Occurrence,
        images: [imageModel],
      });
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
        onDelete={onSubSampleDelete}
        attachSpeciesImages={onSpeciesImageAttach}
      />
    </Page>
  );
};

export default observer(MothHome);
