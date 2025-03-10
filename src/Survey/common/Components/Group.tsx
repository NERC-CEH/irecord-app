import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Main, Header, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import GroupsList from 'common/Components/GroupsList';
import Sample from 'models/sample';

const Group = () => {
  const { goBack } = useContext(NavContext);
  const { sample } = useSample<Sample>();
  if (!sample) return null;

  const onSelect = async (groupId: string) => {
    // eslint-disable-next-line no-param-reassign
    sample.data.groupId = groupId;
    await sample.save();
    goBack();
  };

  return (
    <Page id="survey-default-edit-group">
      <Header title="Activity" />
      <Main>
        <GroupsList onSelect={onSelect} />
      </Main>
    </Page>
  );
};

export default observer(Group);
