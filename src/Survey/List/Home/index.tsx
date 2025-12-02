import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Capacitor } from '@capacitor/core';
import {
  Page,
  Header,
  useToast,
  captureImage,
  device,
  useSample,
  useRemoteSample,
} from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import distance from '@turf/distance';
import config from 'common/config';
import gridAlertService from 'common/helpers/gridAlertService';
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

  const onBulkEdit = async (
    action: Action,
    modelIds: string[],
    value?: any
  ) => {
    if (action === 'delete') {
      modelIds.forEach(async modelId => {
        const subSample = sample.samples.find(smp => smp.cid === modelId);
        if (subSample) await subSample.destroy();
      });
      return;
    }

    if (action === 'stage') {
      modelIds.forEach(async modelId => {
        const subSample = sample.samples.find(smp => smp.cid === modelId);
        if (subSample) (subSample as any).occurrences[0].data.stage = value;
      });
      return;
    }

    if (action === 'sex') {
      modelIds.forEach(async modelId => {
        const subSample = sample.samples.find(smp => smp.cid === modelId);
        if (subSample) (subSample as any).occurrences[0].data.sex = value;
      });
      return;
    }

    if (action === 'comment') {
      modelIds.forEach(async modelId => {
        const subSample = sample.samples.find(smp => smp.cid === modelId);
        if (subSample) (subSample as any).occurrences[0].data.comment = value;
      });
      // return;
    }
  };

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

    if (!images.length) return;

    const surveyConfig = sample!.getSurvey();

    const subSamplePromise = images.map(async (img: any) => {
      const imageModel: any = await Media.getImageModel(
        isPlatform('hybrid') ? Capacitor.convertFileSrc(img) : img,
        config.dataPath,
        true
      );

      const subSample = await surveyConfig.smp!.create!({
        Occurrence,
        Sample,
        surveySample: sample!,
        images: [imageModel],
      });

      if (shouldAutoID()) {
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
        onBulkEdit={onBulkEdit}
        attachSpeciesImages={onSpeciesImageAttach}
        showChildSampleDistanceWarning={showChildSampleDistanceWarning}
      />
    </Page>
  );
};

export default observer(ListHome);
