import { useMemo } from 'react';
import { Trans as T } from 'react-i18next';
import { Badge, VirtualList, useAlert } from '@flumens';
import { IonItem, IonList } from '@ionic/react';
import Group from 'models/group';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

// https://stackoverflow.com/questions/47112393/getting-the-iphone-x-safe-area-using-javascript
const rawSafeAreaTop =
  getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
const SAFE_AREA_TOP = parseInt(rawSafeAreaTop.replace('px', ''), 10);
const LIST_PADDING = 10 + SAFE_AREA_TOP;
const LIST_ITEM_HEIGHT = 75 + 10; // 10px for padding

const Item = ({
  index,
  data: { groups, onOpen },
  ...itemProps
}: {
  index: number;
  data: { groups: Group[]; onOpen: any };
}) => {
  const group: Group = groups[index];

  return (
    <IonItem
      className="max-h-[73px] rounded-md border border-solid border-neutral-300 [--min-height:73px]"
      key={group.id}
      style={(itemProps as any).style}
      lines="none"
      detail
      onClick={() => onOpen(group)}
    >
      <div className="flex flex-col gap-1">
        <div className="line-clamp-1 font-bold">{group.data.title}</div>

        {!!group.data.description && (
          <div className="line-clamp-1 text-balance border-t border-solid border-[var(--background)] text-sm text-black/70">
            {group.data.description}
          </div>
        )}
      </div>
    </IonItem>
  );
};

type Props = {
  onScroll: any;
  groups: Group[];
  onJoin: (group: Group) => void;
};

const AllGroups = ({ groups, onJoin, onScroll }: Props) => {
  const alert = useAlert();

  const onOpen = useMemo(
    () => (group: Group) =>
      alert({
        header: group.data.title,
        message: (
          <div className="flex flex-col gap-1">
            {!!group.data.description && (
              <div className="text-balance border-t border-solid border-[var(--background)] text-sm text-black/70">
                {group.data.description}
              </div>
            )}

            {group.data.joiningMethod === 'R' && (
              <div className="text-sm italic text-black/70">
                <T>
                  This activity requires administrator approval for membership
                  requests.
                </T>
              </div>
            )}

            <div className="mt-2">
              {!!group.data.fromDate && (
                <div>
                  <T>From</T>:{' '}
                  <Badge skipTranslation>
                    {new Date(group.data.fromDate).toDateString()}
                  </Badge>
                </div>
              )}
              {!!group.data.toDate && (
                <div>
                  <T>To</T>:{' '}
                  <Badge skipTranslation>
                    {new Date(group.data.toDate).toDateString()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Join',
            handler: () => onJoin(group),
          },
        ],
      }),
    [onJoin]
  );

  const groupsMemo = useMemo(() => ({ groups, onOpen }), [groups, onOpen]);

  if (!groups.length)
    return (
      <InfoBackgroundMessage>
        There are currently no new activities available to join.
        <br />
        <br />
        Pull the page down to refresh the list.
      </InfoBackgroundMessage>
    );

  return (
    <IonList className="h-full">
      <VirtualList
        itemCount={groups.length}
        itemSize={() => LIST_ITEM_HEIGHT}
        itemData={groupsMemo}
        Item={Item}
        topPadding={LIST_PADDING}
        bottomPadding={LIST_ITEM_HEIGHT / 2}
        onScroll={onScroll}
      />
    </IonList>
  );
};

export default AllGroups;
