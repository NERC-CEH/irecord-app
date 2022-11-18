import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { NavContext, IonToolbar } from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import { informationOutline } from 'ionicons/icons';
import appModel from 'models/app';
import AppHeaderBand from 'Survey/common/Components/AppHeaderBand';
import {
  Page,
  Header,
  useToast,
  useAlert,
  MenuAttrToggle,
  InfoButton,
} from '@flumens';
import PrimaryHeaderButton from 'Survey/common/Components/PrimaryHeaderButton';
import gridAlertService from './gridAlertService';
import Main from './Main';
import './styles.scss';

type Location = any;

type Props = {
  sample: Sample;
};

const PlantHome: FC<Props> = ({ sample }) => {
  const toast = useToast();
  const alert = useAlert();
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

    if (gridAlertService.isRunning()) gridAlertService.stop();

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

  const isGridAlertActive = gridAlertService.isRunning();

  const showGridChangeAlert = (newLocation: Location) => {
    if (!newLocation.gridref) {
      console.error('No gridref in grid alert');
      return;
    }

    const { gridSquareUnit } = appModel.attrs;

    alert({
      header: `Your ${gridSquareUnit} changed to:`,
      cssClass: 'grid-square-alert',
      message: <h1>{newLocation.gridref}</h1>,
      buttons: [{ text: 'OK' }],
    });
  };

  const onToggleGridAlert = (turnOn: boolean) =>
    !gridAlertService.isRunning() && turnOn
      ? gridAlertService.start(showGridChangeAlert)
      : gridAlertService.stop();

  const isDisabled = sample.isDisabled();

  const GPSToggle = !isDisabled && (
    <IonToolbar className="grid-alert-toggle">
      <InfoButton header="Grid square alert" icon={informationOutline}>
        We will notify you when you cross into another grid square. You can
        select the square size in the app settings.
      </InfoButton>

      <MenuAttrToggle
        label="Use grid alert"
        value={isGridAlertActive}
        onChange={onToggleGridAlert}
        skipTranslation
      />
    </IonToolbar>
  );

  const { training } = sample.attrs;

  const subheader = (
    <>
      {!!training && <AppHeaderBand training />}
      {GPSToggle}
    </>
  );

  return (
    <Page id="survey-complex-plant-edit">
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

export default observer(PlantHome);
