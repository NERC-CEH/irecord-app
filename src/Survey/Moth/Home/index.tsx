import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import { useUserStatusCheck } from 'models/user';
import AppHeaderBand from 'Survey/common/Components/AppHeaderBand';
import PrimaryHeaderButton from 'Survey/common/Components/PrimaryHeaderButton';
import { Page, useToast, Header } from '@flumens';
import Sample, { useValidateCheck } from 'models/sample';
import Main from './Main';

type Props = {
  sample: Sample;
};

const MothHome: FC<Props> = ({ sample }) => {
  const toast = useToast();
  const { navigate } = useContext(NavContext);
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

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

    sample.removeDraftKey();

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    sample.save();

    navigate(`/home/surveys`, 'root');
  };

  const onFinish = async () =>
    !sample.metadata.saved ? _processDraft() : _processSubmission();

  const finishButton = (
    <PrimaryHeaderButton sample={sample} onClick={onFinish} />
  );

  const onSubSampleDelete = async (subSample: Sample) => {
    await subSample.destroy();
  };

  const { training } = sample.attrs;
  const subheader = !!training && <AppHeaderBand training />;

  return (
    <Page id="survey-complex-moth-edit">
      <Header
        title={`${survey.label} Survey`}
        rightSlot={finishButton}
        defaultHref="/home/surveys"
        subheader={subheader}
      />
      <Main sample={sample} onDelete={onSubSampleDelete} />
    </Page>
  );
};

export default observer(MothHome);
