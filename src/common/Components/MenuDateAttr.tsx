import { calendarOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { DatetimeButton, type DatetimeButtonProps } from '@flumens';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';

type Props = {
  label: any;
  icon?: any;
} & DatetimeButtonProps;

const MenuDateAttr = ({
  id = '',
  label,
  icon = calendarOutline,
  ...props
}: Props) => (
  <IonItem
    className="w-full pe-ion-i-2! [--border-color:var(--color-neutral-200)]"
    lines="full"
  >
    <IonIcon src={icon} slot="start" />
    <IonLabel className="opacity-100!">
      <T>{label}</T>
    </IonLabel>

    <DatetimeButton id={`${id}${label}`} showPrettyDates {...props} />
  </IonItem>
);

export default MenuDateAttr;
