import { observer } from 'mobx-react';
import GroupsList from 'common/Components/GroupsList';
import { Main, Page, useToast } from 'common/flumens';
import appModel from 'common/models/app';

const GroupsController = () => {
  const toast = useToast();

  const setGroupLock = (groupId: string) => {
    groupId &&
      toast.success(
        'Any records you add from now on will be submitted to the chosen activity.',
        { color: 'secondary' }
      );

    appModel.setAttrLock('smp', 'groupId', groupId);
  };

  return (
    <Page id="precise-area-count-edit-group">
      <Main className="[--padding-top:50px]">
        <GroupsList onSelect={setGroupLock} allowToJoin />
      </Main>
    </Page>
  );
};

export default observer(GroupsController);
