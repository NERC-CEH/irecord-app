import { useMemo } from 'react';
import { Badge, VirtualList, useAlert } from '@flumens';
import { IonItem, IonList } from '@ionic/react';
import { RemoteAttributes } from 'models/group';
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
  data: { groups: RemoteAttributes[]; onOpen: any };
}) => {
  const group: RemoteAttributes = groups[index];

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
        <div className="line-clamp-1 font-bold">{group.title}</div>

        {!!group.description && (
          <div className="line-clamp-1 text-balance border-t border-solid border-[var(--background)] text-sm text-black/70">
            {group.description}
          </div>
        )}
      </div>
    </IonItem>
  );
};

type Props = {
  onScroll: any;
  groups: RemoteAttributes[];
  onJoin: (groupId: string) => void;
};

const AllGroups = ({ groups, onJoin, onScroll }: Props) => {
  const alert = useAlert();

  const onOpen = useMemo(
    () => (group: RemoteAttributes) =>
      alert({
        header: group.title,
        message: (
          <div className="flex flex-col gap-1">
            {!!group.description && (
              <div className="text-balance border-t border-solid border-[var(--background)] text-sm text-black/70">
                {group.description}
              </div>
            )}

            <div className="mt-2">
              {!!group.fromDate && (
                <div>
                  From: <Badge>{new Date(group.fromDate).toDateString()}</Badge>
                </div>
              )}
              {!!group.toDate && (
                <div>
                  To: <Badge>{new Date(group.toDate).toDateString()}</Badge>
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
            handler: () => onJoin(group.id),
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
