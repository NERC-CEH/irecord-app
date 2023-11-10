import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import distance from '@turf/distance';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import AppHeaderBand from 'Survey/common/Components/AppHeaderBand';
import PrimaryHeaderButton from 'Survey/common/Components/PrimaryHeaderButton';
import Main from './Main';

type Props = {
  sample: Sample;
};

const ListHome: FC<Props> = ({ sample }) => {
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
    <PrimaryHeaderButton sample={sample} onClick={onFinish} />
  );

  const { training } = sample.attrs;

  const subheader = !!training && <AppHeaderBand training />;

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
        showChildSampleDistanceWarning={showChildSampleDistanceWarning}
      />
    </Page>
  );
};

export default observer(ListHome);
