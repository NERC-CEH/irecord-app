import { useRef, useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { closeOutline, searchOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
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
import Group from 'common/models/group';
import AllGroups from './All';
import UserGroups from './User';

type Props = {
  currentValue?: string;
  onRefresh: (type: 'member' | 'joinable') => void;
  setGroup: any;
  onJoinGroup?: (group: Group) => void;
  onLeaveGroup: (group: Group) => void;
  memberGroups: Group[];
  joinableGroups: Group[];
};

const GroupsList = ({
  currentValue,
  setGroup,
  onRefresh,
  joinableGroups,
  memberGroups,
  onJoinGroup,
  onLeaveGroup,
}: Props) => {
  const { t } = useTranslation();
  const searchbarRef = useRef<any>(null);
  const [segment, setSegment] = useState<'joined' | 'all'>('joined');

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);

    if (newSegment === 'all' && !joinableGroups.length) onRefresh('joinable');
    if (newSegment === 'joined' && !memberGroups.length) onRefresh('member');
  };

  const [reachedTopOfList, setReachedTopOfList] = useState(true);

  const onScroll = ({ scrollOffset }: any) =>
    setReachedTopOfList(scrollOffset < 80);

  const refreshGroups = async (e: any) => {
    e?.detail?.complete(); // refresh pull update

    onRefresh(segment === 'joined' ? 'member' : 'joinable');
  };

  const [showSearch, setShowSearch] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const onSearch = (e: any) => {
    setCurrentSearch(e.detail.value);
  };

  const bySearchPhrase = (group: Group) =>
    !currentSearch ||
    group.data.title.toLowerCase().includes(currentSearch.toLowerCase());

  const joinableGroupsFiltered = joinableGroups.filter(bySearchPhrase);
  const memberGroupsFiltered = memberGroups.filter(bySearchPhrase);

  const onJoinGroupWrap = async (group: Group) => {
    await onJoinGroup!(group);
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
              placeholder={t('Activity name')}
              className={clsx('!py-0 pr-0', !showSearch && 'hidden')}
              onIonChange={onSearch}
              ref={searchbarRef}
              value={currentSearch}
            />

            {!showSearch && (
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
        <UserGroups
          currentValue={currentValue}
          onSelect={setGroup}
          onLeave={onLeaveGroup}
          groups={memberGroupsFiltered}
        />
      )}

      {segment === 'all' && (
        <AllGroups
          groups={joinableGroupsFiltered}
          onJoin={onJoinGroupWrap}
          onScroll={onScroll}
        />
      )}
    </>
  );
};

export default observer(GroupsList);
