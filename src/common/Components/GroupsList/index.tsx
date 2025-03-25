import { observer } from 'mobx-react';
import {
  byGroupMembershipStatus,
  device,
  useLoader,
  useToast,
} from 'common/flumens';
import appModel from 'common/models/app';
import groups from 'common/models/collections/groups';
import Group from 'models/group';
import { useUserStatusCheck } from 'models/user';
import List from './List';

type Props = {
  currentValue?: any;
  allowToJoin?: boolean;
  onSelect?: (groupId: string) => void;
};

const GroupsList = ({
  onSelect,
  allowToJoin = false,
  currentValue: currentValueProp,
}: Props) => {
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  // eslint-disable-next-line
  groups.length; // to force refresh when groups list is updated

  const currentValue =
    currentValueProp || appModel.getAttrLock('smp', 'groupId');

  const joinGroup = async (group: Group) => {
    console.log('Activities joining', group.id);

    try {
      await loader.show('Please wait...');
      await group.join();
      await groups.fetchRemote({ type: 'member', form: ['enter-app-record'] });
      await groups.fetchRemote({
        type: 'pending' as any,
        form: ['enter-app-record'],
      });
      await groups.fetchRemote({
        type: 'joinable',
        form: ['enter-app-record'],
      });

      toast.success('Successfully joined the activity.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const leaveGroup = async (group: Group) => {
    console.log('Activities leaving', group.id);

    try {
      await loader.show('Please wait...');
      await group.leave();
      await groups.fetchRemote({ type: 'member', form: ['enter-app-record'] });
      await groups.fetchRemote({
        type: 'pending' as any,
        form: ['enter-app-record'],
      });
      await groups.fetchRemote({
        type: 'joinable',
        form: ['enter-app-record'],
      });

      appModel.unsetAttrLock('smp', 'groupId');

      toast.success('Successfully left the activity.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const refreshGroups = async (type: 'member' | 'joinable') => {
    console.log('Groups refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await groups.fetchRemote({ type, form: ['enter-app-record'] });
      if (type === 'member') {
        await groups.fetchRemote({
          type: 'pending' as any,
          form: ['enter-app-record'],
        });
      }
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const byTitle = (group1: Group, group2: Group) =>
    group1.data.title?.localeCompare(group2.data.title);

  const memberGroups = groups
    .filter(byGroupMembershipStatus('member'))
    .sort(byTitle);
  const joinableGroups = groups
    .filter(byGroupMembershipStatus('joinable'))
    .sort(byTitle);

  return (
    <List
      currentValue={currentValue}
      memberGroups={memberGroups}
      joinableGroups={joinableGroups}
      setGroup={onSelect}
      onJoinGroup={allowToJoin ? joinGroup : undefined}
      onLeaveGroup={leaveGroup}
      onRefresh={refreshGroups}
    />
  );
};

export default observer(GroupsList);
