import clsx from 'clsx';
import { useTranslation, Trans as T } from 'react-i18next';
import { RadioOption } from '@flumens';
import {
  IonList,
  IonRadioGroup,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonRadio,
} from '@ionic/react';
import groups from 'common/models/collections/groups';
import Group from 'common/models/group';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  currentValue?: string;
  onSelect: any;
  onLeave: any;
};

const UserGroups = ({ currentValue, onSelect, onLeave }: Props) => {
  const { t } = useTranslation();

  const getOption = (group: Group) => ({
    value: group.id!,
    label: group.attrs.title,
  });

  const groupOptions: RadioOption[] = groups.map(getOption);

  groupOptions.unshift({
    value: '',
    label: t('Not linked to any activity'),
  });

  const getGroupOption = (p: any) => {
    const onLeaveGroupWrap = () => onLeave(p?.value);

    const isSelected = currentValue === p.value;

    return (
      <IonItemSliding
        key={p.value}
        className={clsx(
          'my-3 rounded-md border border-solid',
          !p.value && 'opacity-70',
          isSelected ? 'border-[var(--form-value-color)]' : 'border-neutral-300'
        )}
        disabled={!p.value}
      >
        <IonItem
          className={clsx(
            '!m-0 !rounded-none !border-none ![--border-radius:0]',
            isSelected &&
              'bg-white text-[var(--form-value-color)] [--background:rgba(var(--color-tertiary-900-rgb),0.02)] [--ion-color-primary:var(--form-value-color)]'
          )}
        >
          <IonRadio labelPlacement="start" value={p.value} mode="ios">
            {p.label}
          </IonRadio>
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
    <IonList lines="full" className="radio-input-attr">
      <IonRadioGroup
        value={currentValue}
        onIonChange={(e: any) => onSelect(e.detail.value)}
      >
        {groupOptions.map(getGroupOption)}
      </IonRadioGroup>
    </IonList>
  );
};

export default UserGroups;
