import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Button } from '@flumens';
import { isPlatform } from '@ionic/react';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  onClick: any;
  onLongClick?: any;
  value: number;
  disabled?: boolean;
}

const IncrementalButton = ({
  onClick: onClickProp,
  onLongClick: onLongClickProp,
  value,
  disabled,
}: Props) => {
  const isNumber = Number.isFinite(value);

  const onClick = () => {
    if (disabled || !isNumber) return;

    onClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  const onLongClick = () => {
    if (disabled || !isNumber) return;

    if (!onLongClickProp) {
      onClickProp();
      return;
    }

    onLongClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  let valueItem;
  if (isNumber) {
    valueItem = <AnimatedNumber value={value} />;
  } else if (value) {
    valueItem = <span className="empty">{value}</span>;
  } else {
    valueItem = <span className="empty">N/A</span>;
  }

  return (
    <Button
      className="relative m-0 h-full w-[62px] shrink-0 rounded-none border-0 border-r border-solid !border-gray-100 p-0 text-lg font-normal text-[var(--color-tertiary-800)] [&>*]:h-full"
      onPress={onClick}
      fill="clear"
      onLongPress={onLongClick}
      preventDefault
    >
      {valueItem}
      <div className="label-divider" />
    </Button>
  );
};

export default IncrementalButton;
