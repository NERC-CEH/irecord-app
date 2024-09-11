import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import distance from '@turf/distance';
import gridAlertService from 'common/helpers/gridAlertService';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
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
        showChildSampleDistanceWarning={showChildSampleDistanceWarning}
      />
    </Page>
  );
};

export default observer(PlantHome);
