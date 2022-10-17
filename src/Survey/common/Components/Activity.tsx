import { FC, useContext } from 'react';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';
import appModel from 'models/app';
import userModel from 'models/user';
import { Page, Main, Header } from '@flumens';
import { observer } from 'mobx-react';
import ActivitiesList from 'Components/ActivitiesList';

type Props = {
  sample: Sample;
};

const Activity: FC<Props> = ({ sample }) => {
  const { goBack } = useContext(NavContext);

  const onSelect = async (activityID: string) => {
    const activity = userModel.getActivity(activityID);
    // eslint-disable-next-line no-param-reassign
    sample.attrs.activity = activity;
    sample.samples.forEach(subSample => {
      subSample.attrs.activity = activity; // eslint-disable-line
    });
    await sample.save();
    goBack();
  };

  return (
    <Page id="survey-default-edit-activity">
      <Header title="Activity" />
      <Main>
        <ActivitiesList
          userModel={userModel}
          appModel={appModel}
          onSelect={onSelect}
          sample={sample}
        />
      </Main>
    </Page>
  );
};

export default observer(Activity);
