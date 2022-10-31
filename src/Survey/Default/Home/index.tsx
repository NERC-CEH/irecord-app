import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import { useUserStatusCheck } from 'models/user';
import Sample, { useValidateCheck } from 'models/sample';
import { Page, Header, useToast } from '@flumens';
import AppHeaderBand from 'Survey/common/Components/AppHeaderBand';
import PrimaryHeaderButton from 'Survey/common/Components/PrimaryHeaderButton';
import Main from './Main';

type Props = {
  sample: Sample;
};

const DefaultHome: FC<Props> = ({ sample }) => {
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

  const onFinish = async () =>
    !sample.metadata.saved ? _processDraft() : _processSubmission();

  const finishButton = (
    <PrimaryHeaderButton sample={sample} onClick={onFinish} />
  );

  const { training } = sample.attrs;
  const subheader = !!training && <AppHeaderBand training />;

  return (
    <Page id="survey-default-edit">
      <Header
        title="Record"
        rightSlot={finishButton}
        defaultHref="/home/surveys"
        subheader={subheader}
      />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(DefaultHome);
