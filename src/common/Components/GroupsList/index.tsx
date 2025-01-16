import { useState } from 'react';
import { device, useLoader, useToast } from 'common/flumens';
import appModel from 'common/models/app';
import groups from 'common/models/collections/groups';
import {
  fetch as fetchAllGroups,
  join,
  leave,
} from 'common/models/collections/groups/service';
import { RemoteAttributes } from 'models/group';
import { useUserStatusCheck } from 'models/user';
import List from './List';

type Props = { allowToJoin?: boolean; onSelect?: (groupId: string) => void };

const GroupsList = ({ onSelect, allowToJoin = false }: Props) => {
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  // eslint-disable-next-line
  groups.length; // to force refresh when groups list is updated

  const [allRemoteGroups, setAllGroups] = useState<RemoteAttributes[]>([]);

  const currentValue = appModel.getAttrLock('smp', 'groupId');

  const joinGroup = async (groupId: string) => {
    console.log('Activities joining', groupId);

    try {
      await loader.show('Please wait...');
      await join(groupId);
      await groups.fetchRemote();
      const docs = await fetchAllGroups({});
      setAllGroups(docs);

      const allGroupsWithoutTheJoined = allRemoteGroups.filter(
        ({ id }: RemoteAttributes) => id !== groupId
      );
      setAllGroups(allGroupsWithoutTheJoined);
      toast.success('Successfully joined the activity.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const leaveGroup = async (groupId: string) => {
    console.log('Activities leaving', groupId);

    try {
      await loader.show('Please wait...');
      await leave(groupId);
      await groups.fetchRemote();
      const docs = await fetchAllGroups({});
      setAllGroups(docs);

      appModel.unsetAttrLock('smp', 'groupId');

      toast.success('Successfully left the activity.');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  const refreshGroups = async (type: 'joined' | 'all') => {
    console.log('Groups refreshing', type);

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    try {
      await loader.show('Please wait...');

      if (type === 'all') {
        const docs = await fetchAllGroups({});
        setAllGroups(docs);
      } else {
        await groups.fetchRemote();
      }
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  return (
    <List
      currentValue={currentValue}
      groups={groups}
      remoteGroups={allRemoteGroups}
      setGroup={onSelect}
      onJoinGroup={allowToJoin && joinGroup}
      onLeaveGroup={leaveGroup}
      onRefresh={refreshGroups}
    />
  );
};

export default GroupsList;
