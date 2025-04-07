import { useContext } from 'react';
import { observer } from 'mobx-react';
import {
  Page,
  Header,
  useToast,
  captureImage,
  device,
  useSample,
  useRemoteSample,
} from '@flumens';
import { NavContext } from '@ionic/react';
import distance from '@turf/distance';
import config from 'common/config';
import gridAlertService from 'common/helpers/gridAlertService';
import appModel from 'common/models/app';
import Media from 'common/models/media';
import Occurrence from 'common/models/occurrence';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import SurveyHeaderButton from 'Survey/common/Components/SurveyHeaderButton';
import TrainingBand from 'Survey/common/Components/TrainingBand';
import Main from './Main';

const ListHome = () => {
  const toast = useToast();
  const { navigate } = useContext(NavContext);

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  if (!sample) return null;

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

    gridAlertService.stop(sample.cid);

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    sample.save();

    navigate(`/home/surveys`, 'root');
  };

  const onSubSampleDelete = async (subSample: Sample) => subSample.destroy();

  const survey = sample.getSurvey();

  const isSaved = sample.metadata.saved;

  const onFinish = async () =>
    !isSaved ? _processDraft() : _processSubmission();

  const finishButton = (
    <SurveyHeaderButton sample={sample} onClick={onFinish} />
  );

  const { training } = sample.data;

  const subheader = !!training && <TrainingBand />;

  const { location } = sample.data;

  const isLocationFurtherThan5000m = (smp: Sample) =>
    distance(
      [location?.latitude, location?.longitude],
      [smp.data.location?.latitude, smp.data.location?.longitude],
      {
        units: 'meters',
      }
    ) > 5000;
  const showChildSampleDistanceWarning = sample.samples.some(
    isLocationFurtherThan5000m
  );

  async function onSpeciesImageAttach(shouldUseCamera: boolean) {
    const images = await captureImage({
      camera: shouldUseCamera,
      multiple: !shouldUseCamera,
    });

    if (!images) return;

    const imageArray = Array.isArray(images) ? images : [images];
    const surveyConfig = sample!.getSurvey();

    const subSamplePromise = imageArray.map(async (img: any) => {
      const imageModel: any = await Media.getImageModel(img, config.dataPath);

      const subSample = await surveyConfig.smp!.create!({
        Occurrence,
        Sample,
        surveySample: sample!,
        images: [imageModel],
      });

      const { useSpeciesImageClassifier } = appModel.data;
      const shouldAutoID =
        useSpeciesImageClassifier &&
        device.isOnline &&
        userModel.isLoggedIn() &&
        userModel.data.verified;
      if (shouldAutoID) {
        const [occ] = subSample.occurrences;
        const processError = (error: any) =>
          !error.isHandled && console.error(error); // don't toast this to user
        occ.identify().catch(processError);
      }

      return subSample;
    });

    const subSamples = await Promise.all(subSamplePromise);
    sample!.samples.push(...subSamples);

    sample!.save();
  }

  return (
    <Page id="survey-complex-default-edit">
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
        showChildSampleDistanceWarning={showChildSampleDistanceWarning}
      />
    </Page>
  );
};

export default observer(ListHome);
