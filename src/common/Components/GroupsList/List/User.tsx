import { useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { useTranslation, Trans as T } from 'react-i18next';
import {
  IonList,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/react';
import { RadioInput } from 'common/flumens';
import Group from 'common/models/group';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  currentValue?: string;
  onSelect: any;
  onLeave: (group: Group) => void;
  groups: Group[];
};

const UserGroups = ({
  currentValue: currentValueProp,
  onSelect,
  onLeave,
  groups,
}: Props) => {
  const { t } = useTranslation();

  // force update the radio styles
  const [currentValue, forceRefresh] = useState(currentValueProp);

  const onSelectWrap = (newValue: any) => {
    onSelect(newValue);
    forceRefresh(newValue);
  };

  const groupOptions: (Group | null)[] = [...groups];
  groupOptions.unshift(null); // add

  const getGroupOption = (group: Group | null) => {
    let value = group?.id;
    let label = group?.data?.title;

    if (!group) {
      value = '';
      label = t('Not linked to any activity');
    }

    const onLeaveGroupWrap = () => onLeave(group!);

    const isSelected = currentValue === value;

    const isMembershipPending = group?.data.userIsPending === 't';

    return (
      <IonItemSliding
        key={value}
        className={clsx(
          'rounded-md border border-solid',
          !value && 'opacity-70',
          isSelected ? 'border-[var(--form-value-color)]' : 'border-neutral-300'
        )}
        disabled={!value}
      >
        <IonItem
          className={clsx(
            '!m-0 !rounded-none !border-none ![--border-radius:0] [--inner-padding-end:0px] [--padding-start:0px]',
            isSelected &&
              'bg-white text-[var(--form-value-color)] [--background:rgba(var(--color-tertiary-900-rgb),0.02)] [--ion-color-primary:var(--form-value-color)]'
          )}
        >
          <RadioInput.Option
            label={
              isMembershipPending
                ? `${label} (${t('Membership pending')})`
                : label
            }
            value={value!}
            className="w-full border-none"
            key={label}
            isDisabled={isMembershipPending}
          />
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption color="danger" onClick={onLeaveGroupWrap}>
            <T>Leave</T>
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

  if (!groups.length)
    return (
      <InfoBackgroundMessage>
        You haven't joined any activities yet. Go to the "All activities" tab to
        join an activity.
        <br />
        <br />
        Pull the page down to refresh the list.
      </InfoBackgroundMessage>
    );

  return (
    <IonList lines="full" className="mt-4">
      <RadioInput
        onChange={onSelectWrap}
        value={currentValue}
        allowEmptySelection
      >
        {groupOptions.map(getGroupOption)}
      </RadioInput>
    </IonList>
  );
};

export default observer(UserGroups);
