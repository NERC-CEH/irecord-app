import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { chevronDownOutline, informationCircleOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { InfoMessage, RadioInput, useToast, useLoader, device } from '@flumens';
import { IonList, IonRefresher, IonRefresherContent } from '@ionic/react';
import CONFIG from 'common/config';
import { AppModel } from 'models/app';
import Sample from 'models/sample';
import { UserModel } from 'models/user';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import './styles.scss';

type Props = {
  sample?: Sample;
  userModel: UserModel;
  appModel: AppModel;
  onSelect: any;
};

const Activities: FC<Props> = ({ sample, userModel, appModel, onSelect }) => {
  const toast = useToast();
  const loader = useLoader();
  const { t } = useTranslation();

  const syncActivities = async () => {
    if (
      !device.isOnline ||
      !userModel.isLoggedIn() ||
      !userModel.attrs.verified
    )
      return;

    try {
      await loader.show('Please wait...');

      await userModel.syncActivities(true);
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const syncActivitiesFirstTime = () => {
    if (userModel.attrs.activities?.length) return;

    syncActivities();
  };

  useEffect(syncActivitiesFirstTime, []);

  const syncActivitiesOnPull = async (e: any) => {
    e && e.detail.complete(); // spinner is shown elsewhere

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    if (!userModel.isLoggedIn()) {
      toast.warn('Sorry, you have to login first.');
      return;
    }

    syncActivities();
  };

  const getActivitiesList = () => {
    const { activities } = userModel.attrs;

    if (!activities.length) {
      return null;
    }

    const lockedActivity = appModel.getAttrLock('smp', 'activity');
    let sampleActivity;

    if (sample) {
      sampleActivity = sample.attrs.activity;
    }

    const selectedActivity = sampleActivity || lockedActivity || {};

    const empty = {
      id: '',
      title: t('Default'),
      description: '',
    };

    const getOption = ({ title, id }: any) => ({ value: id, label: title });
    const options = [empty, ...activities].map(getOption);

    const onSelectWrap = (activityID: string) => {
      if (activityID === selectedActivity.id) return;
      onSelect(activityID);
    };

    return (
      <RadioInput
        onChange={onSelectWrap}
        value={selectedActivity.id || ''}
        options={options}
      />
    );
  };

  const showEmptyDataMessage = () => {
    // Do nothing?
    return null;
  };

  const getReport = () => {
    const { activities } = userModel.attrs;

    if (!activities.length) {
      return (
        <InfoBackgroundMessage>
          Sorry, no activities data is available at the moment.
        </InfoBackgroundMessage>
      );
    }

    return (
      <IonList id="activities-list" lines="full">
        {showEmptyDataMessage()}
        {getActivitiesList()}
      </IonList>
    );
  };

  return (
    <>
      <InfoMessage
        icon={informationCircleOutline}
        className="blue"
        skipTranslation
      >
        <T>
          Click on the group below which you would like to participate in. Any
          records you add from now on will be submitted to the chosen group. You
          can join in with more groups by logging in to{' '}
          <a href={`${CONFIG.backend.url}`}>ORKS</a> and visiting the Share
          Sightings (ORKS) {'>'} Browse recording groups page.
          <br />
          Pull to refresh the list.
        </T>
      </InfoMessage>

      <IonRefresher slot="fixed" onIonRefresh={syncActivitiesOnPull}>
        <IonRefresherContent pullingIcon={chevronDownOutline} />
      </IonRefresher>

      {getReport()}
    </>
  );
};

export default observer(Activities);
