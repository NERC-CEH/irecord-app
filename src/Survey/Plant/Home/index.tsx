import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, useToast, device, captureImage } from '@flumens';
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
import './styles.scss';

type Props = {
  sample: Sample;
};

const PlantHome = ({ sample }: Props) => {
  const toast = useToast();
  const { navigate } = useContext(NavContext);
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

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

  const { training } = sample.attrs;

  const subheader = <div>{!!training && <TrainingBand />}</div>;

  const { location } = sample.attrs;

  const isLocationFurtherThan5000m = (smp: Sample) =>
    distance(
      [location.latitude, location.longitude],
      [smp.attrs.location.latitude, smp.attrs.location.longitude],
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
    const surveyConfig = sample.getSurvey();

    const subSamplePromise = imageArray.map(async (img: any) => {
      const imageModel: any = await Media.getImageModel(img, config.dataPath);

      const { useSpeciesImageClassifier } = appModel.attrs;
      const shouldAutoID =
        useSpeciesImageClassifier &&
        device.isOnline &&
        userModel.isLoggedIn() &&
        userModel.attrs.verified;
      if (shouldAutoID) {
        const processError = (error: any) =>
          !error.isHandled && console.error(error); // don't toast this to user
        imageModel.identify('plantnet').catch(processError);
      }

      return surveyConfig.smp!.create!({
        Occurrence,
        Sample,
        surveySample: sample,
        images: [imageModel],
      });
    });

    const subSamples = await Promise.all(subSamplePromise);
    sample.samples.push(...subSamples);

    sample.save();
  }

  return (
    <Page id="survey-complex-plant-edit">
      <Header
        title={`${survey.label} Survey`}
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

export default observer(PlantHome);
