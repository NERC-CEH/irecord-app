import { useRef, useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { closeOutline, searchOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import {
  IonIcon,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from '@ionic/react';
import { Button } from 'common/flumens';
import Group, { RemoteAttributes } from 'common/models/group';
import AllGroups from './All';
import CurrentGroups from './Current';

type Props = {
  currentValue?: string;
  onRefresh: any;
  setGroup: any;
  onJoinGroup: any;
  onLeaveGroup: any;
  groups: Group[];
  remoteGroups: RemoteAttributes[];
};

const GroupsList = ({
  currentValue,
  setGroup,
  onRefresh,
  remoteGroups,
  groups,
  onJoinGroup,
  onLeaveGroup,
}: Props) => {
  const searchbarRef = useRef<any>(null);
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (newSegment === 'all' && !remoteGroups.length) onRefresh('all');
    if (newSegment === 'joined' && !groups.length) onRefresh('joined');
  };

  const [reachedTopOfList, setReachedTopOfList] = useState(true);

  const onScroll = ({ scrollOffset }: any) =>
    setReachedTopOfList(scrollOffset < 80);

  const refreshGroups = async (e: any) => {
    e?.detail?.complete(); // refresh pull update
    onRefresh(segment);
  };

  const [showSearch, setShowSearch] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const onSearch = (e: any) => {
    setCurrentSearch(e.detail.value);
  };

  const bySearchPhrase = (group: RemoteAttributes) =>
    !currentSearch ||
    group.title.toLowerCase().includes(currentSearch.toLowerCase());
  const allGroupsFiltered = remoteGroups.filter(bySearchPhrase);

  const onJoinGroupWrap = async (groupId: string) => {
    await onJoinGroup(groupId);
    setCurrentSearch('');
    setShowSearch(false);
    setSegment('joined');
  };

  return (
    <>
      <IonRefresher
        slot="fixed"
        disabled={segment === 'all' && !reachedTopOfList}
        onIonRefresh={refreshGroups}
      >
        <IonRefresherContent />
      </IonRefresher>

      {onJoinGroup && (
        <IonToolbar className="fixed top-[env(safe-area-inset-top)] text-black [&.ios]:[--background:var(--ion-page-background)] [&.md]:shadow-[-1px_2px_7px_0_#0000001a,0_2px_9px_0_#3e396b1a] [&.md]:[--background:white]">
          <div className="flex w-full items-center justify-end gap-2">
            <IonSearchbar
              placeholder="Activity name"
              className={clsx('!py-0 pr-0', !showSearch && 'hidden')}
              onIonChange={onSearch}
              ref={searchbarRef}
              value={currentSearch}
            />

            {!showSearch && (
              <>
                <IonSegment
                  onIonChange={onSegmentClick}
                  value={segment}
                  className="mx-0"
                >
                  <IonSegmentButton value="joined">
                    <IonLabel className="ion-text-wrap">
                      <T>My activities</T>
                    </IonLabel>
                  </IonSegmentButton>

                  <IonSegmentButton value="all">
                    <IonLabel className="ion-text-wrap">
                      <T>All activities</T>
                    </IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </>
            )}

            <Button
              fill="clear"
              className="!bg-transparent py-0"
              shape="round"
              onPress={() => {
                setCurrentSearch('');
                setShowSearch(!showSearch);

                if (!showSearch)
                  setTimeout(() => searchbarRef.current.setFocus(), 300); // searchbar is hidden and needs to "unhide" before we can set focus
              }}
            >
              <IonIcon
                icon={showSearch ? closeOutline : searchOutline}
                className="size-6"
              />
            </Button>
          </div>
        </IonToolbar>
      )}

      {segment === 'joined' && (
        <CurrentGroups
          currentValue={currentValue}
          onSelect={setGroup}
          onLeave={onLeaveGroup}
          searchPhrase={currentSearch}
        />
      )}

      {segment === 'all' && (
        <AllGroups
          groups={allGroupsFiltered}
          onJoin={onJoinGroupWrap}
          onScroll={onScroll}
        />
      )}
    </>
  );
};

export default observer(GroupsList);
