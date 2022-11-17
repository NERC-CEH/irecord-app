import { FC } from 'react';
import { Page, Main, useToast } from '@flumens';
import appModel from 'models/app';
import userModel from 'models/user';
import { observer } from 'mobx-react';
import ActivitiesList from 'Components/ActivitiesList';
import './styles.scss';

const Container: FC = () => {
  const toast = useToast();

  const onSelect = (activityID: string) => {
    activityID &&
      toast.success(
        'Any records you add from now on will be submitted to the chosen activity.',
        {
          color: 'secondary',
        }
      );

    appModel.setAttrLock('smp', 'activity', userModel.getActivity(activityID));
  };

  return (
    <Page id="home-activities">
      <Main>
        <ActivitiesList
          userModel={userModel}
          appModel={appModel}
          onSelect={onSelect}
        />
      </Main>
    </Page>
  );
};

export default observer(Container);
